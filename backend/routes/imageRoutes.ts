import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authMiddleware";
import { uploadImage } from "../controllers/imageController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", authenticate, upload.single("image"), uploadImage);

export default router;
