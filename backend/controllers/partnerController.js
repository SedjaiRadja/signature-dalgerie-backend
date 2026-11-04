const Partner = require("../models/Partner");

const applyAsPartner = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      wilaya,
      businessName,
      businessType,
      message,
    } = req.body;

    // Required fields validation
    if (!fullName || !email || !phone || !wilaya || !businessType) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // Create partner application
    const partner = await Partner.create({
      fullName,
      email,
      phone,
      wilaya,
      businessName,
      businessType,
      message,
    });

    res.status(201).json({
      message: "Partner application submitted successfully",
      partner,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit partner application",
      error: error.message,
    });
  }
};

module.exports = { applyAsPartner };