import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) => {
    // get user model details from frontend 
    // validation - not empty
    // check if user already exist: email, username
    // check for images, check avatar required
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response 

    const {fullname, email, username, password} = req.body
    console.log("fullname: ",fullname);

   /* if (fullname === ""){
        throw new ApiError(400, "fullname is required")
    }
    if (password === ""){
        throw new ApiError(400, "Password is required")
    }
*/    // Iske alawa hm ye bhi use kar sakte hai sbko ek sath check karna hoto 
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ email },{ username }]
    })
    if(existedUser){
        throw new ApiError(409, "User is alredy exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image are required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinar(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select
    (
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500,"Something went wrong")
    }
})

return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Succesfully")
)

export {registerUser}