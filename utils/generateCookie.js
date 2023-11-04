const generateCookie = (user, res) => {


    const token = user.generateJwtToken();

    const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        origin: "https://ecom-app-siz3.onrender.com"
    }

    res.status(200).cookie('token', token, options).json({ token, success: true, user });
}

module.exports = generateCookie;