module.exports.validateEdit = (req, res, next) => {
  const { fullName, email, password, phone } = req.body;
  let hasError = false;

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

  // Nếu có lỗi → quay lại form
  if (hasError) {
    res.redirect(req.get("referer"));
    return;
  }

  // Không có lỗi → tiếp tục
  next();
};
