const User = require("../../models/user.model");
module.exports.requireAuth = async (req, res, next) => {
  try {
    const tokenUser = req.cookies.tokenUser;

    // Nếu không có token → redirect
    if (!tokenUser) {
      return res.redirect(`user/login`);
    }

    // Tìm user theo token
    const user = await User.findOne({ tokenUser, deleted: false }).select(
      "-password"
    );

    // Nếu không tìm thấy user → redirect
    if (!user) {
      return res.redirect(`user/login`);
    }
    res.locals.user = user;
    // Cho phép đi tiếp
    next();
  } catch (err) {
    console.error("Lỗi middleware requireAuth:", err);
    return res.redirect(`user/login`);
  }
};
