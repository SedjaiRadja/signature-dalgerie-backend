require("dotenv").config();

const mongoose = require("mongoose");

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Connected Successfully");
    await mongoose.disconnect();

  } catch (error) {
    console.log("Main Error:", error.message);

    if (error.reason?.servers) {
      error.reason.servers.forEach((server, address) => {
        console.log("\nServer:", address);
        console.log("Error:", server.error?.message);
        console.log("Code:", server.error?.code);
      });
    }
  }
}

testConnection();