// Optional: Validate environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_EXPIRE"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
};

module.exports = { validateEnv };
