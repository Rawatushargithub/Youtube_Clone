import Router from "express"
import { createTweet, 
         deleteTweet,
         getUserTweets, 
         updateTweet 
        } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/create-tweet").post( verifyJWT , createTweet);
router.route("/get-user-tweets").get( verifyJWT , getUserTweets);
router.route("/updateTweet/:tweet_id/:updatedContent").get( updateTweet );
router.route("/deleteTweet/:tweet_id").get( deleteTweet );


export default router