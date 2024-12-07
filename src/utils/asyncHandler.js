//We are using the try catch and async and await numerous time in our code
// so to generalize this thing , the following is the code 

//it just make a function and export it
    // const asyncHandler = () => {}

    // export { asyncHandler }
//We can use asyncHandler in try catch form and also in promises form 

//asyncHandler are Higher order function (these are those who can accept the fucntion as  parameter and return them as function) 


//This is the promises one
const asyncHandler = (requestHandler) => {
     return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next))
        .catch((err) => next(err))
    }
}
export { asyncHandler };

/*const asyncHandler = () =>{}
const asyncHandler = (func) => { () => {}}
const asyncHandler = (func) => async () => {} */

// it is a wrapper function basically which we used in our coming code
//This is the try catch one 
/* const asyncHandler = (fn) => async (req , res , next) => {
    try{
            await fn(req , res, next)
    }
    catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })//also sending json response to ease for frontend person
    }
} */


