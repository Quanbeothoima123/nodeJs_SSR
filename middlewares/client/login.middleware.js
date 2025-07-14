module.exports.loginPost = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    req.flash("error", "Vui lòng nhập email!");
    return res.redirect(req.get("referer"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash("error", "Email không hợp lệ!");
    return res.redirect(req.get("referer"));
  }

  if (!password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    return res.redirect(req.get("referer"));
  }

  next();
};
