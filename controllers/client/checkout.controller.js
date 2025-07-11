const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const productHelper = require("../../helper/products");
//[POST] checkout/index
module.exports.checkout = async (req, res) => {
  const selectedProducts = req.body.selectedProducts;
  const cartId = req.cookies.cartId;

  // Kiểm tra dữ liệu đầu vào
  if (!selectedProducts || !cartId) {
    return res.redirect("/cart");
  }

  // Nếu chỉ chọn 1 sản phẩm, selectedProducts sẽ là string
  const selectedIds = Array.isArray(selectedProducts)
    ? selectedProducts
    : [selectedProducts];

  // Lấy giỏ hàng
  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    return res.redirect("/cart");
  }

  // Lọc những sản phẩm được chọn
  const selectedItems = cart.products.filter((item) =>
    selectedIds.includes(item.product_id)
  );

  // Tính toán lại thông tin sản phẩm
  for (let item of selectedItems) {
    const product = await Product.findOne({ _id: item.product_id }).select(
      "thumbnail title slug price discountPercentage stock"
    );
    if (!product) continue;

    product.priceNew = productHelper.priceNewProduct(product);
    item.productInfo = product;
    item.totalPrice = product.priceNew * item.quantity;
  }

  // Tổng đơn hàng từ các sản phẩm đã chọn
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // Trả kết quả về trang checkout
  res.render("client/pages/checkout/index", {
    pageTitle: "Trang thanh toán",
    cartDetail: {
      products: selectedItems,
      totalPrice,
    },
  });
};

//[POST] checkout/order
module.exports.order = async (req, res) => {
  const cartData = JSON.parse(req.body.cartData);
  const cartId = req.cookies.cartId;

  const userInfo = {
    fullName: req.body.fullName,
    phone: req.body.phone,
    address: req.body.address,
  };

  let products = [];
  for (let item of cartData.products) {
    const quantity = item.quantity;
    const product = await Product.findOne({ _id: item.product_id }).select(
      "price discountPercentage"
    );
    if (!product) continue;

    const productWithQty = product.toObject();
    productWithQty.product_id = item.product_id;
    productWithQty.quantity = quantity;

    products.push(productWithQty);
    await Cart.updateOne(
      {
        _id: cartId,
      },
      {
        $pull: {
          products: {
            product_id: item.product_id,
          },
        },
      }
    );
  }
  const orderInfo = {
    cart_id: cartId,
    userInfo: userInfo,
    products: products,
  };
  const order = new Order(orderInfo);
  order.save();
  res.redirect(`/checkout/success/${order.id}`);
};
module.exports.success = async (req, res) => {
  res.render("client/pages/checkout/success", {
    pageTitle: "Đặt hàng thành công",
  });
};
