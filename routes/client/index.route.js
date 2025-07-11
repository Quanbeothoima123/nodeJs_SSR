const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const productRouters = require("./product.route");
const homeRouters = require("./home.route");
const searchRouters = require("./search.route");
const cartRoutes = require("./cart.route");
module.exports = (app) => {
  app.use(categoryMiddleware.category);
  app.use(cartMiddleware.cartId);
  app.use("/", homeRouters);
  app.use("/products", productRouters);
  app.use("/search", searchRouters);
  app.use("/cart", cartRoutes);
};
