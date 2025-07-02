const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const controller = require("../../controllers/admin/account.controller");

const accountValidate = require("../../validates/admin/account.validate");
router.get("/", controller.index);
router.get("/create", controller.create);
router.post(
  "/create",
  upload.single("avatar"),
  uploadCloud.upload,
  accountValidate.validateCreate,
  controller.createPost
);
router.get("/detail/:id", controller.detail);
router.get("/edit/:id", controller.edit);
router.patch(
  "/edit/:id",
  upload.single("avatar"),
  uploadCloud.upload,
  accountValidate.editPatch,
  controller.editPatch
);
// router.delete("/delete/:id", controller.deleteItem);
// router.get("/permissions", controller.permissions);

// router.patch("/permissions", controller.permissionsPatch);

module.exports = router;
