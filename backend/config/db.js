const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Error:", error.name);
    console.error("Message:", error.message);

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.error("Server:", address);
        console.error("Server Error:", server.error?.message);
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;
