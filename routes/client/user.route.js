const express = require("express");

const multer = require("multer");

const router = express.Router();

const upload = multer();

const userValidate = require("../../validates/user/user.validate");

const authMiddleware = require("../../middlewares/client/auth.middleware");

const controller = require("../../controllers/client/user.controller");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.get("/register", controller.register);
router.post("/register", userValidate.registerPost, controller.registerPost);
router.get("/login", controller.login);
router.post("/login", userValidate.loginPost, controller.loginPost);
router.get("/logout", controller.logout);
router.get("/password/forgot", controller.forgotPassword);
router.get("/info", authMiddleware.requireAuth, controller.info);
router.patch(
  "/info/update",
  authMiddleware.requireAuth,
  upload.single("avatar"),
  uploadCloud.upload,
  controller.infoUpdate
);
router.post(
  "/password/forgot",
  userValidate.forgotPasswordPost,
  controller.forgotPasswordPost
);
router.get("/password/otp", controller.otpPassword);
router.post("/password/otp", controller.otpPasswordPost);
router.get("/password/reset", controller.resetPassword);
router.post(
  "/password/reset",
  userValidate.resetPasswordPost,
  controller.resetPasswordPost
);

module.exports = router;
