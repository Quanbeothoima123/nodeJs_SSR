module.exports.validateCreate = (req, res, next) => {
  const { title, description, parent_id, position, status } = req.body;
  let hasError = false;

  // Kiểm tra tiêu đề
  if (!title || title.trim() === "") {
    req.flash("error", "Vui lòng nhập tên danh mục");
    hasError = true;
  }

  // Kiểm tra mô tả
  else if (!description || description.trim().length < 5) {
    req.flash("error", "Mô tả danh mục phải có ít nhất 5 ký tự");
    hasError = true;
  }

  // Kiểm tra parent_id (nếu có nhập)
  else if (
    parent_id &&
    parent_id.trim() !== "" &&
    !/^[a-f\d]{24}$/i.test(parent_id)
  ) {
    req.flash("error", "ID danh mục cha không hợp lệ");
    hasError = true;
  }

  // Kiểm tra vị trí nếu có nhập
  else if (position && (isNaN(position) || Number(position) < 1)) {
    req.flash("error", "Vị trí phải lớn hơn hoặc bằng 1");
    hasError = true;
  }

  // Kiểm tra trạng thái
  else if (!["active", "inactive"].includes(status)) {
    req.flash("error", "Trạng thái không hợp lệ");
    hasError = true;
  }

  // Nếu có lỗi → redirect lại form
  if (hasError) {
    res.redirect(req.get("referer"));
    return;
  }

  // Không có lỗi → next
  next();
};
