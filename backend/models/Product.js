const mongoose = require("mongoose")
const productSchema = new mongoose.Schema (
  {
    name : {
      type : String,
      required: true,
      trim: true,
    }, 
    description : {
      type : String,
      required: true,
      trim: true,
    },
    price : {
      type : Number,
      type : String,
      required: true,
      min: 0,
    },
    category : {
      type : String,
      required:true,
      enum : [
        "Karakou",
        "Caftan",
        "Qendoura",
        "Blouza",
        "Chadda",
        "Melhfa"
      ]
    },
     images: {
      type: [String],
      required: true,
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)
module.exports = mongoose.model("Product", productSchema);