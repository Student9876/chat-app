import { Router } from "express";
import { register, login, verify } from "../controllers/authController";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", verify);

export default router;
