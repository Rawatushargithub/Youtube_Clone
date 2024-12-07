import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 5} = req.query

    const VideoComments = await Comment.find({ video: videoId })
    .skip((page - 1) * limit)
    .limit(limit);

    if(!VideoComments)
    {
        throw new ApiError( 400 , "VideosComments not found")
    }
    return res
    .status(200)
    .json( new ApiResponse(200 , VideoComments , "Comments Fetched Successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // we have get content , videoId and owner_id 
    // owner_id can get by running middleware verify jwt

    const { content , videoId } = req.body;
    const owner_id = req.user._id;

   const createdComment = await Comment.create( {
        content:content,
        video:videoId,
        owner:owner_id
    })

    if(!createdComment)
    {
        throw new ApiError( 400 , "Comment creation failed !!!")
    }

    return res
    .status(200)
    .json( new ApiResponse( 200 , createdComment , "Comment created successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    // here i find the comment in comment model through findOneAndUpdate and add the filter of owner_id
    // to get the owner_id i use verifyjwt , the auth middleware
    const { updatedComment , video_id } = req.body;
   const Update_comment =  await Comment.findOneAndUpdate(
        {
            video:video_id,
        },
        {
            content:updatedComment,
        },
        {
            new:true
        }
    )
    if(!Update_comment)
    {
        throw new ApiError( 400 , "Comment Updation Failed")
    }

    return res.status(200)
    .json( new ApiResponse(200 , Update_comment , "Comment Updation Successful"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    
    const Deleted_comment =  await Comment.findOneAndDelete(
        {
            owner:req.user._id,
        }
    )
    if(!Deleted_comment)
    {
        throw new ApiError( 400 , "Comment Deletion Failed")
    }

    return res.status(200)
    .json( new ApiResponse(200 , Deleted_comment , "Comment Deletion Successful"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }