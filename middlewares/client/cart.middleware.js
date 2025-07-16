const Cart = require("../../models/cart.model");
const setCookie = require("../../helper/setCookie");

module.exports.cartId = async (req, res, next) => {
  if (!req.cookies.cartId) {
    const cart = new Cart();
    await cart.save();

    // Cookie sống 7 ngày
    setCookie(res, "cartId", cart.id, 7);
  } else {
    const cart = await Cart.findOne({
      _id: req.cookies.cartId,
    });
    console.log(cart.products);
    if (cart.products) {
      cart.totalQuantity = cart.products.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    }
    res.locals.miniCart = cart;
  }

  next();
};
