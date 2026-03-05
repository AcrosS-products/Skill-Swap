const cloudinary = require('cloudinary').v2;

require("dotenv").config();

exports.connectCloudinary = () => {
    try {
        console.log("Connected to cloudinary successfully");

        cloudinary.config({
            cloud_name: process.env.cloudName,
            api_key: process.env.apiKey,
            api_secret: process.env.apiSecret,
        })


    } catch (err) {
        console.log(err);
    }
}