const express = require("express");

const multer = require("multer");
const router = express.Router();

const storageMulter = require("../../helper/storageMulter");
const upload = multer({ storage: storageMulter() }); // dest  là thư mục root của dự án
const productValidate = require("../../validates/admin/product.validate");

const controller = require("../../controllers/admin/product.controller");
router.get("/", controller.product);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteItem);
router.get("/create", controller.create);
router.post(
  "/create",
  upload.single("thumbnail"),
  productValidate.validateCreate,
  controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.single("thumbnail"),
  productValidate.validateCreate,
  controller.editPatch
);

module.exports = router;
