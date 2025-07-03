const { deleteModel } = require("mongoose");
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const md5 = require("md5");
const systemConfig = require("../../config/system");
module.exports.login = async (req, res) => {
  try {
    const token = req.cookies.token;

    // Nếu đã có token hợp lệ thì chuyển hướng sang dashboard
    if (token) {
      const user = await Account.findOne({ token, deleted: false });
      if (user) {
        return res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
      }
    }

    // Nếu chưa login, thì hiển thị trang đăng nhập
    res.render("admin/pages/auth/login", {
      pageTitle: "Trang đăng nhập",
    });
  } catch (err) {
    console.error("Lỗi khi kiểm tra login:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await Account.findOne({
    email: email,
    deleted: false,
  });
  if (!user) {
    req.flash("error", "Tài khoản không tồn tại");
    res.redirect(req.get("referer"));
    return;
  }
  if (md5(password) != user.password) {
    req.flash("error", "Sai mật khẩu");
    res.redirect(req.get("referer"));
    return;
  }
  if (user.status === "inactive") {
    req.flash("error", "Tài khoản đã bị khóa!");
    res.redirect(req.get("referer"));
    return;
  }
  res.cookie("token", user.token);
  res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
};
module.exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
