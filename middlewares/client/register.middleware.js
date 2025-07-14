const User = require("../../models/user.model");
module.exports.registerPost = async (req, res, next) => {
  const { fullName, email, password, confirmPassword } = req.body;

  if (!fullName) {
    req.flash("error", "Vui lòng nhập họ tên!");
    res.redirect(req.get("referer"));
  }

  if (!email) {
    req.flash("error", "Vui lòng nhập email!");
    res.redirect(req.get("referer"));
  }

  // Regex kiểm tra định dạng email đơn giản
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Email không hợp lệ!");
    res.redirect(req.get("referer"));
  }
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    req.flash("error", "Email đã được sử dụng!");
    res.redirect(req.get("referer"));
  }

  if (!password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    res.redirect(req.get("referer"));
  }

  if (password.length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự!");
    res.redirect(req.get("referer"));
  }

  if (!confirmPassword) {
    req.flash("error", "Vui lòng nhập lại mật khẩu!");
    res.redirect(req.get("referer"));
  }

  if (password !== confirmPassword) {
    req.flash("error", "Mật khẩu xác nhận không khớp!");
    res.redirect(req.get("referer"));
  }

  next();
};
