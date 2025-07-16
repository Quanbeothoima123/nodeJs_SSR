const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const productHelper = require("../../helper/products");
//[GET] cart/index
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({
    _id: cartId,
  });
  if (cart.products.length > 0) {
    for (item of cart.products) {
      const productId = item.product_id;
      const productInfo = await Product.findOne({
        _id: productId,
      }).select("thumbnail title slug price discountPercentage stock");
      productInfo.priceNew = productHelper.priceNewProduct(productInfo);
      item.totalPrice = productInfo.priceNew * item.quantity;
      item.productInfo = productInfo;
    }
  }
  cart.totalPrice = cart.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  res.render("client/pages/cart/index", {
    pageTitle: "Trang giỏ hàng",
    cartDetail: cart,
  });
};

//[POST] cart/add

module.exports.addPost = async (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId,
  });

  const existProduct = cart.products.find(
    (product) => product.product_id === productId
  );
  if (existProduct) {
    const quantityNew = quantity + existProduct.quantity;
    await Cart.updateOne(
      { _id: cartId, "products.product_id": productId },
      {
        $set: {
          "products.$.quantity": quantityNew,
        },
      }
    );
    req.flash("success", "Thêm sản phẩm thành công vào giỏ hàng");
    return res.redirect(req.get("referer"));
  } else {
    const objectProduct = {
      product_id: productId,
      quantity: quantity,
    };
    await Cart.updateOne(
      {
        _id: cartId,
      },
      {
        $push: { products: objectProduct },
      }
    );
    req.flash("success", "Thêm sản phẩm thành công vào giỏ hàng");
    return res.redirect(req.get("referer"));
  }
};

// [GET] delete/:productId
module.exports.delete = async (req, res) => {
  const cartId = req.cookies.cartId;
  const product_id = req.params.productId;
  await Cart.updateOne(
    {
      _id: cartId,
    },
    {
      $pull: {
        products: {
          product_id: product_id,
        },
      },
    }
  );
  req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");
  return res.redirect(req.get("referer"));
};

// [GET] update/:productId/:quantity
module.exports.update = async (req, res) => {
  const cartId = req.cookies.cartId;
  const product_id = req.params.productId;
  const quantity = parseInt(req.params.quantity);
  await Cart.updateOne(
    { _id: cartId, "products.product_id": product_id },
    {
      $set: {
        "products.$.quantity": quantity,
      },
    }
  );
  return res.redirect(req.get("referer"));
};
