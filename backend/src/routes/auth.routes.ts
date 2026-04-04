import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as AuthController from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.get("/me", requireAuth, AuthController.getMe);
