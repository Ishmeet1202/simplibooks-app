import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import jwt from "jsonwebtoken";
import z from "zod";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(
      "Error occured during generating access and refresh token !! ERROR: ",
      error.message
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const registerUserSchema = z.object({
    name: z.string().trim().min(1, { message: "Name cannot be empty" }),
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  });

  const validationResult = registerUserSchema.safeParse(req.body);

//   console.log(validationResult.error._zod.def[0].errors);

  if (!validationResult.success) {
    const errorMessages = validationResult.error._zod.def[0].message
    throw new ApiError(400, errorMessages);
  }

  const { name, email, password } = validationResult.data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const loginUserSchema = z.object({
    email: z.string().trim().email({ message: "Invalid email address" }),
    password: z.string(),
  });

  const validationResult = loginUserSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errorMessages = validationResult.error._zod.def[0].message
    throw new ApiError(400, errorMessages);
  }

  const { email, password } = validationResult.data;

  const validateUser = await User.findOne({ email });

  if (!validateUser) {
    throw new ApiError(401, "Invalid email or password");
  }

  const checkPassword = await validateUser.isPasswordCorrect(password);

  if (!checkPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(validateUser._id);

  const loggedInUser = await User.findById(validateUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token provided.");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(403, "Invalid refresh token. User not found.");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(
      403,
      "Refresh token is expired or has been used. Please log in again."
    );
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res
            .status(200)
            .clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" })
            .json(new ApiResponse(200, {}, "User logged out"));
    }

    await User.findOneAndUpdate(
        { refreshToken },
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, refreshAccessToken, logoutUser };
