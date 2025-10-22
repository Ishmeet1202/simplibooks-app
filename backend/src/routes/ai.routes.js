import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { predictCategory } from '../controllers/ai.controllers.js';

const router = Router();

router.use(verifyJWT);

router.route("/predict-category").post(predictCategory);

export default router;