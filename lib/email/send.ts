import { getResendClient } from "./resend";
import { priceAlertEmailHtml, trackingPausedEmailHtml } from "./templates";

const FROM = process.env.RESEND_FROM ?? "Price Watch <onboarding@resend.dev>";

export async function sendPriceAlertEmail(opts: {
  to: string;
  productName: string;
  productUrl: string;
  productImageUrl: string | null;
  currency: string | null;
  currentPrice: number;
  targetPrice: number;
}) {
  const resend = getResendClient();
  const subject = `Price drop: ${opts.productName}`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject,
    html: priceAlertEmailHtml({
      productName: opts.productName,
      productUrl: opts.productUrl,
      productImageUrl: opts.productImageUrl,
      currency: opts.currency,
      currentPrice: opts.currentPrice,
      targetPrice: opts.targetPrice
    })
  });
}

export async function sendTrackingPausedEmail(opts: {
  to: string;
  productName: string;
  productUrl: string;
  productImageUrl: string | null;
}) {
  const resend = getResendClient();
  const subject = `Tracking paused: ${opts.productName}`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject,
    html: trackingPausedEmailHtml({
      productName: opts.productName,
      productUrl: opts.productUrl,
      productImageUrl: opts.productImageUrl
    })
  });
}

