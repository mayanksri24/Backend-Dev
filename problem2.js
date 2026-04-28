const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

//  Session setup
app.use(session({
  secret: 'cart-secret',
  resave: false,
  saveUninitialized: false
}));

// 🛒 Initialize Cart Middleware
const initCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = []; // [{ productId, name, price, quantity }]
  }
  next();
};

app.use(initCart);

//  Add Item to Cart
app.post('/cart/add', (req, res) => {
  const { productId, name, price, quantity } = req.body;

  if (!productId || !name || !price) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const qty = quantity || 1;

  const existingItem = req.session.cart.find(
    item => item.productId === productId
  );

  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    req.session.cart.push({
      productId,
      name,
      price,
      quantity: qty
    });
  }

  res.json({ message: "Item added to cart", cart: req.session.cart });
});

//  Update Item Quantity
app.put('/cart/update/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const item = req.session.cart.find(
    item => item.productId === productId
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  item.quantity = quantity;

  res.json({ message: "Cart updated", cart: req.session.cart });
});

// Remove Item
app.delete('/cart/remove/:productId', (req, res) => {
  const { productId } = req.params;

  const initialLength = req.session.cart.length;

  req.session.cart = req.session.cart.filter(
    item => item.productId !== productId
  );

  if (req.session.cart.length === initialLength) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ message: "Item removed", cart: req.session.cart });
});

//  Get Cart + Total
app.get('/cart', (req, res) => {
  const cart = req.session.cart;

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  res.json({
    cart,
    total
  });
});

//  Clear Cart
app.delete('/cart/clear', (req, res) => {
  req.session.cart = [];
  res.json({ message: "Cart cleared" });
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});