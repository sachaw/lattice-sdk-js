import { walk } from "jsr:@std/fs";
import { basename, extname, relative, SEPARATOR } from "jsr:@std/path";

const inputDir = "src/lib/anduril";
const outputFile = "src/mod.ts";

async function generateBarrel() {
  const exports: string[] = [];

  for await (const entry of walk(inputDir, { exts: [".ts"] })) {
    if (entry.isFile) {
      const filePath = entry.path;
      const relativePath = relative(inputDir, filePath);

      const fileName = basename(filePath, extname(filePath));
      const cleanFileName = fileName.replace(/\.pub_pb$/, "");

      const pathSegments = relativePath
        .split(SEPARATOR)
        .slice(0, -1)
        .filter((segment) => segment !== cleanFileName + extname(filePath))
        .map((segment) =>
          segment
            .replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/^([A-Z])/, (_, letter) => letter.toLowerCase())
        );

      const exportName = [
        ...pathSegments,
        cleanFileName
          .replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase())
          .replace(/^([A-Z])/, (_, letter) => letter.toLowerCase()),
      ].join("_");

      exports.push(
        `export * as ${exportName} from "./lib/anduril/${
          relativePath.replace(/\\/g, "/")
        }";`,
      );
    }
  }

  await Deno.writeTextFile(outputFile, exports.join("\n"));
  console.log(
    `Generated barrel file at ${outputFile} with ${exports.length} exports`,
  );
}

await generateBarrel();
