import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({

    subscriber:{
        type: mongoose.Schema.Types.ObjectId,      // one who is subscribing
        ref:"User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId,      // one to whom subscriber is subscribing
        ref:"User"
    }
} ,{timeStamps: true});

export const subscription = mongoose.model("subscription" , subscriptionSchema);

// in subscription model their is two fields one is "Subscriber" and another is "channel"
// bascially both the fields are users so we get the data from users models
// Subscriber is also a user and channel (means who is subscribing to another user) they both are stored in database
