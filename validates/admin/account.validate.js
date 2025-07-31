const Account = require("../../models/account.model");
module.exports.validateCreate = async (req, res, next) => {
  const { fullName, email, password, phone, role_id, status } = req.body;
  let hasError = false;
  const emailExist = await Account.findOne({ email: email });
  // Kiểm tra họ tên
  if (!fullName || fullName.trim() === "") {
    req.flash("error", "Vui lòng nhập họ tên");
    hasError = true;
  }

  // Kiểm tra email
  else if (
    !email ||
    email.trim() === "" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    req.flash("error", "Email không hợp lệ");
    hasError = true;
  }
  //  Kiếm tra tồn tại email
  else if (emailExist) {
    req.flash("error", "Email đã tồn tại trên hệ thống");
    hasError = true;
  }
  // Kiểm tra mật khẩu
  else if (!password || password.trim().length < 6) {
    req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự");
    hasError = true;
  }

  // Kiểm tra số điện thoại (nếu có nhập)
  else if (
    phone &&
    phone.trim() !== "" &&
    !/^[0-9]{9,15}$/.test(phone.trim())
  ) {
    req.flash("error", "Số điện thoại không hợp lệ");
    hasError = true;
  }

  // Kiểm tra role_id
  else if (!role_id) {
    req.flash("error", "Vui lòng chọn phân quyền hợp lệ");
    hasError = true;
  }

  // Kiểm tra trạng thái
  else if (!["active", "inactive"].includes(status)) {
    req.flash("error", "Trạng thái không hợp lệ");
    hasError = true;
  }

  // Nếu có lỗi → quay lại form
  if (hasError) {
    res.redirect(req.get("referer"));
    return;
  }

  // Không có lỗi → tiếp tục
  next();
};

module.exports.editPatch = (req, res, next) => {
  if (!req.body.fullName) {
    req.flash("error", "Vui lòng nhập họ tên!");
    res.redirect(req.get("referer"));
    return;
  }

  if (!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    res.redirect(req.get("referer"));
    return;
  }

  next();
};
