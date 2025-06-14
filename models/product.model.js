const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    position: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: Date,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema, "products");

module.exports = Product;
