import { promises as fs } from "fs";
import { join, relative, extname, resolve } from "path";

// --- Configuration ---
const ALLOWED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx", // JavaScript/TypeScript
  ".py",
  ".pyw", // Python
  ".java",
  ".kt",
  ".kts", // Java/Kotlin
  ".c",
  ".cpp",
  ".h",
  ".hpp", // C/C++
  ".cs", // C#
  ".go", // Go
  ".rb", // Ruby
  ".php", // PHP
  ".swift", // Swift
  ".rs", // Rust
  ".html",
  ".htm", // HTML
  ".css",
  ".scss",
  ".less", // CSS/Sass/Less
  ".json",
  ".yaml",
  ".yml", // Data formats
  ".md",
  ".txt", // Markdown/Text (often useful for context)
  ".sh",
  ".bash",
  ".zsh", // Shell scripts
  ".sql", // SQL
  ".R", // R
  // Add more extensions as needed
];

const EXCLUDED_DIRECTORIES = [
  "node_modules",
  ".git",
  ".vscode",
  ".idea",
  "dist",
  "build",
  "out",
  "target",
  "__pycache__",
  ".DS_Store",
  // Add more directories to exclude
];

const EXCLUDED_FILES = [
  // e.g., 'package-lock.json', if you don't want it
  // Add specific files to exclude by name
];
// --- End Configuration ---

async function getFilesInDirectory(dirPath, rootDir, allFiles = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const relativePath = relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.includes(entry.name.toLowerCase())) {
        console.log(`Scanning directory: ${relativePath}`);
        await getFilesInDirectory(fullPath, rootDir, allFiles);
      } else {
        console.log(`Skipping excluded directory: ${relativePath}`);
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (
        ALLOWED_EXTENSIONS.includes(ext) &&
        !EXCLUDED_FILES.includes(entry.name)
      ) {
        console.log(`Adding file: ${relativePath}`);
        allFiles.push(fullPath);
      } else {
        console.log(`Skipping file (extension or excluded): ${relativePath}`);
      }
    }
  }
  return allFiles;
}

async function concatenateFiles(inputDir, outputFile) {
  if (!inputDir || !outputFile) {
    console.error(
      "Usage: node concatenate_code.js <inputDirectory> <outputFile>",
    );
    process.exit(1);
  }

  const absoluteInputDir = resolve(inputDir);
  const absoluteOutputFile = resolve(outputFile);

  try {
    await fs.access(absoluteInputDir);
  } catch {
    console.error(
      `Error: Input directory "${absoluteInputDir}" does not exist or is not accessible.`,
    );
    process.exit(1);
  }

  console.log(`Starting concatenation from: ${absoluteInputDir}`);
  console.log(`Output will be written to: ${absoluteOutputFile}`);

  const filesToConcatenate = await getFilesInDirectory(
    absoluteInputDir,
    absoluteInputDir,
  );
  let concatenatedContent = "";
  let fileCount = 0;

  if (filesToConcatenate.length === 0) {
    console.log("No files found to concatenate based on current filters.");
    await fs.writeFile(
      absoluteOutputFile,
      "// No matching files found in the specified directory and subdirectories.\n",
      "utf8",
    );
    console.log(`Empty output file created at ${absoluteOutputFile}`);
    return;
  }

  for (const filePath of filesToConcatenate) {
    try {
      const relativePath = relative(absoluteInputDir, filePath);
      const content = await fs.readFile(filePath, "utf8");

      concatenatedContent += `\n\n// ========== FILE START: ${relativePath.replace(/\\/g, "/")} ==========\n`;
      concatenatedContent += content;
      concatenatedContent += `\n// ========== FILE END: ${relativePath.replace(/\\/g, "/")} ==========\n\n`;
      fileCount++;
    } catch (err) {
      console.warn(
        `Warning: Could not read file ${filePath}. Skipping. Error: ${err.message}`,
      );
    }
  }

  try {
    await fs.writeFile(absoluteOutputFile, concatenatedContent.trim(), "utf8");
    console.log(
      `\nSuccessfully concatenated ${fileCount} files into ${absoluteOutputFile}`,
    );
  } catch (err) {
    console.error(
      `Error writing to output file ${absoluteOutputFile}: ${err.message}`,
    );
    process.exit(1);
  }
}

// Get command line arguments
const inputDirectory = process.argv[2];
const outputFilePath = process.argv[3];

concatenateFiles(inputDirectory, outputFilePath).catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
