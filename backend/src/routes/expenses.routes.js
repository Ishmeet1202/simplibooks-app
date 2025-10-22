import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { categorySelection, createExpense, deleteExpense, getAllExpenses, updateExpense } from "../controllers/expenses.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/predict-category").post(categorySelection);
router.route("/").post(createExpense);
router.route("/").get(getAllExpenses);
router.route("/:id").patch(updateExpense);
router.route("/:id").delete(deleteExpense);

export default router;