module.exports.validateCreate = (req, res, next) => {
  const { title, description, content, category, featured, status } = req.body;

  let hasError = false;

  // Kiểm tra tiêu đề
  if (!title || title.trim() === "") {
    req.flash("error", "Vui lòng nhập tiêu đề bài viết");
    hasError = true;
  }

  // Kiểm tra mô tả
  else if (!description || description.trim().length < 10) {
    req.flash("error", "Mô tả phải có ít nhất 10 ký tự");
    hasError = true;
  }

  // Kiểm tra nội dung
  else if (!content || content.trim().length < 20) {
    req.flash("error", "Nội dung bài viết phải có ít nhất 20 ký tự");
    hasError = true;
  }

  // Kiểm tra danh mục
  else if (!category || category.trim() === "") {
    req.flash("error", "Vui lòng chọn danh mục cho bài viết");
    hasError = true;
  }

  // Kiểm tra featured
  else if (!["hot", "normal"].includes(featured)) {
    req.flash("error", "Featured không hợp lệ (hot hoặc normal)");
    hasError = true;
  }

  // Kiểm tra trạng thái
  else if (!["active", "inactive"].includes(status)) {
    req.flash("error", "Trạng thái không hợp lệ");
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
