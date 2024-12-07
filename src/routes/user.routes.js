import { Router } from "express";
import { registerUser,
         loginUser,
         logoutUser,
         refershAccessToken,
         changeCurrentPassword, 
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateUsercoverImage,
         getUserChannelProfile,
         getWatchHistory
        } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
upload.fields( // the curely braces are the fields and we are taking the fields of array to taking the avatar and coverImage from frontend
   [    {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]
),
    registerUser) // before the running of the method registerUser we are processing a middleware upload which is able to take avatar files and 
    // save to our local disk storage

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/referesh-token").post(refershAccessToken)
router.route("/change-Password").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)        // here user is not sending the data therefore we use get method
router.route("/update-account-details").post(verifyJWT , updateAccountDetails)//patch method updates only few things or just changes few attributes

//uploading images
router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)
router.route("/cover-Image").patch(verifyJWT , upload.single("coverImage") , updateUsercoverImage)

router.route("/c/:username").get(verifyJWT , getUserChannelProfile)
router.route("/watchHistory").get(verifyJWT , getWatchHistory)







export default router

