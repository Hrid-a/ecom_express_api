const express = require('express');

const { signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    loggedInUserInfo,
    changePassword,
    updateUserInfo,
    allUsers,
    getSingleUserInfo,
    deletaUserAccount
} = require('../controllers/userController');
const { isLoggedIn, isAdmin } = require('../middlewares/user');
const router = express.Router();


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').post(resetPassword);
router.route('/userDashboard').get(isLoggedIn, loggedInUserInfo);
router.route('/password/update').put(isLoggedIn, changePassword);
router.route('/user/update').put(isLoggedIn, updateUserInfo);


// admin routes
router.route('/users').get(isLoggedIn, isAdmin, allUsers);
router
    .route('/admin/user/:userId')
    .get(isLoggedIn, isAdmin, getSingleUserInfo)
    .delete(isLoggedIn, isAdmin, deletaUserAccount);

module.exports = router;
