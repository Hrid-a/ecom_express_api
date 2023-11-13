const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: [true, "Please enter Your First Name"],
        trim: true,
        minLength: [3, "The name must be at least 3 characters"],
        maxLength: [20, "The name must be at most 20 characters"]
    },
    lastName: {
        type: String,
        required: [true, "Please enter Your Last Name"],
        trim: true,
        minLength: [3, "The name must be at least 3 characters"],
        maxLength: [20, "The name must be at most 20 characters"]
    },
    email: {
        type: String,
        required: [true, "Please enter Your Email"],
        validate: [validator.isEmail, "Please enter a valid email"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Please enter Your Password"],
        minLength: [6, "The password must be at least 6 characters"],
        select: false
    },
    role: {
        type: String,
        default: "user"
    },
    image: {
        id: {
            type: String,
            default: "users/v2weu8hlihuch4gw2cjp"
        },
        url: {
            type: String,
            default: "https://res.cloudinary.com/dmi9ztfss/image/upload/v1695924448/users/mflha3s2cmehvttdubl7.jpg"
        }
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiration: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

userSchema.pre("save", async function (next) {

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
});

userSchema.methods.isValidePassword = async function (userEnteredPassword) {

    return await bcrypt.compare(userEnteredPassword, this.password);
}

userSchema.methods.generateJwtToken = function () {

    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d"
    });
}

userSchema.methods.getForgottenPasswordToken = function () {

    const forgotPassword = crypto.randomBytes(20).toString('hex');

    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotPassword).digest('hex');
    this.forgotPasswordTokenExpiration = Date.now() + 20 * 60 * 1000;
    return forgotPassword;
}

module.exports = mongoose.model('user', userSchema);