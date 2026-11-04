const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCart,
  removeProduct,
  clearCart
} = require("../controllers/cartController");

router.get("/:sessionId", getCart);

router.post("/:sessionId", addToCart);

router.put("/:sessionId", updateCart);

router.delete("/:sessionId", removeProduct);

router.delete("/:sessionId/clear", clearCart);

module.exports = router;