import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { changePassword, getUserProfile, updateUserProfile } from "../controllers/users.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/me").get(getUserProfile);
router.route("/me").patch(updateUserProfile);
router.route("/me/password").patch(changePassword);

export default router;