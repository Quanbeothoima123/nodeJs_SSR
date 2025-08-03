const { deleteModel } = require("mongoose");
const Post = require("../../models/post.model");
const Account = require("../../models/account.model");
const PostCategory = require("../../models/post-category.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const createTreeHelper = require("../../helper/createTree");

const mongoose = require("mongoose");
// [GET] /admin/products
module.exports.post = async (req, res) => {
  // đoạn bộ lọc
  const filterStatus = filterStatusHelper(req.query);
  let find = {
    deleted: false,
  };
  if (req.query.status) {
    find.status = req.query.status;
  }

  if (req.query.categoryId) {
    find.category = req.query.categoryId;
  }

  const objectSearch = searchHelper(req.query);

  // đoạn tìm kiếm bằng từ tên sản phẩm
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //pagination
  const countPosts = await Post.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countPosts
  );

  //SORT
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else sort.position = "desc";
  //END SORT

  const posts = await Post.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  //Lấy ra người tạo sản phẩm và thời gian tạo sản phẩm
  for (const post of posts) {
    const accountId = post?.createdBy?.account_id;
    if (accountId === undefined) {
      post.timeCreated = null;
    } else {
      post.timeCreated = post.createdBy.createdAt;
    }
    if (!accountId) {
      post.accountFullName = "Chưa biết";
      continue;
    }

    const user = await Account.findOne({ _id: accountId });
    post.accountFullName = user ? user.fullName : "Chưa biết";
  }

  //Lấy ra người cập nhật sản phẩm mới nhất và thời gian cập nhật sản phẩm
  for (const post of posts) {
    const accountId = post?.updatedBy[post.updatedBy.length - 1]?.account_id;
    if (accountId === undefined) {
      post.timeUpdated = null;
    } else {
      post.timeUpdated = post.updatedBy[post.updatedBy.length - 1].updatedAt;
    }
    if (!accountId) {
      post.accountFullNameUpdated = "Chưa biết";
      continue;
    }

    const user = await Account.findOne({ _id: accountId });
    post.accountFullNameUpdated = user ? user.fullName : "Chưa biết";
  }
  // Tạo cây hiển thị danh mục sản phẩm
  const postCategories = await PostCategory.find({ deleted: false });
  const newPostCategories = createTreeHelper.tree(postCategories);
  res.render("admin/pages/posts/index", {
    pageTitle: "Trang bài viết",
    posts: posts,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
    postCategories: newPostCategories,
  });

  //END PAGINATION
};

//[PATCH] /admin/posts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("ID không hợp lệ");
  }

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  await Post.updateOne(
    { _id: id },
    { status, $push: { updatedBy: updatedBy } }
  );

  req.flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(req.get("referer") || "/admin/posts"); // Quay trở lại trang trước hoặc trở về mặc định sản phẩm
};

//[PATCH] /admin/posts/changeMulti, active, inactive, delete-all
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
      await Post.updateMany(
        { _id: { $in: idArray } },
        { status: "active", $push: { updatedBy: updatedBy } }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} bài viết`
      );
      break;
    case "inactive":
      await Post.updateMany(
        { _id: { $in: idArray } },
        { status: "inactive", $push: { updatedBy: updatedBy } }
      );
      req.flash(
        "success",
        `Cập nhật trạng thái thành công của ${idArray.length} bài viết`
      );
      break;
    case "delete-all":
      await Post.updateMany(
        { _id: { $in: idArray } },
        {
          deleted: true,
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      );
      req.flash("success", `Xóa thành công của ${idArray.length} bài viết`);
      break;
    case "change-position":
      for (const item of idArray) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Post.updateOne(
          { _id: id },
          { position: position, $push: { updatedBy: updatedBy } }
        );
      }
      req.flash(
        "success",
        `Thay đổi vị trí thành công của ${idArray.length} bài viết`
      );
      break;
    default:
      return res.status(400).send("Loại không hợp lệ");
  }

  res.redirect(req.get("referer") || "/admin/posts");
};

//[DELETE] /admin/posts/delete/:id

module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Post.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );
  req.flash("success", `Xóa thành công bài viết`);
  res.redirect(req.get("referer") || "/admin/posts");
};

// [POST] /admin/posts/create

module.exports.create = async (req, res) => {
  const postCategories = await PostCategory.find({ deleted: false });
  const newPostCategories = createTreeHelper.tree(postCategories);
  res.render("admin/pages/posts/create", {
    pageTitle: "Tạo mới bài viết",
    postCategories: newPostCategories,
  });
};
module.exports.createPost = async (req, res) => {
  if (!req.body.position || req.body.position === "") {
    const countPosts = await Post.countDocuments();
    req.body.position = countPosts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  // Gắn thông tin người tạo
  req.body.createdBy = {
    account_id: res.locals.user.id,
  };
  try {
    const post = new Post(req.body);
    await post.save();

    req.flash("success", "Tạo bài viết thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/posts`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Đã có lỗi xảy ra khi tạo bài viết");
    res.redirect("back");
  }
};

// [GET] /admin/posts/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const post = await Post.findOne(find);
    const postCategories = await PostCategory.find({
      deleted: false,
    });
    const newPostCategories = createTreeHelper.tree(postCategories);
    res.render("admin/pages/posts/edit", {
      pageTitle: "Chỉnh sửa bài viết",
      post: post,
      postCategories: newPostCategories,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/posts`);
  }
};

// [PATCH] /admin/posts/edit/:id
module.exports.editPatch = async (req, res) => {
  if (!req.body.thumbnail) {
    // Nếu không upload ảnh mới, lấy lại ảnh cũ từ DB
    const oldPost = await Post.findById(req.params.id);
    req.body.thumbnail = oldPost.thumbnail;
  }
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  try {
    await Post.updateOne(
      { _id: req.params.id },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
    req.flash("success", "Cập nhật bài viết thành công");
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật bài viết thất bại");
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

    const post = await Post.findOne(find);
    if (post.category) {
      const category = await PostCategory.findOne({ _id: post.category });
      post.postCategory = category.title;
    }
    res.render("admin/pages/posts/detail", {
      pageTitle: "Chi tiết bài viết",
      post: post,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/posts`);
  }
};
