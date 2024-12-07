import mongoose , { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videosSchema = Schema({
    videoFile:{
       type:String,  // it will came from cloudinary URL
       required:true
    },
    thumbNail:{
        type:String, // it will came from cloudinary URL
        required: true
    }, 
    title:{
        type:String, 
        required: true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number, // duration will extracted from cloudinary URL whenever cloudinary gave the url it also passes the information 
        // about that video so it will also pass the duration information
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{       // this field tell that the video is publicily available or not 
        type:Boolean,
        default:true
    },
    owner:{
         type: Schema.Types.ObjectId,
         ref:"User"
    }



} , {timestamps: true})//timestamps automatically add the field createdAt and updatedAt in the database

//  mongoose itself has different functiton to work with DB and in mongoose some plugins can be write 
//  we injects aggregate pipelines as plugins in mongoose
videosSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video" , videosSchema )