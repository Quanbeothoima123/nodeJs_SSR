const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const productsHelper = require("../../helper/products");
const productCategoryHelper = require("../../helper/products-category");
module.exports.index = async (req, res) => {
  const products = await Product.find({
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });

  const newProducts = productsHelper.priceNewProducts(products);

  res.render("client/pages/products/index", {
    pageTitle: "Trang sản phẩm",
    products: newProducts,
  });
};

// [GET] /Products/detail/:slugProduct
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      slug: req.params.slugProduct,
    };

    const product = await Product.findOne(find);

    const priceNew = productsHelper.priceNewProduct(product);

    product.priceNew = priceNew;

    if (product.category) {
      const productCategory = await ProductCategory.findOne({
        deleted: false,
        status: "active",
        _id: product.category,
      });

      product.productCategory = productCategory;
    }

    res.render("client/pages/products/detail", {
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    res.redirect("/products");
  }
};

module.exports.category = async (req, res) => {
  try {
    const slug = req.params.slugCategory;

    const Category = await ProductCategory.findOne({
      deleted: false,
      slug: slug,
    });

    if (!Category) {
      return res.status(404).send("Danh mục không tồn tại");
    }
    const listSubCategory = await productCategoryHelper.getSubCategory(
      Category.id
    );
    const listSubCategoryId = listSubCategory.map((item) => item.id);
    const products = await Product.find({
      deleted: false,
      category: { $in: [Category.id, ...listSubCategoryId] },
    }).sort({ position: "desc" });

    res.render("client/pages/products/index", {
      products: products,
      pageTitle: Category.title,
    });
  } catch (error) {
    res.status(500).send("Đã xảy ra lỗi máy chủ");
  }
};
