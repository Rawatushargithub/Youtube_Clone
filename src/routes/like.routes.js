import Router from "express"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/togglevideolike/:videoId").post(verifyJWT , toggleVideoLike)
router.route("/togglecommentlike/:commentId").post(verifyJWT , toggleCommentLike)
router.route("/toggletweetlike/:tweetId").post(verifyJWT , toggleTweetLike)
router.route("/getLikedvideos").post(verifyJWT , getLikedVideos)

export default router