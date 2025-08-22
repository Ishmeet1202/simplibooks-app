import { Router } from "express";
import { createOrganization, getOrganization, updateOrganization } from "../controllers/organizations.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createOrganization);
router.route("/mine").get(getOrganization);
router.route("/mine").patch(updateOrganization);

export default router;