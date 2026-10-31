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

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const filter = { isActive: true };

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }
    if (
  (minPrice !== undefined && !Number.isFinite(Number(minPrice))) ||
  (maxPrice !== undefined && !Number.isFinite(Number(maxPrice)))
) {
  return res.status(400).json({
    message: "Invalid price values",
  });
}

if (
  minPrice !== undefined &&
  maxPrice !== undefined &&
  Number(minPrice) > Number(maxPrice)
) {
  return res.status(400).json({
    message: "minPrice cannot be greater than maxPrice",
  });
}
    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Pagination
    const currentPage = Math.max(1, Number(page));
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit)));
    const skip = (currentPage - 1) * itemsPerPage;

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "price") {
      sortOption = { price: 1 };
    } else if (sort === "-price") {
      sortOption = { price: -1 };
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(itemsPerPage);

    res.status(200).json({
      totalProducts,
      currentPage,
      totalPages: Math.ceil(totalProducts / itemsPerPage),
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

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

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};