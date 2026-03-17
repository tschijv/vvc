import { NextRequest, NextResponse } from "next/server";
import {
  generateTemplate,
  type TemplateType,
  type TemplateFormat,
} from "@/lib/services/upload-templates";

const VALID_TYPES: TemplateType[] = [
  "leverancier-pakketten",
  "gemeente-portfolio",
];
const VALID_FORMATS: TemplateFormat[] = ["csv", "json", "xlsx"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as TemplateType | null;
  const format = (searchParams.get("format") || "csv") as TemplateFormat;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      {
        error: `Ongeldig type. Gebruik: ${VALID_TYPES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (!VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      {
        error: `Ongeldig formaat. Gebruik: ${VALID_FORMATS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    const { buffer, contentType, filename } = generateTemplate(type, format);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("Template generatie fout:", error);
    return NextResponse.json(
      { error: "Fout bij genereren template" },
      { status: 500 }
    );
  }
}
