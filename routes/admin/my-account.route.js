const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/admin/my-account.controller");

const myAccountValidate = require("../../validates/admin/my-account.validate");
router.get("/", controller.index);
router.get("/edit", controller.edit);
router.patch(
  "/edit",
  upload.single("avatar"),
  uploadCloud.upload,
  myAccountValidate.validateEdit,
  controller.editPatch
);

module.exports = router;
