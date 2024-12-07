import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {               //TODO: toggle like on video 
    const { videoId } = req.params
    const  userId  = req.user._id
   
    // for toggle the video like when user click liked then it will add the videoId and if again user click
    // then remove that videoId 

    if (!isValidObjectId(videoId) ) {
        return res.status(400).json({ error: 'Invalid videoId ' });
    }
    if (!isValidObjectId(userId) ) {
        return res.status(400).json({ error: 'Invalid userId ' });
    }
    // finding the user likes doc in like model
    let userLikes = await Like.findOne( { likedBy: userId });
    console.log("before checking userLikes in database :: " , userLikes)
    if(!userLikes)
    {
        // it means user like records is not created yet , so it will be created here
      userLikes =  await Like.create({
        videos:videoId,
        likedBy:userId
       })
      await userLikes.save();
      console.log("creation of userlikes is working")
      return res
      .status(200)
      .json( new ApiResponse (200 , userLikes , "Video Liked"))
    }

    // Check if the video is already liked (i.e., videoId is in the videos array)
    const videoIndex = await userLikes.videos.indexOf(videoId)
    if(videoIndex === -1)
    {
        //it means video is not yet liked 
      await  userLikes.videos.push(videoId);
        await userLikes.save();
        console.log("videoIndex if is working")
        return res
        .status(200)
        .json( new ApiResponse(200 , userLikes , "Video Liked"))
    }
    else
    {
        // Video is already liked, so remove it (unlike)
        await userLikes.videos.splice(videoIndex , 1) // 1 indicates how many elements is to be remove from the start index , and videoIndex is the start index 
        await userLikes.save();
        console.log("videoIndex else is working")
        return res
        .status(200)
        .json( new ApiResponse(200 , userLikes , "Video Unliked"))
    }
    
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {            //TODO: toggle like on comment
    const {commentId} = req.params
    const userId = req.user._id
    
    if (!isValidObjectId(commentId) ) {
        return  new ApiError( 400 , "Invalid CommentId")
    }
    if (!isValidObjectId(userId) ) {
        return  new ApiError( 400 , "Invalid userId")
    }

    let commentLikes = await Like.findOne({ likedBy: userId})

    if(!commentLikes)
    {
        // user comment like doc is not created , here we create it 
       let commentLikes = await Like.create({
            comment:commentId,
            likedBy:userId
        })
        await commentLikes.save();
        console.log("new creation comment is working")
        return res
        .status(200)
        .json( new ApiResponse ( 200 , commentLikes , "Comment Liked"))
    }

    let commentIndex = commentLikes.comments.indexOf(commentId)

    // Check if the comment is already liked (i.e., commentId is in the videos array)
    if(commentIndex === -1)
    {
        // it means comment is not yet liked
     const commentLiked =   await commentLikes.comments.push(commentId)
    await commentLikes.save();
    console.log("commentindex if  is working")
    return res
    .status(200)
    .json( new ApiResponse(200 , commentLiked , "Comment Liked"))
    }
    else{
        // if here then commentIndex has the value and comment is liked now it time to unliked it 
        const unLikedcomment = await commentLikes.comments.splice(commentIndex , 1)          // 1 indicates how many elements is to be remove from the start index , and commentIndex is the start index 
        await commentLikes.save();
        console.log("comment else is working")
        return res
        .status(200)
        .json( new ApiResponse(200 , unLikedcomment , "Comment Unliked"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {               //TODO: toggle like on tweet
    const {tweetId} = req.params
    const userId = req.user._id
    
    if (!isValidObjectId(tweetId) ) {
        return  new ApiError( 400 , "Invalid tweetId")
    }
    if (!isValidObjectId(userId) ) {
        return  new ApiError( 400 , "Invalid userId")
    }

    let tweetLikes = await Like.findOne({ likedBy: userId})

    if(!tweetLikes)
    {
        // user comment like doc is not created , here we create it 
       let tweetLikes = await Like.create({
            tweets:tweetId,
            likedBy:userId
        })
        await tweetLikes.save();
        console.log("new creation tweet is working")
        return res
        .status(200)
        .json( new ApiResponse ( 200 , tweetLikes , "Tweet Liked"))
    }

    let tweetIndex = tweetLikes.tweets.indexOf(tweetId)

    // Check if the tweet is already liked (i.e., tweetId is in the videos array)
    if(tweetIndex === -1)
    {
        // it means comment is not yet liked
     const tweetLiked =   await tweetLikes.tweets.push(tweetId)
    await tweetLikes.save();
    console.log("Tweetindex if  is working")
    return res
    .status(200)
    .json( new ApiResponse(200 , tweetLiked , "Tweet Liked"))
    }
    else{
        // if here then commentIndex has the value and comment is liked now it time to unliked it 
        const unLikedtweet = await tweetLikes.tweets.splice(tweetIndex , 1)          // 1 indicates how many elements is to be remove from the start index , and commentIndex is the start index 
        await tweetLikes.save();
        console.log("Tweet else is working")
        return res
        .status(200)
        .json( new ApiResponse(200 , unLikedtweet , "Tweet Unliked"))
    }

   
}
)

const getLikedVideos = asyncHandler(async (req, res) => {               //TODO: get all liked videos
    // this is simple task but it get complex when the liked video transfer to frontend
    // search for the likedby person and get the doc of that , and then get the all videos_id  from videos field but when it pass to frontend 
    // then we don't pass the _id's instead we have to pass the joined document of likes with videos
    // here i done the simple task of getting _id's i will do it later joining part

    const userId = req.user._id
    const videoId = req.body.videoId;
    if (!isValidObjectId(userId) ) {
        return  new ApiError( 400 , "Invalid userId")
    }

   const userDoc = await Like.findOne({ likedBy: userId}).populate('videos')

//    const likedVideos = await userDoc.videos

   return res
   .status(200)
   .json( new ApiResponse( 200 , userDoc , "Liked videos fetched successfully"))

// // Convert videoId to ObjectId (if it's stored as an ObjectId in MongoDB)
// const videoObjectId = new mongoose.Types.ObjectId(videoId);

// const updatedLike = await Like.findOneAndUpdate(
//     { likedBy: userId },            // Find the document where the user matches
//     { $pull: { videos: videoObjectId } }, // Pull (remove) the videoId from the videos array
//     { new: true }                // Return the updated document
//   );
// console.log(updatedLike)
//   return res
//   .status(200)
//   .json( new ApiResponse(200 , updatedLike , "video Id pulled out successfully "))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}