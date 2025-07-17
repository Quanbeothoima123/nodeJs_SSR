const { deleteModel } = require("mongoose");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const md5 = require("md5");
const systemConfig = require("../../config/system");
// [GET] /admin/accounts
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const accounts = await Account.find(find).set("-password -token");

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
  });
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
