const { deleteModel } = require("mongoose");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const md5 = require("md5");
// [GET] /admin/my-account
module.exports.index = async (req, res) => {
  res.render("admin/pages/my-account/index", {
    pageTitle: "Trang cá nhân",
  });
};
module.exports.edit = async (req, res) => {
  res.render("admin/pages/my-account/edit", {
    pageTitle: "Chỉnh sửa trang cá nhân",
  });
};
// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const accountId = res.locals.user.id;
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
    res.redirect(`${systemConfig.prefixAdmin}/my-account`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Cập nhật tài khoản thất bại");
    res.redirect(req.get("referer"));
  }
};
