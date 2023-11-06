const generateCookie = (user, res) => {


    const token = user.generateJwtToken();

    const options = {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        domain: '.onrender.com',
        sameSite: 'None',
        secure: true,
        httpOnly: true,
    }

    res.status(200).cookie('token', token, options).json({ token, success: true, user });
}

module.exports = generateCookie;