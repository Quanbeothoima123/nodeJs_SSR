const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");
const { response } = require("express");

module.exports.requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Nếu không có token → redirect
    if (!token) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    // Tìm user theo token
    const user = await Account.findOne({ token, deleted: false }).select(
      "-password"
    );

    // Nếu không tìm thấy user → redirect
    if (!user) {
      return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    }

    const role = await Role.findOne({
      deleted: false,
      _id: user.role_id,
    }).select("title permissions");
    // Gắn user vào request để sử dụng sau này nếu cần
    res.locals.user = user;
    res.locals.role = role;
    // Cho phép đi tiếp
    next();
  } catch (err) {
    console.error("Lỗi middleware requireAuth:", err);
    return res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
  }
};
