import mongoose , {Schema} from "mongoose";

const likeSchema = Schema({
    comments:[{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }],
    videos:[{                                                                     // there are two way of creating this one is create a different mongoose doc for the particular
        type:Schema.Types.ObjectID,                                             // video of a particular user and 
        ref:"Video"                                                             // another is to create a one doc. of userId and add the videoId inside the video field of doc.
    }],
    likedBy:{
        type:Schema.Types.ObjectID,
        ref:"User"
    },
    tweets:[{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    }]
} , {timestamps:true});

export const Like = mongoose.model("Like" , likeSchema)