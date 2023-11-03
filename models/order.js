const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, 'You must provide your address'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'You must provide your city'],
        },
        phone: {
            type: String,
            required: [true, 'You must provide your phone number to confirm your order'],
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            qty: {
                type: Number,
                required: [true, "You should provide the quantity of the products"],
            },
            image: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: [true, "You should provide the price of the products"],
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'product',
                required: true,
            }
        }
    ],
    paymentInfo: {
        type: String,
        default: 'not Paid',
    },
    shippingAmount: {
        type: Number,
        required: [true, "you Should provide a shipping amount"],
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total Amount is Required']
    },
    orderStatus: {
        type: String,
        default: 'processing',
    },
    deliverdAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('order', orderSchema);