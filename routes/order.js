const express = require('express');
const { createOrder, getMyOrders, getMyOrder, allOrders, getOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const { isLoggedIn, isAdmin } = require('../middlewares/user');
const router = express.Router();


router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/myorders').get(isLoggedIn, getMyOrders);
router.route('/order/:orderId').get(isLoggedIn, getMyOrder);

// admin routes

router.route('/admin/orders').get(isLoggedIn, isAdmin, allOrders);
router
    .route('/admin/order/:orderId')
    .get(isLoggedIn, isAdmin, getOrder)
    .put(isLoggedIn, isAdmin, updateOrder)
    .delete(isLoggedIn, isAdmin, deleteOrder)

module.exports = router;