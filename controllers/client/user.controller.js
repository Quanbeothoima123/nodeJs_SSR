const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.model");
const md5 = require("md5");
const setCookie = require("../../helper/setCookie");
const generateHelper = require("../../helper/generate");
//[GET] user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng kí tài khoản",
  });
};
//[POST] user/register
module.exports.registerPost = async (req, res) => {
  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password),
  });
  user.save();
  req.flash("success", "Đăng kí tài khoản thành công!");

  res.redirect("/user/login");
};
//[GET] user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập",
  });
};
//[POST] user/login
module.exports.loginPost = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "Tài khoản không tồn tại!");
    return res.redirect("back");
  }

  if (user.status !== "active") {
    req.flash("error", "Tài khoản của bạn đang bị khóa!");
    return res.redirect("back");
  }

  const hashedPassword = md5(password);
  if (hashedPassword !== user.password) {
    req.flash("error", "Mật khẩu không đúng!");
    return res.redirect("back");
  }

  // Đăng nhập thành công
  req.flash("success", "Đăng nhập thành công!");
  setCookie(res, "tokenUser", user.tokenUser, 1); // bạn đã viết sẵn helper setCookie
  return res.redirect("/");
};
//[GET] user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  return res.redirect("/");
};

//[GET] user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgotPassword", {
    pageTitle: "Quên mật khẩu",
  });
};
//[POST] user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  // Kiểm tra nếu đã có OTP chưa hết hạn
  const existingOTP = await ForgotPassword.findOne({ email });

  if (existingOTP) {
    const now = Date.now();
    const expires = new Date(existingOTP.expireAt).getTime();

    if (expires > now) {
      const remaining = Math.ceil((expires - now) / 1000); // đổi ms → giây
      req.flash("error", `Vui lòng chờ ${remaining} giây để gửi lại mã!`);
      return res.redirect(req.get("referer"));
    }
  }
  // Tạo OTP mới
  const otp = generateHelper.generateRandomNumber(8);

  await ForgotPassword.create({
    email: email,
    otp: otp,
    expireAt: new Date(Date.now() + 300 * 1000), // 300 giây (5 phút)
  });

  // TODO: gửi email tại đây

  req.flash("success", "Mã xác nhận đã được gửi về email!");
  return res.redirect(req.get("referer"));
};
