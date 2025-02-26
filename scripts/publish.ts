import fs from "fs";
import * as archiver from "archiver";
import { execSync } from "child_process";
import path from "path";

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve("package.json"), "utf-8")
);

// Configuration
const BUILD_DIR = "build";
const OUTPUT_ZIP = `${packageJson.name}-${packageJson.version}.zip`;

interface ArchiveError extends Error {
  code?: string;
  data?: unknown;
  path?: string;
}

async function main(): Promise<void> {
  try {
    // Step 1: Build the project
    console.log("🏗️  Building the extension...");
    execSync("npm run build", { stdio: "inherit" });

    // Step 2: Create a zip file
    console.log("📦 Creating ZIP file...");
    const output = fs.createWriteStream(OUTPUT_ZIP);
    const archive = archiver.default("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Type-safe event handlers
    output.on("close", () => {
      console.log(
        `✅ Successfully created ${OUTPUT_ZIP} (${archive.pointer()} bytes)`
      );
      console.log("\n📝 Next steps:");
      console.log("1. Go to https://chrome.google.com/webstore/devconsole");
      console.log('2. Click "New Item"');
      console.log(`3. Upload the generated ${OUTPUT_ZIP} file`);
      console.log("4. Fill in the store listing information");
      console.log("5. Submit for review\n");
    });

    archive.on("error", (err: ArchiveError) => {
      throw err;
    });

    archive.on("warning", (err: ArchiveError) => {
      if (err.code === "ENOENT") {
        console.warn("Warning:", err);
      } else {
        throw err;
      }
    });

    archive.pipe(output);

    // Ensure build directory exists
    if (!fs.existsSync(BUILD_DIR)) {
      throw new Error(
        `Build directory '${BUILD_DIR}' does not exist. Run build first.`
      );
    }

    // Add the build directory to the zip
    archive.directory(BUILD_DIR, false);

    await archive.finalize();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Execute the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
