const apiPromise = require('../middlewares/apiPromise');
const CustomError = require('../utils/CustomError');
const Product = require('../models/product');
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');


exports.addProduct = apiPromise(async (req, res, next) => {
    const { name, price, description, category, stock } = req.body;
    if (!name || !price || !description || !category || !stock) return next(new CustomError('all Fileds are required', 400));
    const imgArray = [];

    if (!req.files) return next(new CustomError('You should add at least one image', 400));

    if (req.files?.images) {
        for (let i = 0; i < req.files.images.length; i++) {

            result = await cloudinary.v2.uploader.upload(req.files.images[i].tempFilePath, {
                folder: "products"
            })

            imgArray.push({
                imageId: result.public_id,
                imageSrc: result.secure_url
            });
        }
    }

    req.body.user = req.user._id;
    req.body.images = imgArray;
    const product = await Product.create(req.body);

    if (!product) return next(new CustomError('product creation failed', 400))

    res.status(200).json({ success: true, message: "product has been created successfully" });

});

exports.allProducts = apiPromise(async (req, res, next) => {
    const resultPerPage = 7;
    const totalProducts = await Product.countDocuments();
    const productsObj = new WhereClause(Product.find(), req.query).search().filter().paginator(resultPerPage);

    const products = await productsObj.base;

    res.status(200).json({ success: true, totalProducts, products });
});

exports.singleProduct = apiPromise(async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) return next(new CustomError('Provide a product identifier', 400));

    const product = await Product.findById(productId).populate("user", "image");
    if (!product) return next(new CustomError('Product no found', 404));

    res.status(200).json({ success: true, product });
})

exports.addReview = apiPromise(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    if (!rating || !comment) return next(new CustomError('All fields are required'));

    const product = await Product.findById(productId);
    if (!product) return next(new CustomError('product not found', 400));

    const reviews = {
        user: req.user._id,
        rating: Number(rating),
        comment: comment,
        name: req.user.firstName
    };

    const alreadyReviewed = product.reviews.find(
        review => review.user.toString() === req.user._id.toString());

    if (alreadyReviewed) {

        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = Number(rating);
            }
        });
    } else {
        product.reviews.push(reviews);
        product.numberOfReviews = product.reviews.length;
    }
    product.ratings = product.reviews.reduce((item, current) => item.rating + current, 0) / product.numberOfReviews;

    product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'review added successfully' });

})

exports.deleteReview = apiPromise(async (req, res, next) => {

    const { productId } = req.query;

    const product = await Product.findById(productId);
    if (!product) return next(new CustomError('Review did not updated successfully', 400));

    const reviews = product.reviews.filter(review => review.user.toString() !== req.user._id.toString());
    const numberOfReviews = reviews.length;
    const ratings = reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

    await Product.findByIdAndUpdate(productId, { ratings, reviews, numberOfReviews }, {
        new: true,
        runValidators: true,
        usefindAndModify: false,
    })

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
})


exports.adminProducts = apiPromise(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({ success: true, products });
})

exports.updateProduct = apiPromise(async (req, res, next) => {

    const { productId } = req.params;
    const { name, description, price, category, stock } = req.body;
    const imageArray = [];
    if (!name || !description || !price || !category || !stock) return next(new CustomError("all Fields are required", 400));
    const product = await Product.findById(productId);
    if (!product) return next(new CustomError("Product not found", 401));

    if (req.files) {
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].imageId);
        }

        for (let i = 0; i < req.files.images.length; i++) {

            result = await cloudinary.v2.uploader.upload(req.files.images[i].tempFilePath, {
                folder: "products"
            });

            imageArray.push({ imageId: result.public_id });
        }
    }

    req.body.images = imageArray;
    req.body.user = req.user._id;

    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true, runValidators: true });

    if (!updatedProduct) return next(new CustomError('Product did not updated successfully', 400));

    res.status(200).json({ success: true, message: "The product was updated successfully" });

});

exports.deleteProduct = apiPromise(async (req, res, next) => {

    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return next(new CustomError("Product not found", 404));

    const images = product.images;
    if (images.length) {
        for (let i = 0; i < images.length; i++) {
            await cloudinary.v2.uploader.destroy(images[i].imageId);
        }
    }

    await Product.findByIdAndRemove(productId);

    res.status(200).json({ success: true, message: "product was deleted successfully" });
})