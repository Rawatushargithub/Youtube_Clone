// this middleware check whether the user is their in database or not 
// WE are verifyJWT becoz while login we have token and that basis we verify the user , if it the true login it means token are same , then in req.body a new object will be added which is req.user(name can be anything)

import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req , res , next) => {
    try {
        // console.log("cookies :: ",req.cookies)
        // how we get the token ? , we get the token access from req beoz it has cookies.parser
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");  // we don't need the "Bearer " we only need the refresh token
        // header is a method // it may be possible that data will come from mobile application and user is sending the custom headers
        // console.log("Token: " ,token)
        if(!token){
            throw new ApiResponse(401 , "Unauthorized request")
        }
        // Validate token format
        if (token.split('.').length !== 3) {
            throw new ApiError(401, "Malformed token");
        }

    // console.log("ACCESS_TOKEN_SECRET :: " , process.env.ACCESS_TOKEN_SECRET);
        // in the JWT token we have id , email , username and fullName also their
        // in jwt verify we need the tokne and the secret key and that secret key is present in the env. which is accesstoken_secret
        // we can get the token but only that person can decode that info who has the secret key 
        const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)         // now we get the decoded information
        // console.log("decoded_token :: " , decodedToken )
        const user = await User.findById(decodedToken?._id). // we already pass the id while generating the access token so after decoding we also have the user id 
        select("-password -refreshToken");
   
        if(!user){
            throw new ApiError(401 , "Invalid Access Token");
        }
    // console.log("user:: " , user)
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid Access Token")
    }
})