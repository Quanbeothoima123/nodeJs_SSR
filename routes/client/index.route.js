const categoryMiddleware = require("../../middlewares/client/category.middleware");
const productRouters = require("./product.route");
const homeRouters = require("./home.route");
module.exports = (app) => {
  app.use(categoryMiddleware.category);
  app.use("/", homeRouters);
  app.use("/products", productRouters);
};
