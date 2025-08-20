import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const tokenFromHeader = req.headers?.authorization;
        let token = req.cookies?.accessToken || (tokenFromHeader && tokenFromHeader.split(" ")[1]);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken._id);
        
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, "Unauthorized Access");
    }
});

export { verifyJWT };