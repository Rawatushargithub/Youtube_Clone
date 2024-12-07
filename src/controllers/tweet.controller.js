import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import { User } from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {              //TODO: create tweet
    const { content } = req.body;
    // console.log("User id is :: " , req.user._id)
    // now i want the owner of that tweet FOR THIS 
    // i will run a middleware of verifyJWT to get the user_id which is further store in owner field
    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    console.log(tweet)

    if(!tweet){  
        throw new ApiError( 400 , "Tweet not created ")
    }

    return res
    .status(200)
    .json( new ApiResponse(200 , tweet , "Tweet created Sucesscully"))
})

const getUserTweets = asyncHandler(async (req, res) => {            // TODO: get user tweets
    
    // i have to run middleware before running this function so that i can get the user_id for getting the user tweets

    const userId =  (req.user._id) ;
    // console.log(userId)
if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId ' });
}

   const getTweets = await Tweet.find(
        {owner: userId}
    )

    if(!getTweets)
    {
        throw new ApiError (400 , "Tweets not found")
    }

    return res
    .status(200)
    .json( new ApiResponse( 200 , getTweets , "All tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {              //TODO: update tweet

    // How to get the tweet id ? Ans: It can be taken when we getusertweets and then can pass in params as tweet_id
    const { tweet_id , updatedContent } = req.params;

    if (!isValidObjectId(tweet_id)) {
        return res.status(400).json({ error: 'Invalid tweet_id ' });
    }

    const UpdatedTweet = await Tweet.findByIdAndUpdate(
        tweet_id,
        {
            $set:{
                content:updatedContent
            }
        },
        {
            new:true
        }
    )

    if(!UpdatedTweet) {
        throw new ApiError( 400 , "Tweet updating failed !!! ")
    }

    return res
    .status(200)
    .json( new ApiResponse( 200 , UpdatedTweet , "Tweet Updated Successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {              //TODO: delete tweet
    
    const { tweet_id } = req.params;

    if (!isValidObjectId(tweet_id)) {
        return res.status(400).json({ error: 'Invalid tweet_id ' });
    }
    
   const deletedTweet = await Tweet.findByIdAndDelete( tweet_id )

   console.log(deletedTweet)
   return res
   .status(200)
   .json( new ApiResponse(200 , deletedTweet , "Playlist successfully deleted"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
