const express = require('express');
const {
    addProduct,
    allProducts,
    singleProduct,
    addReview,
    deleteReview,
    adminProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { isLoggedIn, isAdmin } = require('../middlewares/user');
const router = express.Router();

router.route('/products/add').post(isLoggedIn, isAdmin, addProduct);
router.route('/products').get(allProducts);
router.route('/product/:productId').get(singleProduct);
router
    .route('/review')
    .post(isLoggedIn, addReview)
    .delete(isLoggedIn, deleteReview);


// admin routes

router.route('/admin/products').get(isLoggedIn, isAdmin, adminProducts);
router
    .route('/admin/product/:productId')
    .put(isLoggedIn, isAdmin, updateProduct)
    .delete(isLoggedIn, isAdmin, deleteProduct);

module.exports = router;