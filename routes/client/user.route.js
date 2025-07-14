const express = require("express");
const router = express.Router();
const userValidate = require("../../validates/user/user.validate");
const controller = require("../../controllers/client/user.controller");
router.get("/register", controller.register);
router.post("/register", userValidate.registerPost, controller.registerPost);
router.get("/login", controller.login);
router.post("/login", userValidate.loginPost, controller.loginPost);
router.get("/logout", controller.logout);
router.get("/password/forgot", controller.forgotPassword);
router.post(
  "/password/forgot",
  userValidate.forgotPasswordPost,
  controller.forgotPasswordPost
);
module.exports = router;
