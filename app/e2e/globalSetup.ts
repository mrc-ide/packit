import { FullConfig } from "@playwright/test";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import { join } from "path";

// Ensure that all test files use the tagCheckFixture rather than playwright's default test fixture
const checkTestImports = async (config: FullConfig) => {
  console.log("Checking test imports...");
  const { rootDir } = config;
  const importRegex = /import\s+{[^}]*\btest\b[^}]*}\s+from\s+".\/tagCheckFixture";/;

  // Use a generic glob here which should pick up every test file - this is
  // simpler than checking testMatch for every project, which could be Regex or glob, or an
  // array of either.
  const files = await fg("**/*.@(spec|test).?(c|m)[jt]s?(x)", { cwd: rootDir });
  for (const file of files) {
    const filePath = join(rootDir, file);
    const content = await readFile(filePath, "utf-8");
    if (!importRegex.test(content)) {
      throw new Error(`Test file ${file} does not import "test" from "tagCheckFixture".`);
    }
  }
};

export default checkTestImports;
