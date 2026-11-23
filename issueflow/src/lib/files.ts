import path from "node:path";
import { MAX_ATTACHMENT_BYTES } from "@/lib/constants";
import { AppError } from "@/lib/errors";

const TYPES: { ext: string[]; mime: string[] }[] = [
  { ext: ["png"], mime: ["image/png"] },
  { ext: ["jpg", "jpeg"], mime: ["image/jpeg"] },
  { ext: ["webp"], mime: ["image/webp"] },
  { ext: ["pdf"], mime: ["application/pdf"] },
  { ext: ["txt"], mime: ["text/plain"] },
  { ext: ["csv"], mime: ["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"] },
  { ext: ["docx"], mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] },
  { ext: ["xlsx"], mime: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] },
  { ext: ["zip"], mime: ["application/zip", "application/x-zip-compressed"] },
];

function startsWith(bytes: Uint8Array, magic: number[]) {
  return magic.every((value, index) => bytes[index] === value);
}

export function assertSafeFile(fileName: string, mimeType: string, bytes: Uint8Array) {
  if (bytes.byteLength === 0) throw new AppError(400, "VALIDATION_ERROR", "The file is empty");
  if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new AppError(400, "VALIDATION_ERROR", "Files must be 20 MB or smaller");
  }
  const base = path.basename(fileName).replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180);
  const ext = base.includes(".") ? base.split(".").pop()!.toLowerCase() : "";
  const rule = TYPES.find((item) => item.ext.includes(ext));
  if (!rule || !rule.mime.includes(mimeType)) {
    throw new AppError(400, "VALIDATION_ERROR", "This file type is not supported");
  }
  if (ext === "png" && !startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    throw new AppError(400, "VALIDATION_ERROR", "The file contents do not match a PNG");
  }
  if ((ext === "jpg" || ext === "jpeg") && !startsWith(bytes, [0xff, 0xd8, 0xff])) {
    throw new AppError(400, "VALIDATION_ERROR", "The file contents do not match a JPEG");
  }
  if (ext === "pdf" && !startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) {
    throw new AppError(400, "VALIDATION_ERROR", "The file contents do not match a PDF");
  }
  if ((ext === "zip" || ext === "docx" || ext === "xlsx" || ext === "webp") && !startsWith(bytes, [0x50, 0x4b])) {
    if (ext !== "webp") throw new AppError(400, "VALIDATION_ERROR", "The file contents do not match this type");
    if (!startsWith(bytes, [0x52, 0x49, 0x46, 0x46])) {
      throw new AppError(400, "VALIDATION_ERROR", "The file contents do not match a WEBP");
    }
  }
  if ((ext === "txt" || ext === "csv") && bytes.includes(0)) {
    throw new AppError(400, "VALIDATION_ERROR", "Text files cannot contain binary data");
  }
  return { fileName: base, extension: ext };
}
