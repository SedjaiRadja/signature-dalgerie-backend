const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const cors = require("cors");
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("SignDZ API is running 🚀");
});

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/partners", partnerRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
