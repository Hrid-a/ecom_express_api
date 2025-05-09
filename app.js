require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const CustomError = require('./utils/CustomError');
const morgan = require('morgan');
const globalErrorhandler = require('./controllers/errorController');
const cors = require('cors');

const app = express();

// Docs and docs middleware 

const YAML = require("yamljs");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load("./swagger.yaml");
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const whitelist = [
    "http://localhost:5173",
    "https://ecom-app-siz3.onrender.com"
];

const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {

        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new CustomError('Not allowed by  CORS', 400));
        }
    },
    methods: "GET,HEAD,PUT,POST,DELETE",
    preflightContinue: true,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type'
};

app.use(cors(corsOptions));
// reqular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies & files middlewares
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/"
}))

// morgan middleware
app.use(morgan('tiny'));

// import routes Here
const user = require('./routes/user');
const product = require('./routes/product');
const order = require('./routes/order');

// routes middlewares
app.use("/api/v1/", user);
app.use("/api/v1/", product);
app.use("/api/v1/", order);

app.all("*", (req, res, next) => {
    return next(new CustomError("This page does not exist", 404));
})

app.use(globalErrorhandler);

module.exports = app;