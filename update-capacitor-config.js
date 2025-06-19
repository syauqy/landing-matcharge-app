const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to your Capacitor config file (adjust if needed)
const configPath = path.resolve(__dirname, "capacitor.config.json");

// Function to get local IP from en0
function getLocalIP() {
  try {
    const ip = execSync("ifconfig en0 | grep 'inet ' | awk '{print $2}'", {
      encoding: "utf-8",
    }).trim();
    if (!ip) throw new Error("No IP found for en0");
    return ip;
  } catch (err) {
    console.error("Failed to get IP, defaulting to localhost:", err.message);
    return "localhost"; // Fallback
  }
}

// Function to update the config file
function updateConfig(ip) {
  const isMobileDev = process.env.IS_MOBILE_DEV;

  console.log("is Mobile dev?", isMobileDev);

  try {
    let configContent = fs.readFileSync(configPath, "utf-8");

    const config = JSON.parse(configContent);

    if (isMobileDev) {
      if (!ip) {
        throw new Error(
          "IS_MOBILE_DEV is set, but no IP address was provided. Usage: node update-capacitor-config.js <your-ip-address>"
        );
      }

      const newUrl = `http://${ip}:3000`;
      const urlRegex = /url:\s*["']http:\/\/[^"']+["']/;
      // Create or overwrite the server object
      config.server = {
        url: newUrl,
        cleartext: true,
      };

      console.log(
        `✅ Configured for DEVELOPMENT. Server URL set to: ${newUrl}`
      );
    } else {
      if (config.server) {
        delete config.server;
        console.log(
          `✅ Configured for PRODUCTION. Removed 'server' configuration.`
        );
      } else {
        console.log(
          `✅ Configured for PRODUCTION. 'server' configuration was already absent.`
        );
      }
    }
    const updatedConfigString = JSON.stringify(config, null, 2);

    // 5. WRITE the new, valid JSON string back to the file
    fs.writeFileSync(configPath, updatedConfigString, "utf-8");
    console.log(`✅ Successfully updated capacitor.config.json`);
  } catch (error) {
    console.error(`❌ Error configuring capacitor.config.json:`, error.message);
    process.exit(1); // Exit with an error code
  }
}

// Main execution
try {
  const ip = getLocalIP();
  updateConfig(ip);
} catch (err) {
  console.log(err);
  console.error("Error updating config:", err.message);
}
