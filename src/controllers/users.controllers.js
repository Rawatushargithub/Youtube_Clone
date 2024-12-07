import { asyncHandler } from "../utils/asyncHandler.js"; // this file is for user registeration 
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.models.js';  // this User will direct contact to our database becoz this user is created by mongoose
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser = asyncHandler( async (req , res) => {
   // get the user details from frontend
   // validation - data fields must not be empty
   // check if the user already exists : either by username or email
   // check for images , check for avatar
   // upload them to cloudinary , avatar
   // create user object - create entry in db
   // remove password and refresh token field from response coming through database
   // check for user creation 
   // return res

// usually the data fields is get from req , when it come through body then it can be access in req.body
// if data is coming through form of json then we get the data from request field 

const { fullName ,email , userName , password } = req.body;     // destructuring assignment


// for validation of data
if(
    [fullName , email , userName , password].some((field) => field?.trim === "") // this some will take a callback function and check for each fields in array 
)  // ?. is known as optional chaining   ,   if one of the fields is empty then some method return TRUE
    {
       throw new  ApiError( 400 , "All Fields are required ");
    } // you can also the email formatting


// checking the user exist or not
const existeduser = await User.findOne({            //$or is the mongodb operator
    $or: [{ userName } , { email }]// $ is a operator which will take an array and if one of them will find then it will return that value
}                                   // all the value will check in object means in curely braces
)  // this will return the first thing will find in the database from the two options given to this function
// console.log(existeduser);


if(existeduser){
    throw new ApiError( 409 , "User with Email or UserName already exists ")
}
console.log(req.files)
//check for images , avatar 
// becoz we add the middleware before registerUser then it will add the files field in request 
// now the access of files through multer in req can be possible or not so optional chaining is better option(?.)
// console.log(req.files);
const avatarLocalPath = req.files?.avatar[0]?.path // this files field has more thing like type and size of files  , but we are taking it's first property which is path (the proper path uploaded by multer will be given here) 
// here req.files?. means that if the files field exist in request then it will check for avatar and if avatar field also exist then it will check for path filed in avatar
//const coverImageLocalPath = req.files?.coverImage[0]?.path; // if we don't pass the image their is a error come undefined
// console.log("Files field present in req : ", req.files , "avatar[0]" , req.files.avatar[0] );

let coverImageLocalPath ;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0 )// this(req.files.coverImage.length>0) tell that is their any properties in coverimage or not 
    {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

if(!avatarLocalPath){
    throw new ApiError( 400 , "Avatar File is required ");
}

// UPLOAD THEM TO CLOUDINARY 
const avatar =  await uploadOnCloudinary(avatarLocalPath) // it will take time that's why we use await
const coverImage = await uploadOnCloudinary(coverImageLocalPath)


if(!avatar){  // this for checking whether the avatar field is uploaded or not becoz it will throw error becoz it a required field
    throw new ApiError( 400 , "Avatar File is required ");
}

// create data entry in db
const user = await User.create(  // after creation we get an _id which is in BSON 
    {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // we don't check above that did we get the url of coverimage or not so here we doing the check
        email,                                  // if coverImage has the url then it will go to DB  otherwise it will remain empty 
        password,
        userName: userName.toLowerCase()
    }
) // mongo db will create a ID with every entry so check by that id 
    // now you can check whether the user is created or not

const createduser = await User.findById(user._id).select(  // their is select method you can pass the fields which you want to remove here we pass the strings 
    "-password"
)
// console.log("CreatedUser : " , createduser);
if(!createduser){
    throw new ApiError(500 , "Something went wrong while registering the user ");
}

return res.status(201).json (
    new ApiResponse(200 , createduser , "User registered Successfully ")
)

})

const generateAcessTokenAndRefereshToken = async(userID) => {
    const user = await User.findById(userID);
    // console.log("this user is inside the token function :: " , user);
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    
// console.log("RefereshToken:: " , RefereshToken
//             , "accessToken :: " , AccessToken
//)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false})  // here when we save the model then the mongoose model will kickin like password field and in password there is required field but 
    // in this method their is no password so their introduced a new parameter validateBeforeSave 

    return { accessToken , refreshToken };

}

const loginUser = asyncHandler( async (req , res) => {
    // get data from req.body
    // get the username or email
    // find the user
    // check the password  
    // generate referesh token 
    // generate access token
    // send the cookies

    const { email , username , password } = req.body;
    
    if( !(username || email)) {          // this will check one of them will be present in the body 
        throw new ApiError( 400 , "username or email is required"); 
    }

   const user =  await User.findOne({
        $or : [{username} , {email}]
    })
    console.log(user);
    if(!user){
        throw new ApiError(404 , "User does not exist");
    }
    //the methods made in model USER like ( generate token and refreshtoken and password validate ) is present in "user" NOT "User"
    const isPasswordValid = await user.isPasswordCorrect(password);

    if( !isPasswordValid ){
        throw new ApiError( 401 , "Invalid user credentials");
    } 

    //generate access and refresh tokens 
   const { accessToken , refreshToken } =  await generateAcessTokenAndRefereshToken(user._id)

   // sending cookies is very easy task , but the main things is which information should given to user
   // user have some unwanted fields like  password must not be given to the user 
   // the "user" in line no. 133 , it doesn't have the refereshtoken beacuse we taken the object at 133 line no. and we call the methods of token at 105 , we have the reference of the line no. 111 user
   // either object se update kar do or one more data base query kar do (here , you have to decide whether is is expensive method or no , if it is then do first , if not then do second )

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // this is an optional step whether to do or not , in this step we have a loggedInUser which have all fields except 
   // password and refreshToken 
// console.log("loggedInUser" , loggedInUser , 
//             "accesstoken" ,  AccessToken,
//              "refreshToken" , RefereshToken
// );
   // we have to send the options with cookie basically it is a object which tell that the cookies can't be modify by the frontend it can be modify only by backend
   const options = {
    httpOnly : true, 
    secure: true
   }

   // we have cookieparser through which i can access cookies we can use cookies after dot (.)
   // we have to return data from this function loginUser
   return res
   .status(200)
   .cookie("accessToken " , accessToken , options)
   .cookie("refreshToken" , refreshToken , options)
   .json(new ApiResponse(
       200 , 
       {
           user: loggedInUser , accessToken , refreshToken     // this data will going to frontend so that user can use that token on their local web 
       }, 
       "User logged in Successfully"
   )

   )

})

const logoutUser = asyncHandler( async (req , res) => {
    // while logout we don't have the access of user_id , and if we don't have the access of user_id then we are not able to delete that particular user from database
    // for logout the user we have to clear two things 1st clear cookies and 2nd clear referesh token from the data base and for that we need users id
    // for getting the user id we inject a middleware of our own in route section before running this logoutUser 
    // for logout we need refershtoken of that user present in database and that we get from user_id , so we add our middleware which inject the user_id in our req field 
    // after injecting we run this logoutUser function becoz now the logoutUser have the access of user_id and we are able to delete refreshtoken

    // We get the access of user_id in previous becoz we are taking the email and passwod and through that we are getting the user_id from the database
    // but while logout if we take email and password then any one can delete any user 

    await User.findByIdAndUpdate(          // it will take the first query and then what we have to update the things
        req.user._id,
        {
            $unset: {
                refreshToken: 1 ,// this will remove the refereshtoken from database
            }
        },
        {
            new: true // this will gave the new response to the user the undefined refreshtoken
        }
    )
    const options = {
        httpOnly : true, 
        secure: true
       }
       return res.
       status(200)
       .clearCookie( "AccessToken" , options)
       .clearCookie( "RefreshToken" , options)
       .json(new ApiResponse(200 , {} , "User Logged Out"))
})

const refershAccessToken = asyncHandler (async (req , res) => {
    //  console.log("cookies in request :: ",req.cookies);
    const incomingRefereshToken = req.cookies?.refreshToken || req.body.RefreshToken // req can also came from mobile app that's why body is used
console.log("incoming token :: " , incomingRefereshToken)
    if(!incomingRefereshToken){
        throw new ApiError(401 , "Unauthorized Request");
    }

    try {
        // in decodedToken their is an id through which we are able to find the user
        const decodedToken = await jwt.verify(incomingRefereshToken , process.env.REFRESH_TOKEN_SECRET)
       const user = await User.findById(decodedToken?._id)
    
       if(!user){
        throw new ApiError(401 , "Invalid referesh Token " )
       }
       // now we have both token one is coming from user which is incomingRefereshToken and another can find from "user"
       if( incomingRefereshToken !== user?.refreshToken){
        throw new ApiError(401 , "RefreshToken is expired or used");
       }
       // clearing the old cookies
       const options = {
        httpOnly: true, 
        secure: true
       }
       res.clearCookie("AccessToken" , options );
        res.clearCookie("RefreshToken" , options );
      
    
      const {accessToken , refreshToken} = await generateAcessTokenAndRefereshToken(user._id)
    console.log("newRefereshToken :: ",refreshToken);
       return res
       .status(200)
       .cookie("accessToken" , accessToken ,options)
       .cookie("refreshToken" , refreshToken ,options)
       .json(
        new ApiResponse(
            200, 
            {
                accessToken,
                refreshToken
            },
            "Access Token Refreshed successfully"
        )
       )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid referesh Token");
    }
})

const changeCurrentPassword = asyncHandler( async (req , res) => {
    const { password , newPassword } = req.body;     // these fields (oldPassword , newPassword) we are getting from user 
    // we have run the auth middleware so that we get the user info. earlier or the user object will add in the request fields
    // console.log("request-body :: " , req.body , "oldpassword" , password , "newpassword" , newPassword )
   const user =  await User.findById(req.user?._id)
   console.log(user);
   const isPasswordCorrectCheck = await user.isPasswordCorrect(password);
   console.log("ispassword check " , isPasswordCorrectCheck)
   if(!isPasswordCorrectCheck){
    throw new ApiError(400 , "Old password is incorrect");
   }
   user.password  = newPassword;
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(
    200, {} , "Password change successfully"
  ))
  

})

const getCurrentUser = asyncHandler( async (req ,res) => {
    // here authmiddleware also run ,that's why we have the user access 
    return res
    .status(200)
    .json(new ApiResponse(201 , req.user , "Current User Fetched Successfully"));
})

const updateAccountDetails = asyncHandler(async (req , res) => {
    const { fullName , email } = req.body;
    // try to take the different end point of updating the image , we can do here also but to seperate out , it is the best approach 
    // becoz if we do here then the user in mongo will again poora save ho jata ha jissey network congestion badh jata ha 
    
    if(!fullName || !email){
        throw new ApiError(400 , "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email  // both are the syntax and both are right
            }
        },
        {
            new:true, // this object is written so that it will give new updated value in response 
        } ).select("-password") // select method will remove the password field after gaving the response in user variable
    return res
    .status(200)
    .json(new ApiResponse(200 , user , "Account Details updated Successfully"))

})

// files updated from user 
// for this we have to take care of two middleware multer and second who is login 
// so we take care of these two things while routing  , now we only writting the controllers

const updateUserAvatar = asyncHandler( async (req, res) => {
    // req.files has the files present in the request becoz of multer middleware 
    // here we are using only on file (avatar) so we are writting "req.file" and we will take that path 

    const avatarLocalPath = req.file?.path  // it gave the path of local stoarge where the file is get stored after multer running 

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar File is missing");
    }
    //TODO: delete old avatar image assignment
    
 const avatar =   await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(4000 , "Error while uploading on avatar");
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200 , user , "Avatar file uploaded successfully"))
})

const updateUsercoverImage = asyncHandler( async (req, res) => {
    // req.files has the files present in the request becoz of multer middleware 
    // here we are using only on file (avatar) so we are writting "req.file" and we will take that path 

    const coverImageLocalPath = req.file?.path  // it gave the path of local stoarge where the file is get stored after multer running 

    if(!coverImageLocalPath){
        throw new ApiError(400 , "coverImage File is missing");
    }
 const coverImage =   await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400 , "Error while uploading on coverImage");
    }
   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200 , user , "coverImage file uploaded successfully"))
})

const getUserChannelProfile = asyncHandler ( async(req , res) => {
    // when we get to any user account or any channel then in the URL the name of that account or channel is present like /user/chaiaurcode
    // through params property of express we ge the username from URL ,params help in extracting the name from URL becoz params treat them as an object 

    const{username} = req.params;

    if(!username){
        throw new ApiError(400 , "Username is missing")
    }
    console.log(username.toLowerCase());
   

    // $match field find one doc.from many doc in DB
   const channel =  await User.aggregate([

    {   // here we find the user from data base of the above username 
        $match:{
            userName:username?.toLowerCase()  // we doing it optionally it is not necessary but just for safety measure whether the username is empty or not 
        }
    },
    {   // now we find the subscriber of a particular account of the above username
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {   // here we find the no. of doc to which this user is subscribing
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    {   // here we add these fields in this particular user doc 
        $addFields:{    // it will add additional field 
            subscribersCount:{
                $size: "$subscribers" // here we user $ becoz "subscribers" is a field
            },
            channelsSubscribedToCount:{
                $size: "$subscribedTo"
            },
            // for showing if the user who is seeing the channel is subscribed or not we send a true or false value to frontend
            // so that it can show that whether is seeing user is subscribed or not 
            isSubscribed:{
                //here we gave the condition
                $cond:{
                    // we use if , here if true then , "then" hit and , if false then "else" hit 
                    // here i have to check only , that in the  document "subscribers" that the user who is seeing is present or not 
                    if: {$in: [req.user?._id , "$subscribers.subscriber"]} ,      // if logged in then we have the req.user
                    then: true, 
                    else: false
                    
                    // here the object will came in place of "$subscribers.subscriber" , and we have already a object if from user so we compare easily
                    // in is a operator which can find between array and object both 
                }
            }
        }
    },
    {   // project will only display those value which is give to project as true or 1 
        // project gave only selected things after piplelines output
        $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
        }
    }

    ])
console.log("value present in CHANNEL :: ",channel);
    if(!channel?.length){
        throw new ApiError(404 , "channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200 , channel[0] , "User Channel Fetched successfully")
    )
})

//try to console log the channel

const getWatchHistory = asyncHandler (async(req,res) => {
    // here comes an interview question What is return by this statement "req.user._id"  <= this statement return only string of id in DB
    // but mongoose automatically convert this string into mongo DB object ID 
    // but if we need mongoDB id then we need "ObjectId('655bc4d43dfkj32sl5jls')" <= this is the proper mongoDB id 

    // the code of aggregation pipelines directly goes to mongo DB 
    // that's why we create a mongoose object ID in match section
    const user = await User.aggregate([
        {
            $match:{       
                _id: new mongoose.Types.ObjectId(req.user._id)      // now we get the user document 
            }
        },
        // next step is to look up the document of videos in the user document 
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                // further we have to write subpipelines other wise we don't get the data of owner which is present in video field
                pipeline:[
                    {       // now we have videos doc or files and we are further lookup or join to user model for 
                            // getting the details of owner of that video
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner" ,     // now at this point we have multiple values in array becoz we got the whole user and 
                                            // along with that user his fullName , email ,password avatar and all details came and we have to only pass few things in owner for this we further use a pipelines
                             pipeline:[
                                {       //becoz we use pipelines inside the owner so this pipelines work on the owner field
                                    // try this by yourself that put this pipelines outside and check what data will came and find out 
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                }
                             ]   
                        }
                    },
                    // now the data will come from above pipeline is an array of owner but we write an another pipeline for 
                    // managing that data and convert that data into object so that it is easier for frontend person
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner" // now the result will come an object and using dot the values can access easily
                            }
                        }
                    }
                ]
            }
        }
    ])
    console.log(user[0].watchHistory);
    return res
    .status(200)
    .json(new ApiResponse(
        200 , 
        user[0].watchHistory,
        "Watch History fetched Successfully"
    ))
})


export { registerUser,
    loginUser,
    logoutUser,
    refershAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory
 };