const Product = require("../../models/product.model");
const productsHelper = require("../../helper/products");
module.exports.index = async (req, res) => {
  //Lấy sản phẩm hot
  const productFeatured = await Product.find({
    status: "active",
    featured: "hot-product",
    deleted: false,
  }).limit(6);
  //Lấy sản phẩm mới nhất
  const productNew = await Product.find({
    status: "active",
    deleted: false,
  })
    .sort({ position: "desc" })
    .limit(6);
  const newProducts = productsHelper.priceNewProducts(productFeatured);
  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productFeatured: newProducts,
    productNew: productNew,
  });
};
