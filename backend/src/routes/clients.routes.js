import { Router } from "express";
import { createClient, getAllClients, getSingleClient, toggleClientArchiveStatus, updateClient } from "../controllers/clients.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createClient);
router.route("/").get(getAllClients);
router.route("/:id").get(getSingleClient);
router.route("/:id").patch(updateClient);
router.route("/toggle-archive/:id").patch(toggleClientArchiveStatus);

export default router;