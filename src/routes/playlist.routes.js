import {Router} from "express";
import { addVideoToPlaylist,
         createPlaylist,
         deletePlaylist,
         getPlaylistById,
         getUserPlaylists, 
         removeVideoFromPlaylist, 
         updatePlaylist
        } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

router.route("/create-playlist").post(verifyJWT , createPlaylist);
router.route("/get-user-playlist/:userId").post(getUserPlaylists);
router.route("/playlistbyid/:playlistId").get(getPlaylistById)
router.route("/add-video/:playlistId/:videoId").get(addVideoToPlaylist)
router.route("/delete-video/:playlistId/:videoId").delete(removeVideoFromPlaylist)
router.route("/delete-playlist/:playlistId").delete(deletePlaylist)
router.route("/update-playlist/:playlistId").patch( updatePlaylist)

export default router;