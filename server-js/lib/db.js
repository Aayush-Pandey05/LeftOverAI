const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Connection established with mongoDB: ${conn.connection.host}`);
    } catch(error){
        console.log("MongoDB connection error:- ", error);
    }
};

module.exports = {connectDB};