// Their can be two approach to connect with database
// 1. The First is that we write the connection code of mongoose DB in index.js file 
// and then run that file.
// 2. The second can be write the code in DB folder of database connection and then 
//    import that file in index.js , in this approach our code will be modular in format

// To talk to database their must be problem arises so it must be necessary to wrap the code 
// in TRY CATCH BLOCK 
// Database is always in another continent. Database take time that's why async and await is necessary

/*1st approach
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";


( async () => {
    try{
        await mongoose.connect(`${process.env.MONOGODB_URL}/${DB_NAME}`) // data base is get connected
        app.on("error" , (error) =>{
            console.log("ERRR : " , error);
            throw error
        })
        app.listen(process.env.PORT , () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR : " , error);
        throw error;
    }
})() // this is IIFE (Immediately Invoked Functions Expressions)
 */

//2nd approach 
// we tried to focus that when the first file will load then our all environment variables will loaded in starting
// so that i will available to all my files 
//require('dotenv').config({path : './env'}) // this is right but it disruptes the consistency of code because it is done by common.js 
// not by module js or this method is synchronous
import dotenv from "dotenv";
import connectDB from "./db/index.js";
// import express from "express";  // this should not be done becoz this create an another instances which is different from app 
// const app = express();
import { app } from "./app.js";

dotenv.config({
    path: './.env'
}) // it is not available in it's doc. but it can be used in exprimental features
// this change can be done in dev in package.json

connectDB()  // as this function run the async function so it will return  the promise 
.then (() => {
    // here we are listening for an event for a error
    app.on("error" , (error) =>{
        console.log("ERRR : " , error);
        throw error
    })


    app.listen(process.env.PORT || 8000 , () => {
        console.log(` Server is running at port : Server at http://localhost:${process.env.PORT}`);
    })
   
})
.catch((error) => { 
    console.log("MONGO DB connection failed !!! " , error);
})


















