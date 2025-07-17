const { deleteModel } = require("mongoose");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const createTreeHelper = require("../../helper/createTree");

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

  //SORT
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else sort.position = "desc";
  //END SORT

  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  //Lấy ra người tạo sản phẩm và thời gian tạo sản phẩm
  for (const product of products) {
    const accountId = product?.createdBy?.account_id;
    if (accountId === undefined) {
      product.timeCreated = null;
    } else {
      product.timeCreated = product.createdBy.createdAt;
    }
    if (!accountId) {
      product.accountFullName = "Chưa biết";
      continue;
    }

    const user = await Account.findOne({ _id: accountId });
    product.accountFullName = user ? user.fullName : "Chưa biết";
  }

  //Lấy ra người cập nhật sản phẩm mới nhất và thời gian cập nhật sản phẩm
  for (const product of products) {
    const accountId =
      product?.updatedBy[product.updatedBy.length - 1]?.account_id;
    if (accountId === undefined) {
      product.timeUpdated = null;
    } else {
      product.timeUpdated =
        product.updatedBy[product.updatedBy.length - 1].updatedAt;
    }
    if (!accountId) {
      product.accountFullNameUpdated = "Chưa biết";
      continue;
    }

    const user = await Account.findOne({ _id: accountId });
    product.accountFullNameUpdated = user ? user.fullName : "Chưa biết";
  }
  res.render("admin/pages/products/index", {
    pageTitle: "Trang sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });

  //END PAGINATION
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("ID không hợp lệ");
  }

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  await Product.updateOne(
    { _id: id },
    { status, $push: { updatedBy: updatedBy } }
  );

  req.flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(req.get("referer") || "/admin/products"); // Quay trở lại trang trước hoặc trở về mặc định sản phẩm
};

//[PATCH] /admin/products/changeMulti, active, inactive, delete-all
module.exports.changeMulti = async (req, res) => {
  const { type, ids } = req.body;
  const idArray = ids.split(",");

  if (idArray.length === 0) {
    return res.status(400).send("Không có ID hợp lệ");
  }
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  switch (type) {
    case "active":
      await Product.updateMany(
        { _id: { $in: idArray } },
        { status: "active", $push: { updatedBy: updatedBy } }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} sản phẩm`
      );
      break;
    case "inactive":
      await Product.updateMany(
        { _id: { $in: idArray } },
        { status: "inactive", $push: { updatedBy: updatedBy } }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} sản phẩm`
      );
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: idArray } },
        {
          deleted: true,
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      );
      req.flash("success", `Xóa thành công của ${idArray.length} sản phẩm`);
      break;
    case "change-position":
      for (const item of idArray) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne(
          { _id: id },
          { position: position, $push: { updatedBy: updatedBy } }
        );
      }
      req.flash(
        "success",
        `Thay đổi vị trí thành công của ${idArray.length} sản phẩm`
      );
      break;
    default:
      return res.status(400).send("Loại không hợp lệ");
  }

  res.redirect(req.get("referer") || "/admin/products");
};

//[DELETE] /admin/products/delete/:id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );
  req.flash("success", `Xóa thành công sản phẩm`);
  res.redirect(req.get("referer") || "/admin/products");
};

// [POST] /admin/products/create

module.exports.create = async (req, res) => {
  const productCategories = await ProductCategory.find({ deleted: false });
  const newProductCategories = createTreeHelper.tree(productCategories);
  res.render("admin/pages/products/create", {
    pageTitle: "Tạo mới sản phẩm",
    productCategories: newProductCategories,
  });
};
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position == "") {
    const countProducts = await Product.countDocuments();

    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  req.body.createdBy = {
    account_id: res.locals.user.id,
  };
  const product = new Product(req.body);
  await product.save();
  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Product.findOne(find);
    const productCategories = await ProductCategory.find({
      deleted: false,
    });
    const newProductCategories = createTreeHelper.tree(productCategories);
    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      productCategories: newProductCategories,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (!req.body.thumbnail) {
    // Nếu không upload ảnh mới, lấy lại ảnh cũ từ DB
    const oldProduct = await Product.findById(req.params.id);
    req.body.thumbnail = oldProduct.thumbnail;
  }
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  try {
    await Product.updateOne(
      { _id: req.params.id },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
    req.flash("success", "Cập nhật sản phẩm thành công");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật sản phẩm thất bại");
  }

  res.redirect(req.get("referer"));
};

// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const product = await Product.findOne(find);
    if (product.category) {
      const category = await ProductCategory.findOne({ _id: product.category });
      product.productCategory = category.title;
    }
    res.render("admin/pages/products/detail", {
      pageTitle: "Chi tiết sản phẩm",
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
