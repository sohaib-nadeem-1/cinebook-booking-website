import express from "express";
import { changePasswordApi, loginApi, registerApi } from "../controllers/auth.controller.js";
import { profileApi } from "../controllers/profile.controller.js";
import { authMiddleware } from "../Middlewares/auth.middleware.js";
import { testController } from "../controllers/test.controller.js";
import { roleMiddleware } from "../Middlewares/role.middleware.js";



const router = express.Router();

router.post("/register",registerApi)
router.post("/login",loginApi);
router.get("/profile",authMiddleware,profileApi);
router.patch(
  "/change-password",
  authMiddleware,
  changePasswordApi
);
router.get("/admin-test",authMiddleware,roleMiddleware("admin"),testController)
export default router;