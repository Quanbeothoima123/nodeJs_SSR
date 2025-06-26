const { deleteModel } = require("mongoose");
const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const createTreeHelper = require("../../helper/createTree");
const mongoose = require("mongoose");
// Show danh sách sản phẩm [GET]
module.exports.index = async (req, res) => {
  // đoạn bộ lọc
  const filterStatus = filterStatusHelper(req.query);
  let find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  const objectSearch = searchHelper(req.query);

  // đoạn tìm kiếm bằng từ tên danh mục sản phẩm
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //pagination
  const countProductsCategory = await ProductCategory.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProductsCategory
  );

  //SORT
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else sort.position = "desc";
  //END SORT

  const records = await ProductCategory.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/products-category/index", {
    pageTitle: "Danh mục sản phẩm",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("ID không hợp lệ");
  }

  await ProductCategory.updateOne({ _id: id }, { status });

  req.flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(req.get("referer") || "/admin/products-category"); // Quay trở lại trang trước hoặc trở về mặc định danh sách sản phẩm
};

//[DELETE] /admin/products/delete/:id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await ProductCategory.updateOne(
    { _id: id },
    { deleted: true, deleteAt: new Date() }
  );
  req.flash("success", `Xóa thành công danh mục sản phẩm`);
  res.redirect(req.get("referer") || "/admin/products-category");
};

//[PATCH] /admin/products-category/changeMulti, active, inactive, delete-all
module.exports.changeMulti = async (req, res) => {
  const { type, ids } = req.body;
  const idArray = ids.split(",");

  if (idArray.length === 0) {
    return res.status(400).send("Không có ID hợp lệ");
  }

  switch (type) {
    case "active":
      await ProductCategory.updateMany(
        { _id: { $in: idArray } },
        { status: "active" }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} danh mục sản phẩm`
      );
      break;
    case "inactive":
      await ProductCategory.updateMany(
        { _id: { $in: idArray } },
        { status: "inactive" }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} danh mục sản phẩm`
      );
      break;
    case "delete-all":
      await ProductCategory.updateMany(
        { _id: { $in: idArray } },
        {
          deleted: true,
          deleteAt: new Date(),
        }
      );
      req.flash(
        "success",
        `Xóa thành công của ${idArray.length} danh mục sản phẩm`
      );
      break;
    case "change-position":
      for (const item of idArray) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await ProductCategory.updateOne({ _id: id }, { position: position });
      }
      req.flash(
        "success",
        `Thay đổi vị trí thành công của ${idArray.length} danh mục sản phẩm`
      );
      break;
    default:
      return res.status(400).send("Loại không hợp lệ");
  }

  res.redirect(req.get("referer") || "/admin/products-category");
};

//[GET] Tạo danh mục sản phẩm mới
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };
  const records = await ProductCategory.find(find);

  const newRecords = createTreeHelper.tree(records);
  res.render("admin/pages/products-category/create", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: newRecords,
  });
};
// [POST] Tạo mới danh mục sản phẩm
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

// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const productCategory = await ProductCategory.findOne(find);

    res.render("admin/pages/products-category/edit", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      productCategory: productCategory,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};

// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  const { title, description, parent_id, position, status } = req.body;

  // Lấy bản ghi cũ để dùng ảnh nếu không có ảnh mới
  const oldCategory = await ProductCategory.findById(req.params.id);

  const data = {
    title: title?.trim(),
    description: description?.trim(),
    status,
    parent_id: parent_id?.trim() || "",
    position: parseInt(position) || 1,
    thumbnail: req.body.thumbnail || oldCategory.thumbnail, // Giữ ảnh cũ nếu không upload ảnh mới
  };

  try {
    await ProductCategory.updateOne({ _id: req.params.id }, data);
    req.flash("success", "Cập nhật danh mục thành công");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật danh mục thất bại");
  }

  res.redirect(req.get("referer"));
};
// [GET] /admin/products-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const productCategory = await ProductCategory.findOne(find);

    // Nếu không tìm thấy thì quay về danh sách
    if (!productCategory) {
      return res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }

    let productCategoryParent = null;
    if (productCategory.parent_id) {
      const findParent = {
        deleted: false,
        _id: productCategory.parent_id,
      };
      productCategoryParent = await ProductCategory.findOne(findParent);
    }

    res.render("admin/pages/products-category/detail", {
      pageTitle: "Chi tiết danh mục sản phẩm",
      productCategory,
      productCategoryParent,
    });
  } catch (error) {
    console.error(error); // Ghi log lỗi để debug
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};
