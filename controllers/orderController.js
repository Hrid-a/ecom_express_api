const Order = require('../models/order');
const CustomError = require('../utils/CustomError');
const Product = require('../models/product');
const apiPromise = require('../middlewares/apiPromise');

exports.createOrder = apiPromise(async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        shippingAmount,
        totalAmount,
    } = req.body;

    console.log(req.body);
    if (!shippingInfo.address || !shippingInfo.phone || !shippingInfo.city || !shippingAmount) return next(new CustomError('all fields are required', 400));

    if (!orderItems.length || !totalAmount) return next(new CustomError('It seems that you don\'t have any items in the cart', 400));

    const order = await Order.create({ shippingInfo, orderItems, shippingAmount, totalAmount, user: req.user._id });

    if (!order) return next(new CustomError('order creation failed', 400));

    res.status(200).json({ success: true, message: 'order created successfully', order: order });
});

exports.getMyOrders = apiPromise(async (req, res, next) => {

    const orders = await Order.find({ user: req.user._id });
    if (!orders) return next(new CustomError('You do not have any orders', 400));

    res.status(200).json({ success: true, orders });

});

exports.getMyOrder = apiPromise(async (req, res, next) => {

    const order = await Order.findById(req.params.orderId);

    if (!order) return next(new CustomError('Please check order Id', 400));

    res.status(200).json({ success: true, order });
});

// admin 

exports.allOrders = apiPromise(async (req, res, next) => {

    const orders = await Order.find();

    res.status(200).json({ success: true, orders });
})

exports.getOrder = apiPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId).populate("user", "firstName lastName email");

    if (!order) return next(new CustomError(`Order not found`, 400));
    res.status(200).json({ success: true, order });

});

exports.updateOrder = apiPromise(async (req, res, next) => {

    const order = await Order.findById(req.params.orderId);
    if (!order) return next(new CustomError(`Order not found`, 400));

    const { paymentInfo, orderStatus } = req.body;
    console.log(paymentInfo, orderStatus);
    if (!paymentInfo || !orderStatus) return next(new CustomError('all fields are required', 400));

    if (order.paymentInfo === "paid") return next(new CustomError('The order is already paid', 400));
    if (order.orderStatus === "delivered") return next(new CustomError('The order is already delivered', 400));

    // update the products stock;
    await order.orderItems.forEach(product => (
        updateTheStock(product.product, product.qty)
    ));

    order.paymentInfo = paymentInfo;
    order.orderStatus = orderStatus;

    order.save();

    res.status(200).json({ success: true, message: "the order was successfully updated." });
});

exports.deleteOrder = apiPromise(async (req, res, next) => {

    const order = await Order.findByIdAndRemove(req.params.orderId);

    if (!order) return next(new CustomError("Failed to delete the order", 400));

    res.status(200).json({ success: true, message: "The order was successfully deleted." });
});

async function updateTheStock(productId, quantity) {

    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    product.save();
}