const categoryMiddleware = require("../../middlewares/client/category.middleware");
const productRouters = require("./product.route");
const homeRouters = require("./home.route");
const searchRouters = require("./search.route");
module.exports = (app) => {
  app.use(categoryMiddleware.category);
  app.use("/", homeRouters);
  app.use("/products", productRouters);
  app.use("/search", searchRouters);
};
