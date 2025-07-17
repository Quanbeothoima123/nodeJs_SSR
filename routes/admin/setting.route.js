const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/admin/setting.controller");
router.get("/general", controller.general);
router.patch(
  "/general",
  upload.single("logo"),
  uploadCloud.upload,
  controller.generalPatch
);

module.exports = router;
