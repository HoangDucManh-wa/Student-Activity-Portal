require("dotenv").config();

const { validateEnv } = require("./config/env");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const app = require("./app");

validateEnv();

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err.message);
  process.exit(1);
});
