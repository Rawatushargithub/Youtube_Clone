import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {        //TODO: create playlist , add functionality of private and public 
    // first i need to run the auth middleware for checking that user is verified or not
    // steps to createPlaylist 
    // take the name and description
    // create an entry in database
    // 
    const {name, description} = req.body
   console.log("User_id or Owner_id :: " , req.user._id)        // can done optional checking for checking whether the user_id came or not 
    
    if(!name || !description)       // for starting i am taking both description and name of the playlist , baad mey change kar dunga
    {
        throw new ApiError(400 , "name or description is required")
    }
console.log("name: " , name , description)
   const playlist = await Playlist.create(
        {
            name,
            description,
            owner:req.user._id
        });
console.log("Data in playlist :: ",playlist)

   const createdPlaylist = await Playlist.findById(playlist._id)

   if(!createdPlaylist){
    throw new ApiError(500 , "Something went wrong while creating the playlist");
}
   return res
   .status(200)
   .json(new ApiResponse( 200 , createdPlaylist , "Playlist Created Successfully"));

})

const getUserPlaylists = asyncHandler(async (req, res) => {     //TODO: get user playlists
    const {userId} = req.params


if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId ' });
}

    const Playlists = await Playlist.find({ owner: userId })

    return res
    .status(200)
    .json(new ApiResponse (200 , Playlists , "Fetched User Playlists successfully"))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {       //TODO: get playlist by id
    const {playlistId} = req.params

    
if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ error: 'Invalid playlistId ' });
}

    const playlistbyid = await Playlist.findById( playlistId );

    return res
    .status(200)
    .json( new ApiResponse ( 200 , playlistbyid , "Fetched playlist by Id is successful"))
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params                        //here i have to check whether the same video is coming or not , if the same video is coming then don't save it 

    
if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ error: 'Invalid playlistId ' });
}

if (!isValidObjectId(videoId)) {
    return res.status(400).json({ error: 'Invalid video ID' });
}
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId , 
        { 

               $addToSet:{
                    videos: videoId
                   }

                // $unset:{
                //     videos:1
                // }
        }, 
        { 
            new:true
        }
    )
    

    if(!playlist)
    {
        new ApiError( 404 , "Playlist not get attached to playlist")
    }

    return res
    .status(200)
    .json( new ApiResponse (200 , playlist , "Video added Successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {            // TODO: remove video from playlist
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId)) {
        return res.status(400).json({ error: 'Invalid playlistId ' });
    }
    
    if (!isValidObjectId(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { "videos": videoId }
        },
        {
            new:true
        }
    )
    if(!updatedPlaylist)
    {
        throw new ApiError( 400 , "Video not deleted");
    }
    return res
    .status(200)
    .json( new ApiResponse ( 200 , updatedPlaylist , "Video Deleted Successfully "));
    
  

})

const deletePlaylist = asyncHandler(async (req, res) => {                   // TODO: delete playlist
    const {playlistId} = req.params

    if (!isValidObjectId(playlistId)) {
        return res.status(400).json({ error: 'Invalid playlistId ' });
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete( playlistId )

    console.log(deletedPlaylist)
    return res
    .status(200)
    .json( new ApiResponse(200 , deletedPlaylist , "Playlist successfully deleted"))
    
})

const updatePlaylist = asyncHandler(async (req, res) => {               //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body            // ask chatgpt why is that happend when put in raw it work and when put in body idon't  <= this answer is in note 3 or hard paper or mine
    console.log("data in reques.body:: " , name ," ", description)

    if (!isValidObjectId(playlistId)) {
        return res.status(400).json({ error: 'Invalid playlistId ' });
    }

    const updatedplaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name:name,
            description:description
        },
        {
            new:true
        }
    )
    console.log(updatedplaylist)
    return res
    .status(200)
    .json( new ApiResponse(200 , updatedplaylist , "Playlist Updated successfully "))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
