import Router from "express"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comments.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/getvideocomments/:videoId").post(getVideoComments)
router.route("/created_comment").post(verifyJWT,addComment)
router.route("/updated_comment").post(verifyJWT,updateComment)
router.route("/deleting_comment").post(verifyJWT,deleteComment)

export default router