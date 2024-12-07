// Mongo DB stores data in BSON format not in JSON format
//bcrypt is a library for hasing the password and JWT (Json web Token) is based on cryptography , they create the tokens

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";  // JWT is a bearer token , it means jo ussey bear karta ha ye usko shi mann leta h 
// if a person has a token of jwt then JWT send the data to that person , this library make the tokens itself

const userSchema = Schema(
  {
    userName: {
      type: String,
      
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // if you want to make the field searchable by optimized way just add the index field in it
      // index help in involving itself in database searching
    },
    email: {
      type: String,
      reqiured: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      reqiured: true,
      trim: true,
      index: true,
    },
    avatar: {
      // image usually doesn't store in database they are stored in third party services and from their we take the url of that image
      type: String, // we will using cloudinary URL (it is a service like AWS which is freely available)
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ], //watch History is an array which takes the multiple ID'S whenever the user watched the video

    password: {
      // whenever password is stored in DB it must stored in encrypted form
      type: String,
      required: [true, "Password is Required"], // u can pass the message to the required field also
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//Direct encryption is not possible , we take the help of hooks one is pre hooks (it is a middleware )
//pre hooks run the code in itself before the saving of data
//Here we can't use arrow function becoz it doesn't have the this pointer & this pointer is needed to access the password with in the userSchema
//save event is run on userSchema values and we want that values that's why we use function syntax
//encryption takes time to encrypt password that's why we are using async and await

userSchema.pre("save", async function (next) {  // it is a middelware that's why we write next

if(!this.isModified("password")) return next();
this.password = await bcrypt.hash(this.password, 10); // 10 is hash rounds
next();
    
    // if we do the following code then everytime the data(the data can by anything written above in schema) will stored in database it will encrypt the password
// this.password = bcrypt.hash(this.password, 10); // 10 is hash rounds
// next();
}); // it(pre) gave the different function whether to save ,insert , delete and many more

//In database the password is stored in the form of encrypted but when User is imported then it will gave the password in the form like "123"
// when the user try to login then it will write it's password in normal form , so we create a methods to check whether the password is correct or not
userSchema.methods.isPasswordCorrect = async function (password)
{
   return await bcrypt.compare(password , this.password) // this compare will give the boolena repsonse
   // the password in argument is the password given by user and this is pointing to the password which is saved in database in encrypted form
}

//in JWT sign methods generated the tokens

userSchema.methods.generateAcessToken = function () {
   return jwt.sign(
    {
        _id: this.id,
        email: this.email,
        userName:this.userName,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id, // in refreshtoken their is no need to adding additional parameters
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
        )
}
export const User = mongoose.model("User", userSchema);
