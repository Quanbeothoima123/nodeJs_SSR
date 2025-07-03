const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

module.exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Nếu không có token → redirect
    if (!token) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    // Tìm user theo token
    const user = await Account.findOne({ token, deleted: false });

    // Nếu không tìm thấy user → redirect
    if (!user) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    // Gắn user vào request để sử dụng sau này nếu cần
    req.user = user;

    // Cho phép đi tiếp
    next();
  } catch (err) {
    console.error("Lỗi middleware requireAuth:", err);
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  }
};
