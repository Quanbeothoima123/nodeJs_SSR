const express = require("express");

const multer = require("multer");
const router = express.Router();

const upload = multer();

const postValidate = require("../../validates/admin/post.validate");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const controller = require("../../controllers/admin/post.controller");
router.get("/", controller.post);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteItem);
router.get("/create", controller.create);
router.post(
  "/create",
  upload.single("thumbnail"),
  uploadCloud.upload,
  postValidate.validateCreate,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  uploadCloud.upload,
  postValidate.validateCreate,
  controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;
