const { deleteModel } = require("mongoose");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const md5 = require("md5");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helper/filterStatus");
const searchHelper = require("../../helper/search");
const paginationHelper = require("../../helper/pagination");
const mongoose = require("mongoose");
// [GET] /admin/accounts
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

  // đoạn tìm kiếm bằng từ tên sản phẩm
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  //pagination
  const countAccounts = await Account.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countAccounts
  );

  //SORT
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else sort.fullName = "desc";
  //END SORT

  const accounts = await Account.find(find)
    .set("-password -token")
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

  for (const account of accounts) {
    const role = await Role.findOne({
      _id: account.role_id,
      deleted: false,
    });

    account.role = role;
  }

  res.render("admin/pages/accounts/index", {
    pageTitle: "Trang danh sách tài khoản",
    accounts: accounts,
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

  await Account.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái thành công!");

  res.redirect(req.get("referer") || "/admin/accounts"); // Quay trở lại trang trước hoặc trở về mặc định sản phẩm
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
// [GET] /admin/accounts/create

module.exports.create = async (req, res) => {
  const roles = await Role.find({
    deleted: false,
  });
  res.render("admin/pages/accounts/create", {
    pageTitle: "Tạo mới tài khoản",
    roles: roles,
  });
};

// [POST] Tạo mới tài khoản
module.exports.createPost = async (req, res) => {
  // Làm sạch dữ liệu
  const { fullName, email, password, phone, avatar, role_id, status } =
    req.body;

  const account = new Account({
    fullName,
    email,
    password,
    phone,
    avatar: avatar || "", // nếu dùng multer để upload ảnh
    role_id,
    status,
  });
  account.password = md5(account.password);
  await account.save();

  res.redirect(`${systemConfig.prefixAdmin}/accounts`);
};

// [GET] /admin/accounts/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };

    const account = await Account.findOne(find);
    const role = await Role.findOne({
      _id: account.role_id,
      deleted: false,
    });

    account.role = role;
    // Nếu không tìm thấy role thì quay về danh sách
    if (!account) {
      return res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }
    res.render("admin/pages/accounts/detail", {
      pageTitle: "Chi tiết tài khoản",
      account: account,
    });
  } catch (error) {
    console.error(error); // Ghi log lỗi để debug
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};

// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  let find = {
    _id: req.params.id,
    deleted: false,
  };

  try {
    const account = await Account.findOne(find);

    const roles = await Role.find({
      deleted: false,
    });

    res.render("admin/pages/accounts/edit", {
      pageTitle: "Chỉnh sửa tài khoản",
      account: account,
      roles: roles,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  }
};

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const accountId = req.params.id;
    const emailExist = await Account.findOne({
      _id: { $ne: accountId },
      email: req.body.email,
      deleted: false,
    });
    // Lấy dữ liệu tài khoản cũ
    const oldAccount = await Account.findById(accountId);
    if (!req.body.avatar) {
      req.body.avatar = oldAccount.avatar;
    }
    // Chuẩn hóa dữ liệu cập nhật
    const updateData = {
      fullName: req.body.fullName?.trim(),
      email: req.body.email?.trim(),
      role: req.body.role,
      status: req.body.status || "inactive",
      avatar: req.body.avatar,
    };
    if (req.body.password && req.body.password.trim() !== "") {
      updateData.password = md5(req.body.password.trim());
    }

    if (emailExist) {
      req.flash("error", "Tài khoản email đã tồn tại");
      return res.redirect(req.get("referer"));
    }

    // Nếu không trùng email thì tiếp tục cập nhật
    await Account.updateOne({ _id: accountId }, updateData);
    req.flash("success", "Cập nhật tài khoản thành công");
    res.redirect(`${systemConfig.prefixAdmin}/accounts`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật tài khoản thất bại");
    res.redirect(req.get("referer"));
  }
};

// //[DELETE] /admin/roles/delete/:id

// module.exports.deleteItem = async (req, res) => {
//   const id = req.params.id;
//   await Role.updateOne({ _id: id }, { deleted: true, deleteAt: new Date() });
//   req.flash("success", `Xóa thành công vai trò`);
//   res.redirect(req.get("referer") || "/admin/roles");
// };

// //[Permissions] /admin/roles/permissions

// module.exports.permissions = async (req, res) => {
//   let find = {
//     deleted: false,
//   };
//   const records = await Role.find(find);
//   res.render("admin/pages/roles/permissions", {
//     pageTitle: "Phân quyền",
//     records: records,
//   });
// };

// //[Patch] /admin/roles/permissionsPatch

// module.exports.permissionsPatch = async (req, res) => {
//   try {
//     const permissions = JSON.parse(req.body.permissions);

//     for (const item of permissions) {
//       await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
//     }
//     req.flash("success", `Cập nhật quyền thành công`);
//     res.redirect(`${systemConfig.prefixAdmin}/roles/permissions`);
//   } catch (error) {
//     req.flash("error", `Cập nhật quyền thất bại`);
//     res.redirect(req.get("referer"));
//   }
// };
