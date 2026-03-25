import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Parse en valideer request body met een Zod schema.
 * Retourneert geparsede data of een 400-response.
 */
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      error: NextResponse.json(
        { error: "Ongeldige JSON in request body" },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: NextResponse.json(
        {
          error: "Validatiefout",
          details: result.error.issues.map((i) => ({
            veld: i.path.join("."),
            melding: i.message,
          })),
        },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}

/**
 * Parse en valideer URL search params met een Zod schema.
 */
export function parseSearchParams<T extends z.ZodType>(
  url: string,
  schema: T,
): { data: z.infer<T> } | { error: NextResponse } {
  const params = Object.fromEntries(new URL(url).searchParams);
  const result = schema.safeParse(params);
  if (!result.success) {
    return {
      error: NextResponse.json(
        {
          error: "Ongeldige parameters",
          details: result.error.issues.map((i) => ({
            veld: i.path.join("."),
            melding: i.message,
          })),
        },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}

// ─── Herbruikbare schemas ───────────────────────────────────────────────────

export const emailSchema = z.string().email("Ongeldig e-mailadres").max(255);
export const wachtwoordSchema = z.string().min(8, "Minimaal 8 tekens").max(128);
export const naamSchema = z.string().min(1, "Naam is verplicht").max(200);
export const idSchema = z.string().uuid("Ongeldig ID");
export const slugSchema = z.string().min(1).max(200);
export const paginaSchema = z.coerce.number().int().min(1).default(1);
export const zoekSchema = z.string().max(200).optional();
