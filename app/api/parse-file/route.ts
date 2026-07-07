import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zero-dependency printable text extractor for binary files
function extractPrintableStrings(buffer: Buffer): string {
  let result = "";
  let currentString = "";
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if (char >= 32 && char <= 126) {
      currentString += String.fromCharCode(char);
    } else if (char === 10 || char === 13) {
      if (currentString.length >= 4) {
        result += currentString + "\n";
      }
      currentString = "";
    } else {
      if (currentString.length >= 4) {
        result += currentString + " ";
      }
      currentString = "";
    }
  }
  if (currentString.length >= 4) {
    result += currentString;
  }
  // Strip common binary layout tags
  return result
    .replace(/[a-zA-Z0-9_\-\/]+\s*<<[^>]*>>/g, "")
    .replace(/\/Type\s*\/[a-zA-Z]+/g, "")
    .replace(/endstream|endobj|startxref/g, "")
    .slice(0, 100000);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "Missing required parameter: file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    let text = "";

    if ([".txt", ".ris", ".bib", ".csv", ".tsv", ".json", ".xml"].includes(`.${ext}`)) {
      text = buffer.toString("utf8");
    } else if (ext === "pdf") {
      // For PDF, we'll use a simple extraction or fallback
      try {
        // Dynamic import for pdf-parse (ESM module)
        const pdfParseModule = await import("pdf-parse");
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const data = await pdfParse(buffer);
        text = data.text || "";
      } catch (err: any) {
        console.warn("pdf-parse failed, using strings fallback:", err.message);
        text = extractPrintableStrings(buffer);
      }
    } else if (ext === "docx") {
      try {
        const mammoth = await import("mammoth");
        const data = await mammoth.extractRawText({ buffer });
        text = data.value || "";
      } catch (err: any) {
        console.warn("mammoth failed, using strings fallback:", err.message);
        text = extractPrintableStrings(buffer);
      }
    } else if (["xlsx", "xls"].includes(ext)) {
      try {
        const xlsx = await import("xlsx");
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const csvs: string[] = [];
        workbook.SheetNames.forEach((sheetName: string) => {
          const sheet = workbook.Sheets[sheetName];
          csvs.push(xlsx.utils.sheet_to_csv(sheet));
        });
        text = csvs.join("\n\n");
      } catch (err: any) {
        console.warn("xlsx failed, using strings fallback:", err.message);
        text = extractPrintableStrings(buffer);
      }
    } else {
      text = extractPrintableStrings(buffer);
    }

    return Response.json({
      text: text.slice(0, 80000), // Protect by truncating to 80k characters
      metadata: {
        fileName: file.name,
        fileSize: buffer.length,
        extension: ext,
        charCount: text.length
      }
    });
  } catch (err: any) {
    console.error("File parser error:", err);
    return Response.json({ error: err.message || "Failed to parse document" }, { status: 500 });
  }
}