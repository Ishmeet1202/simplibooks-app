import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import z from "zod";

const getUserProfile = asyncHandler(async (req, res) => {
    const _id = req?.user?._id;

    const user = await User.findById(_id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "Something went wrong while fetching user informattion");
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            user,
            "User profile fetched successfully"
        ));
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const updateUserProfileSchema = z.object({
        name: z.string().trim().min(1, {message: "Name should not be empty"})
    });

    const validationResult = updateUserProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const { name } = validationResult.data;
    const _id = req?.user?._id;

    const user = await User.findByIdAndUpdate(
        _id,
        {
            $set: {
                name
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "Something went wrong while upating user informattion");
    }

    return res.status(200)
        .json(new ApiResponse(200, user, "User profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
    const changePasswordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, {message: "Password must be at least 6 characters long"})
    });

    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(issue => issue.message).join(', ');
        throw new ApiError(400, errorMessages);
    }

    const _id = req?.user?._id;

    const { currentPassword, newPassword } = validationResult.data;

    const user = await User.findById(_id);

    if (!user) {
        throw new ApiError(500, "Something went wrong while changing password");
    }

    const validatingOldPassword = await user.isPasswordCorrect(currentPassword);

    if (!validatingOldPassword) {
        throw new ApiError(400, "Invalid current password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password change successfully"));
});

export { getUserProfile,updateUserProfile,changePassword }