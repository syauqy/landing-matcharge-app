const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to your Capacitor config file (adjust if needed)
const configPath = path.resolve(__dirname, "capacitor.config.ts");

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
  // Read the existing config
  let configContent = fs.readFileSync(configPath, "utf-8");

  // Replace the server.url line with the new IP
  const newUrl = `http://${ip}:3000`;
  const urlRegex = /url:\s*["']http:\/\/[^"']+["']/;
  if (urlRegex.test(configContent)) {
    configContent = configContent.replace(urlRegex, `url: "${newUrl}"`);
  } else {
    // If no url exists, add it to the server block
    const serverBlockRegex = /server:\s*{[^}]*}/;
    if (serverBlockRegex.test(configContent)) {
      configContent = configContent.replace(
        serverBlockRegex,
        (match) => `${match.slice(0, -1)}    url: "${newUrl}",\n  }`,
      );
    } else {
      // If no server block, append it
      configContent = configContent.replace(
        /};/,
        `  server: {\n    url: "${newUrl}",\n    cleartext: true,\n  },\n};`,
      );
    }
  }

  // Write the updated content back
  fs.writeFileSync(configPath, configContent, "utf-8");
  console.log(`Updated capacitor.config.ts with server.url: ${newUrl}`);
}

// Main execution
try {
  const ip = getLocalIP();
  updateConfig(ip);
} catch (err) {
  console.error("Error updating config:", err.message);
}
