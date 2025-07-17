const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const ForgotPassword = require("../../models/forgot-password.model");
const md5 = require("md5");
const setCookie = require("../../helper/setCookie");
const generateHelper = require("../../helper/generate");
const sendMailHelper = require("../../helper/sendMail");
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
    return res.redirect(req.get("referer"));
  }

  if (user.status !== "active") {
    req.flash("error", "Tài khoản của bạn đang bị khóa!");
    return res.redirect(req.get("referer"));
  }

  const hashedPassword = md5(password);
  if (hashedPassword !== user.password) {
    req.flash("error", "Mật khẩu không đúng!");
    return res.redirect(req.get("referer"));
  }
  setCookie(res, "tokenUser", user.tokenUser, 1); // bạn đã viết sẵn helper setCookie

  const cartDoc = await Cart.findOne({
    user_id: user.id,
  });

  if (cartDoc) {
    setCookie(res, "cartId", cartDoc._id.toString(), 1);
  } else {
    const cartNew = new Cart({ user_id: user.id });
    await cartNew.save();
    setCookie(res, "cartId", cartNew._id.toString(), 1);
  }

  // Đăng nhập thành công
  req.flash("success", "Đăng nhập thành công!");

  return res.redirect("/");
};
//[GET] user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("cartId");
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
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="text-align: center; color: #333;">Xác nhận mã OTP</h2>
    <p style="font-size: 16px; color: #555;">Chào bạn,</p>
    <p style="font-size: 16px; color: #555;">
      Đây là mã OTP của bạn để đặt lại mật khẩu. Vui lòng không chia sẻ mã này với bất kỳ ai.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #ffffff; background-color: #007BFF; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
        ${otp}
      </span>
    </div>
    <p style="font-size: 14px; color: #888;">
      Mã OTP sẽ hết hạn sau 5 phút. Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.
    </p>
    <p style="font-size: 14px; color: #888;">Trân trọng,<br>Đội ngũ hỗ trợ</p>
  </div>
`;

  sendMailHelper.sendMail(email, html);

  req.flash("success", "Mã xác nhận đã được gửi về email!");
  return res.redirect(`/user/password/otp?email=${email}`);
};
//[GET] user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;
  res.render("client/pages/user/otpPassword", {
    pageTitle: "Nhập OTP",
    email: email,
  });
};
//[POST] user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const forgotPasswordInfo = await ForgotPassword.findOne({ email: email });

  if (!otp) {
    req.flash("error", "Vui lòng nhập mã OTP!");
    return res.redirect(req.get("referer"));
  }

  if (forgotPasswordInfo && otp === forgotPasswordInfo.otp) {
    const userInfo = await User.findOne({
      email: email,
    });
    await ForgotPassword.deleteOne({ email: email });
    setCookie(res, "tokenUser", userInfo.tokenUser, 1);
    return res.redirect("/user/password/reset");
  } else {
    req.flash("error", "Mã OTP sai!");
    return res.redirect(req.get("referer"));
  }
};
//[GET] user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/resetPassword", {
    pageTitle: "Thay đổi mật khẩu",
  });
};

//[POST] user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;
  // Tìm user theo token
  const user = await User.findOne({ tokenUser: tokenUser });

  if (!user) {
    req.flash("error", "Không tìm thấy người dùng.");
    return res.redirect("/user/password/otp");
  }

  // Mã hóa mật khẩu mới
  const hashedPassword = await md5(password);

  // Cập nhật mật khẩu
  user.password = hashedPassword;
  await user.save();

  // Xóa token cookie sau khi reset xong
  res.clearCookie("tokenUser");

  req.flash("success", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
  return res.redirect("/user/login");
};

//[GET] user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pageTitle: "Thông tin cá nhân",
  });
};

//[PATCH] user/info/update
module.exports.infoUpdate = async (req, res) => {
  try {
    const tokenUser = req.cookies.tokenUser; // Lấy từ middleware auth
    if (!req.body.avatar) {
      const oldInfo = await User.findOne({ tokenUser });
      if (oldInfo) req.body.avatar = oldInfo.avatar;
    }

    await User.updateOne({ tokenUser }, req.body);

    req.flash("success", "Cập nhật thông tin cá nhân thành công");
    res.redirect("/user/info");
  } catch (error) {
    req.flash("error", "Cập nhật thông tin thất bại");
    res.redirect("/user/info");
  }
};
