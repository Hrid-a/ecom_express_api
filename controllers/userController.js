const apiPromise = require('../middlewares/apiPromise');
const CustomError = require('../utils/CustomError');
const User = require('../models/user');
const cloudinary = require('cloudinary');
const generateCookie = require('../utils/generateCookie');
const mailSend = require('../utils/mailSend');

exports.signup = apiPromise(async (req, res, next) => {

    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !lastName || !password) return next(new CustomError('All fileds are required', 400));
    const data = { email, password, lastName, firstName };

    if (req.files?.image) {
        const file = req.files.image;
        const result = await
            cloudinary.v2.uploader
                .upload(file.tempFilePath, {
                    folder: "users",
                })

        data.image = {
            id: result.public_id,
            url: result.secure_url
        };
    }


    const existingUser = await User.findOne({ email });

    if (existingUser) return next(new CustomError("The user Already exists", 400));
    const user = await User.create(data);
    // if (!user) return next(new CustomError("Unkonw Error", 500));

    res.status(200).json({
        success: true, message: "The user has been created successfully", user
    });

});

exports.login = apiPromise(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) return next(new CustomError("All fields are required", 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new CustomError("Wrong Email or Password", 400));

    const isPasswordCorrect = await user.isValidePassword(req.body.password);
    if (!isPasswordCorrect) return next(new CustomError("Wrong Email or Password", 400));
    user.password = undefined;
    generateCookie(user, res);
});

exports.logout = apiPromise(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: ".onrender.com"
    }).json({ "success": true, "message": "Logged out successfully" });
})

exports.forgotPassword = apiPromise(async (req, res, next) => {

    const { email } = req.body;

    if (!email) return next(new CustomError("Please Enter Your Email Address"));

    const user = await User.findOne({ email });

    if (!user) return next(new CustomError("That address either Invalid or not associated with a personal user account", 400));

    const forgotPasswordToken = await user.getForgottenPasswordToken();
    await user.save({ validateBeforeSave: false });

    const RESET_PASS_URL = `${req.protocol}::/${req.get("host")}api/v1/resetPassword/${forgotPasswordToken}`;
    const message = `Please copy and the pase this link into your URL \n\n ${RESET_PASS_URL}`;
    const subject = "Password Reset - AHMED";

    try {
        await mailSend(user.email, subject, message);
        res.status(200).send({ success: true, message: 'The email was sent successfully' });
    }
    catch (e) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiration = undefined;
        await user.save({ validateBeforeSave: false });
        next(new CustomError(e.message, 500));
    }

});

exports.resetPassword = apiPromise(async (req, res, next) => {

    const { token } = req.params;

    if (!token) return next(new CustomError("Please provide the sent token", 400));

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiration: {
            $gt: Date.now()
        }
    });

    if (!user) return next(new CustomError("Invalid or Expired token", 400));

    if (req.body.password !== req.body.confirmedPassword) return next(new CustomError("The password and confirm password does not match", 400));

    user.password = req.body.password;
    await user.save({ validateBeforeSave: true });
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiration = undefined;
    generateCookie(user, res);

});

exports.loggedInUserInfo = apiPromise(async (req, res, next) => {

    res.status(200).json({ success: true, user: req.user });
});

exports.changePassword = apiPromise(async (req, res, next) => {

    const user = await User.findById(req.user._id).select("+password");

    if (!user) return next(new CustomError("User not found", 400));

    const isPasswordCorrect = await user.isValidePassword(req.body.password);
    if (!isPasswordCorrect) return next(new CustomError("Invalid password", 400));

    user.password = req.body.newPassword;
    user.save({ validateBeforeSave: true });

    res.status(200).json({ success: true, message: "Password changed successfully" });
});

exports.updateUserInfo = apiPromise(async (req, res, next) => {

    const { email, firstName, lastName } = req.body;
    if (!email || !firstName || !lastName) return next(new CustomError("all fields are required", 400));

    const data = { email, firstName, lastName };

    if (req.files) {
        const imageId = req.user.image.id;
        await cloudinary.v2.uploader.destroy(imageId);

        const file = req.files.file;

        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "users"
        });

        data.image = { id: result.public_id };
    }


    const user = await User.findByIdAndUpdate(req.user._id, data, {
        new: true,
        runValidators: true,
    })

    if (!user) return next(new CustomError("user info has not been updated"));

    res.status(200).json({ user, success: true, message: "Your information updated successfuly" });
});


// admin controllers

exports.allUsers = apiPromise(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({ users, success: true });
})

exports.getSingleUserInfo = apiPromise(async (req, res, next) => {

    const userId = req.params.userId;
    if (!userId) return next(new CustomError('Provide a User Id', 400));

    const user = await User.findById(userId);
    if (!user) return next(new CustomError('User not found', 404));

    res.status(200).json({ success: true, user });

});

exports.deletaUserAccount = apiPromise(async (req, res, next) => {

    const { userId } = req.params;
    if (!userId) return next(new CustomError('Provide a User Id', 400));
    const user = await User.findByIdAndRemove(userId);

    if (!user) return next(new CustomError('user not found', 404));

    res.status(200).json({ success: true, message: "user has been removed successfully" });

})

