import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { prisma } from "@/data/prisma";

const ISSUER = "VNG Voorzieningencatalogus";
const TOTP_WINDOW = 1; // Accept previous + current + next token

/**
 * Generate a new TOTP secret and QR code for a user.
 * @param email - User email for the TOTP label
 * @returns Object with base32 secret, otpauth URI, and QR code data URL
 */
export async function generateTotpSecret(email: string): Promise<{
  secret: string;
  uri: string;
  qrCodeDataUrl: string;
}> {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: `Voorzieningencatalogus (${email})`,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  const secret = totp.secret.base32;
  const uri = totp.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#1a6ca8", light: "#ffffff" },
  });

  return { secret, uri, qrCodeDataUrl };
}

/**
 * Verify a TOTP token against a secret.
 * @param secret - Base32 encoded TOTP secret
 * @param token - 6-digit TOTP token from user
 * @returns true if the token is valid (within window tolerance)
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token, window: TOTP_WINDOW });
  return delta !== null;
}

/**
 * Enable TOTP for a user after verifying their first token.
 * @param userId - User ID
 * @param secret - Base32 encoded TOTP secret
 * @param token - 6-digit TOTP token to verify before enabling
 * @returns true if enabled successfully, false if token invalid
 */
export async function enableTotp(
  userId: string,
  secret: string,
  token: string,
): Promise<boolean> {
  const isValid = verifyTotpToken(secret, token);
  if (!isValid) return false;

  await prisma.user.update({
    where: { id: userId },
    data: {
      totpSecret: secret,
      totpEnabled: true,
    },
  });

  return true;
}

/**
 * Disable TOTP for a user.
 * @param userId - User ID
 */
export async function disableTotp(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totpSecret: null,
      totpEnabled: false,
    },
  });
}

/**
 * Check if TOTP verification is required for a user.
 * All users with TOTP enabled must verify, including admins.
 * @param user - Object with role and totpEnabled fields
 * @returns true if TOTP is required at login
 */
export function isTotpRequired(user: {
  role: string;
  totpEnabled: boolean;
}): boolean {
  return user.totpEnabled;
}
