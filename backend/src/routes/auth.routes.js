import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").post(logoutUser);

export default router;