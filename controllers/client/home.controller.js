const Product = require("../../models/product.model");
const productsHelper = require("../../helper/products");
module.exports.index = async (req, res) => {
  const productFeatured = await Product.find({
    status: "active",
    featured: "hot-product",
    deleted: false,
  });
  const newProducts = productsHelper.priceNewProducts(productFeatured);
  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productFeatured: newProducts,
  });
};
