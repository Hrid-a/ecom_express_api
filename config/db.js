const mongoose = require('mongoose');


module.exports = () => {
    mongoose
        .connect(process.env.DATABASE_URL)
        .then(() => console.log('CONNECTION TO DB ESTABLISHED SUCCESSFULLY'))
        .catch((error) => {
            console.log('CONNECTION FAILD');
            console.log('ERROR:', error.message);
            process.exit(1);
        });
}


