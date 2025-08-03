const { deleteModel } = require("mongoose");
const PostCategory = require("../../models/post-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const createTreeHelper = require("../../helper/createTree");
const mongoose = require("mongoose");
// Show danh sách danh mục bài viết [GET]
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
  const records = await PostCategory.find(find);
  //Lấy ra người tạo sản phẩm và thời gian tạo sản phẩm
  for (const record of records) {
    const accountId = record?.createdBy?.account_id;
    if (accountId === undefined) {
      record.timeCreated = null;
    } else {
      record.timeCreated = record.createdBy.createdAt;
    }
    if (!accountId) {
      record.accountFullName = "Chưa biết";
      continue;
    }

    const user = await Account.findOne({ _id: accountId });
    record.accountFullName = user ? user.fullName : "Chưa biết";
  }

  //Lấy ra người cập nhật sản phẩm mới nhất và thời gian cập nhật sản phẩm
  for (const record of records) {
    const accountId =
      record?.updatedBy[record.updatedBy.length - 1]?.account_id;
    if (accountId === undefined) {
      record.timeUpdated = null;
    } else {
      record.timeUpdated =
        record.updatedBy[record.updatedBy.length - 1].updatedAt;
    }
    if (!accountId) {
      record.accountFullNameUpdated = "Chưa biết";
      continue;
    }

    const user = await Account.findOne({ _id: accountId });
    record.accountFullNameUpdated = user ? user.fullName : "Chưa biết";
  }
  const newRecords = createTreeHelper.tree(records);

  res.render("admin/pages/posts-category/index", {
    pageTitle: "Danh mục bài viết",
    records: newRecords,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
  });
};

//[GET] Tạo danh mục bài viết mới
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };
  const records = await PostCategory.find(find);
  const newRecords = createTreeHelper.tree(records);
  res.render("admin/pages/posts-category/create", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: newRecords,
  });
};

// [POST] Tạo mới danh mục bài viết
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
    const count = await PostCategory.countDocuments();
    data.position = count + 1;
  } else {
    data.position = parseInt(position);
  }
  data.createdBy = { account_id: res.locals.user.id };
  // Tạo và lưu danh mục
  const postCategory = new PostCategory(data);
  await postCategory.save();

  res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
};

// [GET] /admin/posts-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const postCategory = await PostCategory.findOne(find);

    const records = await PostCategory.find({
      deleted: false,
    });

    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/posts-category/edit", {
      pageTitle: "Chỉnh sửa danh mục bài viết",
      postCategory: postCategory,
      records: newRecords,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
  }
};

// [PATCH] /admin/posts-category/edit/:id
module.exports.editPatch = async (req, res) => {
  const { title, description, parent_id, position, status } = req.body;

  // Lấy bản ghi cũ để dùng ảnh nếu không có ảnh mới
  const oldCategoryPost = await PostCategory.findById(req.params.id);

  const data = {
    title: title?.trim(),
    description: description?.trim(),
    status,
    parent_id: parent_id?.trim() || "",
    position: parseInt(position) || 1,
    thumbnail: req.body.thumbnail || oldCategoryPost.thumbnail, // Giữ ảnh cũ nếu không upload ảnh mới
  };
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  try {
    await PostCategory.updateOne(
      { _id: req.params.id },
      { $set: data, $push: { updatedBy: updatedBy } }
    );
    req.flash("success", "Cập nhật danh mục bài viết thành công");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật danh mục bài viết thất bại");
    res.redirect(req.get("referer"));
    return;
  }
  res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
};

// [GET] /admin/posts-category/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const postCategory = await PostCategory.findOne(find);

    // Nếu không tìm thấy thì quay về danh sách
    if (!postCategory) {
      return res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
    }

    let postCategoryParent = null;
    if (postCategory.parent_id) {
      const findParent = {
        deleted: false,
        _id: postCategory.parent_id,
      };
      postCategoryParent = await PostCategory.findOne(findParent);
    }

    res.render("admin/pages/posts-category/detail", {
      pageTitle: "Chi tiết danh mục sản phẩm",
      postCategory,
      postCategoryParent,
    });
  } catch (error) {
    console.error(error); // Ghi log lỗi để debug
    res.redirect(`${systemConfig.prefixAdmin}/posts-category`);
  }
};

//[DELETE] /admin/posts-category/delete/:id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await PostCategory.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );
  req.flash("success", `Xóa thành công danh mục bài viết`);
  res.redirect(req.get("referer") || "/admin/posts-category");
};

//[PATCH] /admin/posts-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("ID không hợp lệ");
  }

  await PostCategory.updateOne({ _id: id }, { status });

  req.flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(req.get("referer") || "/admin/posts-category"); // Quay trở lại trang trước hoặc trở về mặc định danh sách sản phẩm
};

//[PATCH] /admin/posts-category/changeMulti, active, inactive, delete-all
module.exports.changeMulti = async (req, res) => {
  const { type, ids } = req.body;
  const idArray = ids.split(",");

  if (idArray.length === 0) {
    return res.status(400).send("Không có ID hợp lệ");
  }

  switch (type) {
    case "active":
      await PostCategory.updateMany(
        { _id: { $in: idArray } },
        { status: "active" }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} danh mục bài viết`
      );
      break;
    case "inactive":
      await PostCategory.updateMany(
        { _id: { $in: idArray } },
        { status: "inactive" }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} danh mục bài viết`
      );
      break;
    case "delete-all":
      await PostCategory.updateMany(
        { _id: { $in: idArray } },
        {
          deleted: true,
          deleteAt: new Date(),
        }
      );
      req.flash(
        "success",
        `Xóa thành công của ${idArray.length} danh mục bài viết`
      );
      break;
    case "change-position":
      for (const item of idArray) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await PostCategory.updateOne({ _id: id }, { position: position });
      }
      req.flash(
        "success",
        `Thay đổi vị trí thành công của ${idArray.length} danh mục bài viết`
      );
      break;
    default:
      return res.status(400).send("Loại không hợp lệ");
  }

  res.redirect(req.get("referer") || "/admin/posts-category");
};
