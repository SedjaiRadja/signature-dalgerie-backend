const Product = require("../models/Product");

const createProduct = async (req,res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      sizes,
      colors,
      stock,
    } = req.body;
    // Check required fields
    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      sizes,
      colors,
      stock,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
}

const getProducts = async (req,res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

const getProduct = async (req,res) => {
  try {
    const product = await Product.findOne({
      _id : req.params.id,
      isActive: true,
    })
    if (!product){
    return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
}

const updateProduct = async (req,res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      sizes,
      colors,
      stock,
      isActive,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category,
        images,
        sizes,
        colors,
        stock,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!product){
    return res.status(404).json({
        message: "Product not found",
      });
    }
     res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
}

const deleteProduct = async (req,res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product,
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}

module.exports = { createProduct,getProducts,getProduct,updateProduct,deleteProduct };