const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">
<tr><td style="background:#1a6ca8;padding:20px 24px;">
  <span style="color:#ffffff;font-size:18px;font-weight:700;">VNG Voorzieningencatalogus</span>
</td></tr>
<tr><td style="padding:24px;">
  ${content}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;">
  <span style="font-size:12px;color:#9ca3af;">Dit is een automatisch bericht van de VNG Voorzieningencatalogus.</span>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function registratieOntvangenEmail(naam: string): { subject: string; html: string } {
  return {
    subject: "Aanmelding ontvangen — VNG Voorzieningencatalogus",
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Aanmelding ontvangen</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Beste ${naam},
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Uw aanmelding voor de VNG Voorzieningencatalogus is ontvangen. Een beheerder zal uw registratie beoordelen.
        U ontvangt een e-mail zodra uw account is geactiveerd.
      </p>
      <p style="margin:0;font-size:14px;color:#6b7280;">
        Heeft u vragen? Neem contact op met de beheerder van de Voorzieningencatalogus.
      </p>
    `),
  };
}

export function registratieGoedgekeurdEmail(naam: string): { subject: string; html: string } {
  return {
    subject: "Account geactiveerd — VNG Voorzieningencatalogus",
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Account geactiveerd</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Beste ${naam},
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Uw registratie is goedgekeurd. U kunt nu inloggen op de VNG Voorzieningencatalogus.
      </p>
      <a href="${baseUrl}/auth/login" style="display:inline-block;background:#1a6ca8;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
        Inloggen
      </a>
    `),
  };
}

export function registratieAfgewezenEmail(naam: string, reden?: string): { subject: string; html: string } {
  return {
    subject: "Aanmelding afgewezen — VNG Voorzieningencatalogus",
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Aanmelding afgewezen</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Beste ${naam},
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Helaas is uw aanmelding voor de VNG Voorzieningencatalogus niet goedgekeurd.
      </p>
      ${reden ? `<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;padding:12px;background:#f3f4f6;border-radius:6px;border-left:3px solid #d1d5db;"><strong>Reden:</strong> ${reden}</p>` : ""}
      <p style="margin:0;font-size:14px;color:#6b7280;">
        Heeft u vragen? Neem contact op met de beheerder van de Voorzieningencatalogus.
      </p>
    `),
  };
}

export function wachtwoordResetEmail(naam: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Wachtwoord herstellen — VNG Voorzieningencatalogus",
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Wachtwoord herstellen</h2>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        Beste ${naam},
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Er is een verzoek ontvangen om uw wachtwoord te herstellen. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#1a6ca8;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
        Nieuw wachtwoord instellen
      </a>
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
        Deze link is 1 uur geldig. Heeft u dit verzoek niet gedaan? Dan kunt u deze e-mail negeren.
      </p>
    `),
  };
}
