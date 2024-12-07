import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/videos.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {             //TODO: get all videos based on query, sort, pagination
  
  
  const { page , limit , query , sortBy , sortType , userId } = req.query;

    // Build the query object
    let queryObject = {};
    if (query) {
      const words = query.split(' ').filter(Boolean); // Split by spaces and filter out empty strings
      queryObject.$or = words.map(word => ({
          title: { $regex: word, $options: 'i' } // Case-insensitive regex for each word
      }));
    }
    if (userId) {
        queryObject.userId = userId; // Filter by userId if provided
    }

    // Sorting
    let sortObject = {};
    sortObject[sortBy] = sortType === 'asc' ? 1 : -1;

    try {
        // Pagination logic
        const videos = await Video.find(queryObject)
            .sort(sortObject)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Count total documents for pagination metadata
        const totalDocuments = await Video.countDocuments(queryObject);

        res.status(200).json({
            videos,
            totalPages: Math.ceil(totalDocuments / limit),
            currentPage: page,
            totalVideos: totalDocuments,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Assuming multer middleware is correctly used to populate req.files
  const localVideoPath = req.files?.video?.[0]?.path;
  const localthumbnailPath = req.files?.thumbnail?.[0]?.path;

  console.log("Local paths:", { localVideoPath, localthumbnailPath });

  // Upload video to Cloudinary
  const videoCLOUD = await uploadOnCloudinary(localVideoPath);
  if (!videoCLOUD) {
      throw new ApiError(400, "Error uploading video to Cloudinary");
  }

  // Upload thumbnail to Cloudinary
  const thumbnailCLOUD = await uploadOnCloudinary(localthumbnailPath);
  if (!thumbnailCLOUD) {
      throw new ApiError(400, "Error uploading thumbnail to Cloudinary");
  }

  console.log("Cloudinary responses:", { videoCLOUD, thumbnailCLOUD });

  // Create video entry in the database
  const videoDB = await Video.create({
      title,
      description,
      videoFile: videoCLOUD.secure_url,
      thumbNail: thumbnailCLOUD.secure_url,
      duration: videoCLOUD.duration,
      owner: req.user._id,
  });

  if (!videoDB) {
      throw new ApiError(500, "Error saving video in the database");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, videoDB, "Video uploaded successfully"));
});

  
const getVideoById = asyncHandler(async (req, res) => {             //TODO: get video by id
      // for putting the videoID in URL this will done from frontend side , whenever a user saw a bunch of videos in frontof him 
      // then their must attached a videoID towards that particular video so when the user click on that particular video then that 
      // videoID get attached to the URL FROM the frontend side and after that when the URL routes this function it will work and return that video 

  const { videoId } = req.params;
  console.log("videoId " , videoId)
//  const videoID =  new mongoose.Types.ObjectId(videoId)
  if(!videoId){
    throw new ApiError(400 , "videoId is missing ");
  }

  const video = await Video.findByIdAndUpdate(videoId , { $inc:{ views:1 }} , { new : true });

  console.log("Video fetched from MONGODB :: " , video);
 const videoFILE =  video.videoFile
 const viewS = video.views
  return res
  .status(200)
  .json(new ApiResponse (200 , {data: videoFILE , viewS}, "Video fetched successfully"))
  
});

const updateVideo = asyncHandler(async (req, res) => {               //TODO: update video details like title, description, thumbnail
       // for putting the videoID in URL this will done from frontend side , whenever a user saw a bunch of videos in frontof him 
      // then their must attached a videoID towards that particular video so when the user click on that particular video then that 
      // videoID get attached to the URL FROM the frontend side and after that when the URL routes this function it will work and update that video 

  const { videoId , title , description } = req.params;
  // console.log( "video ID : ",videoId ,"title",  title ,"description", description)
  const thumbnaillocalpath = req.file?.path
  const thumbnailcloudpath = await  uploadOnCloudinary(thumbnaillocalpath)

  const userId = req.user._id;

  const video = await Video.findById( videoId );
  if(!video){
    throw new ApiError( 404 , "Video not found ");
  }

  // check if the user is the owner of the video 
  if( video.owner.toString() !== userId.toString()){
    throw new ApiError(403 , "You don't have permission to delete the Thumbnail ");
  }
   const thumbnailPublicId =  video.thumbNail.split('/').pop().split('.')[0];
  // console.log("public ID :: " ,thumbnailPublicId)

 const  response_2  =  await deleteFromCloudinary("" , thumbnailPublicId)
//  console.log("response from cloudinary :: "  , response_2.result)

 if( response_2.result === 'ok')
 {
  console.log("thumbnail got deleted ")
 }
 else{
  throw new ApiError(400 , "Thumbnail not found by ID ")
 }

 
const updated_video =  await Video.findByIdAndUpdate( 
    videoId , 
    {
      $set:{
        title,
        description:description, // both the syntax are correct 
        thumbNail:thumbnailcloudpath?.secure_url
      }
    },
    {
      new: true
    }
  )
  if(!updated_video)
  {
    new ApiError(400 , "Failed to updated the video title and description")
  }
 
   
  return res
  .status(200)
  .json(new ApiResponse ( 200 , updated_video , "Updated the video successfully "))
});

const deleteVideo = asyncHandler(async (req, res) => {               //TODO: delete video
  // i have to think that only user can delete their owner video not the whole video coming from database
  // add the auth middleware for checking if the user is owner of the video to delete or not

  const { videoId } = req.params;
  const userId = req.user._id;

  const video = await Video.findById( videoId );
  if(!video){
    throw new ApiError( 404 , "Video not found ");
  }

  // check if the user is the owner of the video 
  if( video.owner.toString() !== userId.toString()){
    throw new ApiError(403 , "You don't have permission to delete the video ");
  }
  console.log("video from calling database :: ",video)
  console.log("videofile :: " , video.videoFile,
              "thumbnailfile :: ",  video.thumbNail , 
  )

  const videoPublicId = video.videoFile.split('/').pop().split('.')[0];
  const thumbnailPublicId = video.thumbNail.split('/').pop().split('.')[0];
  console.log("video public id :: " , videoPublicId)
  console.log("thumbnail public id :: " , thumbnailPublicId)

 await deleteFromCloudinary(videoPublicId , thumbnailPublicId);
 console.log("successfully deleted from cloudinary ");
  
 await video.deleteOne();
  return res
  .status(200)
  .json(new ApiResponse(200 , null , "Video deleted Successfully"))

});

const togglePublishStatus = asyncHandler(async (req, res) => {
//    isPublished Field:
// Purpose: To control whether a video is publicly visible or private.

// Where to Use:

// In publishAVideo Function:
// Step 1: Set the isPublished field based on user input or default to true if not specified.
// In getAllVideos Function:
// Step 1: Modify the query to filter out videos that have isPublished set to false, unless the request is from the owner or an admin.
// In togglePublishStatus Function:
// Step 1: Update the isPublished status based on user action (e.g., toggling between true and false).
// Step 2: Save the updated status back to the database.

// Flow:

// Publishing: User uploads a video -> Set isPublished status -> Video is created with this status.
// Fetching Videos: User requests all videos -> Only videos with isPublished: true are returned to non-owners.
// Toggling Status: User changes the publish status -> isPublished field is updated in the database.
  const { videoId } = req.params;
   const video = await Video.findById( videoId );
   if(!video){
    throw new ApiError( 400 , "Video not found")
   }
console.log("video before update :: " , video)
   const UpdatedVideo = await Video.findByIdAndUpdate( 
    videoId,
    {
      isPublished: !video.isPublished
    },
    {
      new: true
    }
   )
   console.log("video after update :: " , UpdatedVideo)

  return res
  .status(200)
  .json(new ApiResponse(200 , null , "is published false "))
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
