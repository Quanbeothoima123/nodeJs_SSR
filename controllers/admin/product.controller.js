const { deleteModel } = require("mongoose");
const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const mongoose = require("mongoose");
// [GET] /admin/products
module.exports.product = async (req, res) => {
  // đoạn bộ lọc
  const filterStatus = filterStatusHelper(req.query);
  let find = {
    deleted: false,
  };
  if (req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);

  // đoạn tìm kiếm bằng từ tên sản phẩm
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //pagination
  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );

  //end pagination

  const products = await Product.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  res.render("admin/pages/products/index", {
    pageTitle: "Trang sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("ID không hợp lệ");
  }

  await Product.updateOne({ _id: id }, { status });

  res.redirect(req.get("referer") || "/admin/products");
};

//[PATCH] /admin/products/changeMulti, active, inactive, delete-all
module.exports.changeMulti = async (req, res) => {
  const { type, ids } = req.body;
  const idArray = ids.split(",");

  if (idArray.length === 0) {
    return res.status(400).send("Không có ID hợp lệ");
  }

  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: idArray } }, { status: "active" });
      break;
    case "inactive":
      await Product.updateMany(
        { _id: { $in: idArray } },
        { status: "inactive" }
      );
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: idArray } },
        {
          deleted: true,
          deleteAt: new Date(),
        }
      );
      break;
    case "change-position":
      for (const item of idArray) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne({ _id: id }, { position: position });
      }
      break;
    default:
      return res.status(400).send("Loại không hợp lệ");
  }

  res.redirect(req.get("referer") || "/admin/products");
};

//[DELETE] /admin/products/delete/:id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne({ _id: id }, { deleted: true, deleteAt: new Date() });

  res.redirect(req.get("referer") || "/admin/products");
};

//
