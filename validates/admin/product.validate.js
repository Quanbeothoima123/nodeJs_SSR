module.exports.validateCreate = (req, res, next) => {
  const {
    title,
    description,
    price,
    discountPercentage,
    stock,
    position,
    status,
  } = req.body;
  let hasError = false;

  // Kiểm tra tiêu đề
  if (!title || title.trim() === "") {
    req.flash("error", "Vui lòng nhập tiêu đề sản phẩm");
    hasError = true;
  }

  // Kiểm tra mô tả
  else if (!description || description.trim().length < 10) {
    req.flash("error", "Mô tả phải có ít nhất 10 ký tự");
    hasError = true;
  }

  // Kiểm tra giá
  else if (isNaN(price) || Number(price) <= 0) {
    req.flash("error", "Giá sản phẩm phải lớn hơn 0");
    hasError = true;
  }

  // Kiểm tra giảm giá
  else if (
    discountPercentage &&
    (Number(discountPercentage) < 0 || Number(discountPercentage) > 100)
  ) {
    req.flash("error", "% giảm giá phải nằm trong khoảng 0 - 100");
    hasError = true;
  }

  // Kiểm tra số lượng tồn kho
  else if (isNaN(stock) || Number(stock) < 0) {
    req.flash("error", "Số lượng tồn kho phải lớn hơn hoặc bằng 0");
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

  // Nếu có lỗi → redirect về lại
  if (hasError) {
    res.redirect(req.get("referer"));
    return;
  }

  // Không có lỗi → chuyển tiếp
  next();
};
