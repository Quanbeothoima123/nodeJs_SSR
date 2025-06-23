const { deleteModel } = require("mongoose");
const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const paginationHelper = require("../../helper/pagination");

module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: records,
  });
};

module.exports.create = (req, res) => {
  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục sản phẩm",
  });
};

module.exports.createPost = async (req, res) => {
  const { title, description, parent_id, status, position, thumbnail } =
    req.body;

  const data = {
    title: title?.trim(),
    description: description?.trim(),
    status,
    thumbnail: thumbnail || "", // middleware đã gán thumbnail vào body
  };

  // Gán parent_id (String)
  if (parent_id && parent_id.trim() !== "") {
    data.parent_id = parent_id.trim();
  } else {
    data.parent_id = "";
  }

  // Xử lý position
  if (!position || position === "") {
    const count = await ProductCategory.countDocuments();
    data.position = count + 1;
  } else {
    data.position = parseInt(position);
  }

  // Tạo và lưu danh mục
  const category = new ProductCategory(data);
  await category.save();

  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};
