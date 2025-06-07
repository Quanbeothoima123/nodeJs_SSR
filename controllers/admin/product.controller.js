const { deleteModel } = require("mongoose");
const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const { ObjectId } = require("mongoose").Types;
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

//[Get] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  console.log("Query string:", req.query); // Debug query string

  if (!ObjectId.isValid(id)) {
    console.error("ID không hợp lệ:", id);
    return res.redirect("/admin/products");
  }

  await Product.updateOne({ _id: id }, { status: status });

  const queryString = req.query
    ? new URLSearchParams(req.query).toString()
    : "";
  console.log(
    "Redirect URL:",
    `/admin/products${queryString ? `?${queryString}` : ""}`
  );
  res.redirect(`/admin/products${queryString ? `?${queryString}` : ""}`);
};
