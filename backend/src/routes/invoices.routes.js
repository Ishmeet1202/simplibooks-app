import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createInvoice, getAllInvoice, getSingleInvoice, updateInvoice } from "../controllers/invoices.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createInvoice);
router.route("/").get(getAllInvoice);
router.route("/:id").get(getSingleInvoice);
router.route("/:id").patch(updateInvoice);

export default router;