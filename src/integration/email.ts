import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const emailFrom =
  process.env.EMAIL_FROM ||
  "VNG Voorzieningencatalogus <noreply@voorzieningencatalogus.nl>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log("\n📧 [DEV] E-mail (niet verzonden — geen RESEND_API_KEY)");
    console.log(`   Aan: ${to}`);
    console.log(`   Onderwerp: ${subject}`);
    console.log(`   ---`);
    console.log(html.replace(/<[^>]+>/g, "").trim());
    console.log(`   ---\n`);
    return;
  }

  await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    html,
  });
}
