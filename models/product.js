const mongoose = require('mongoose');
const validator = require('validator');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minLength: [4, "The product name must be at least 4 characters"],
        maxLength: [40, "The Product Name should be at most 40 characters"]
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: [120, "The Product Description should be at most 40 characters"]
    },
    category: {
        type: String,
        enum: {
            values: ["decor", "office", "living room"],
            message: "The Product Category should be one of the following values decor, office or living room"
        },
        required: [true, "You must provide a category name"]
    },
    stock: {
        type: Number,
        required: [true, "The Product stock should be provided"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'user',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            }
        }

    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
    },
    images: [
        {
            imageId: {
                type: String,
                required: true,
            },
            imageSrc: {
                type: String,
                required: true,
            }

        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('product', productSchema);