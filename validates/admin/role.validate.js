module.exports.validateCreate = (req, res, next) => {
  const { title, description } = req.body;
  let hasError = false;

  // Kiểm tra tên nhóm quyền
  if (!title || title.trim() === "") {
    req.flash("error", "Vui lòng nhập tên nhóm quyền");
    hasError = true;
  }

  // Kiểm tra mô tả
  else if (!description || description.trim().length < 5) {
    req.flash("error", "Mô tả nhóm quyền phải có ít nhất 5 ký tự");
    hasError = true;
  }

  // Nếu có lỗi → quay lại trang trước
  if (hasError) {
    res.redirect(req.get("referer"));
    return;
  }

  // Không có lỗi → tiếp tục
  next();
};
