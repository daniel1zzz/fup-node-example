import { serve } from "@hono/node-server";
import { FupNode, FileBody } from "fup-node";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as fs from "node:fs/promises";
import * as path from "node:path";

// List files from directory especified
async function listFilesInDirectory(directoryPath: string) {
  try {
    // Read content from the directory
    const files = await fs.readdir(directoryPath);

    const fileNames = [];
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        fileNames.push(file);
      }
    }
    return fileNames;
  } catch (error) {
    return [];
  }
}

const fup = new FupNode({
  path: "uploads",
  maxFiles: 4
});

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["*"],
  })
);

// Return especified image
app.get("/image/:img", async (c) => {
  const imgName = c.req.param("img");
  try {
    const bufferFile = await fup.getFile(imgName);

    // Response is ok
    c.status(200);
    return new Response(bufferFile);
  } catch {}

  // File not found
  c.status(404);
  return c.text("The file was not found");
});

// Return images existings
app.get("/images", async (c) => {
  const files = await listFilesInDirectory(path.join(process.cwd(), "uploads"));
  return c.json(files);
});

app.post("upload-file", async (c) => {
  const body = (await c.req.json()) as {
    file: FileBody;
  };
  try {
    await fup.uploadFile(body.file, { types: ["image/*"] });
    c.status(200);
    return c.text("File uploaded successfully!");
  } catch (err) {
    c.status(500);
    return c.text((err as Error).message);
  }
});

app.post("upload-files", async (c) => {
  const body = (await c.req.json()) as {
    files: FileBody[];
  };
  try {
    await fup.uploadMultipleFiles(body.files, { types: ["image/*"] });
    c.status(200);
    return c.text("Files uploaded successfully!");
  } catch (err) {
    c.status(500);
    return c.text((err as Error).message);
  }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
