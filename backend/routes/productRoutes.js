const express = require("express");
const router = express.Router();
const protectAdmin = require("../middleware/adminAuth");
const { createProduct,getProducts,getProduct,updateProduct,deleteProduct } = require("../controllers/productController");

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected Admin Routes
router.post("/", protectAdmin, createProduct);
router.put("/:id", protectAdmin, updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);

module.exports = router;