import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";


const app = express();
console.log(process.env.CORS_ORIGIN);
// for using cors we use =>  "use" it is used for middelwares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Data is coming from different places like it comes from "forms" , "URL" ,direct_form or json_form
// we don't want to come unlimited data in our server so we put the limit on this by using "use"

//this for when a form is filling and it is coming in backend server
app.use(express.json({limit: "16kb"})) // it is for confiquring that we are accepting the data in json

 //url itself has a url encoder which convert the spaces into %20 and other character into differnt one
 //so it needed to tell the express that data is coming from URL
app.use(express.urlencoded({extended: true , limit: "16kb "})) // extended help in to make object in the object
app.use(express.static("public")); //  static only help in to store folder in my server files like favicon

// Work of cookieparser is to access the cookies and also can set the operations on the cookies on the user browser
// Secure cookie can be put in the user browser  and only server can use those cookies

app.use(cookieparser())

// routes import  
import userRouter from "./routes/user.routes.js"

//router declaration
//app.get <= this was working previously becoz we are writing the routes and controller at same place
// now we separate the routes so we have to add middleware for using routes
app.use("/api/v1/users" , userRouter); // /users is become prefix of the url local host and the control goes to user.routes.js


//routes import

// import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
// import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
// app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
// app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
// https://localhost:6000/api/v1/users/register //api/v1/users is write becoz it is a best practice to know more about our url



export { app };