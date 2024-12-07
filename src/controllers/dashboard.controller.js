import mongoose from "mongoose"
import {Video} from "../models/videos.models.js"
import {subscription} from "../models/subcription.models.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // getting the total video views 
    const userId = req.user._id;

    const result = await Video.aggregate([
        { 
            $match: { owner: new mongoose.Types.ObjectId(userId )}
        },
        {
            $group:{  _id:"$owner" ,totalViews: { $sum: "$views"}}
        }
    ])
    console.log( result )

    const totalViews = result.length>0 ? result[0].totalViews: 0;
    console.log(totalViews)

    // getting the total subscribers

    
    // return res.status(200)
    // .json( new ApiResponse( 200 ,  result , totalViews , "Total videos views fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }