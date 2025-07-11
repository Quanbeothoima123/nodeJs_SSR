/**
 * Hàm helper để set cookie với thời gian hết hạn tính theo ngày.
 * @param {Object} res - Đối tượng response của Express.
 * @param {string} name - Tên của cookie.
 * @param {string} value - Giá trị của cookie.
 * @param {number} days - Số ngày cookie sẽ tồn tại.
 */
function setCookie(res, name, value, days) {
  const options = {
    maxAge: days * 24 * 60 * 60 * 1000, // chuyển từ ngày sang milliseconds
    httpOnly: true, // tăng bảo mật, không cho JS truy cập
  };
  res.cookie(name, value, options);
}

module.exports = setCookie;
