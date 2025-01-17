import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { uploadImage } from "../controllers/imageController";
import { upload } from "../utils/multer";
const router = Router();

router.post("/upload", authenticate, upload.single("image"), uploadImage);

export default router;
