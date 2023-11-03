const app = require('./app');
const connectToDb = require('./config/db');
const cloudinary = require('cloudinary');


process.on("uncaughtException", (err) => {

    server.close(() => {
        process.exit(1);
    });
})

connectToDb();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});


const server = app.listen(process.env.PORT, () => console.log(`listening on ${process.env.PORT}`));

process.on("unhandledRejection", (err) => {

    server.close(() => {
        process.exit(1);
    });
})

