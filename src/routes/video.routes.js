import Router from "express"
import { upload } from "../middlewares/multer.middlewares.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getAllVideo").get(getAllVideos)

router.route("/create-video").post(
    upload.fields( // the curely braces are the fields and we are taking the fields of array to taking the video and thumbnail from frontend
    [    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]),verifyJWT, publishAVideo
)

router.route("/v/:videoId").get(getVideoById);
router.route("/v/:videoId/:title/:description").patch(verifyJWT , upload.single("thumbnail") , updateVideo);
router.route("/v/:videoId").delete(verifyJWT , deleteVideo);
router.route("/v/togglestatus/:videoId").get(togglePublishStatus);
export default router;