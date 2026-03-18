type PriceAlertTemplateParams = {
  productName: string;
  productUrl: string;
  productImageUrl: string | null;
  currency: string | null;
  currentPrice: number;
  targetPrice: number;
};

type TrackingPausedTemplateParams = {
  productName: string;
  productUrl: string;
  productImageUrl: string | null;
};

function fmtPrice(currency: string | null, amount: number) {
  try {
    if (currency) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency
      }).format(amount);
    }
  } catch {
    // fall through
  }
  return currency ? `${currency} ${amount.toFixed(2)}` : amount.toFixed(2);
}

function adBlockHtml() {
  const label = "Sponsored";
  const href = process.env.EMAIL_AD_URL ?? "https://example.com";
  const img = process.env.EMAIL_AD_IMAGE_URL ?? null;

  return `
    <div style="margin-top:20px;border-top:1px solid #e2e8f0;padding-top:14px;">
      <div style="font-size:11px;color:#64748b;margin-bottom:8px;">${label}</div>
      ${
        img
          ? `<a href="${href}" style="display:block;text-decoration:none"><img src="${img}" alt="${label}" style="width:100%;max-width:520px;border-radius:10px;display:block"/></a>`
          : `<a href="${href}" style="font-size:13px;color:#2563eb;text-decoration:none">Check today’s deals →</a>`
      }
    </div>
  `;
}

export function priceAlertEmailHtml(p: PriceAlertTemplateParams) {
  const current = fmtPrice(p.currency, p.currentPrice);
  const target = fmtPrice(p.currency, p.targetPrice);

  return `
  <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.4; color:#0f172a; padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="padding:18px 18px 0 18px;">
        <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Price Watch alert</div>
        <h1 style="margin:0;font-size:18px;">Price dropped to ${current}</h1>
        <div style="font-size:13px;color:#334155;margin-top:6px;">
          Target: <b>${target}</b>
        </div>
      </div>
      ${
        p.productImageUrl
          ? `<div style="padding:18px"><img src="${p.productImageUrl}" alt="" style="width:100%;max-height:280px;object-fit:contain;background:#f8fafc;border-radius:12px;display:block"/></div>`
          : ""
      }
      <div style="padding:0 18px 18px 18px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:10px;">${p.productName}</div>
        <a href="${p.productUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 14px;border-radius:10px;">
          View product
        </a>
        ${adBlockHtml()}
        <div style="margin-top:16px;font-size:11px;color:#64748b;">
          You’re receiving this because you asked Price Watch to track this product.
        </div>
      </div>
    </div>
  </div>`;
}

export function trackingPausedEmailHtml(p: TrackingPausedTemplateParams) {
  return `
  <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.4; color:#0f172a; padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="padding:18px;">
        <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Price Watch update</div>
        <h1 style="margin:0;font-size:18px;">Tracking paused</h1>
        <p style="margin:10px 0 0 0;font-size:13px;color:#334155;">
          We couldn’t scrape this product 3 times in a row, so tracking has been paused.
        </p>
      </div>
      ${
        p.productImageUrl
          ? `<div style="padding:0 18px 18px 18px"><img src="${p.productImageUrl}" alt="" style="width:100%;max-height:280px;object-fit:contain;background:#f8fafc;border-radius:12px;display:block"/></div>`
          : ""
      }
      <div style="padding:0 18px 18px 18px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:10px;">${p.productName}</div>
        <a href="${p.productUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 14px;border-radius:10px;">
          Open product
        </a>
        ${adBlockHtml()}
        <div style="margin-top:16px;font-size:11px;color:#64748b;">
          Tip: Retailers sometimes change their pages; you can try re-adding the product later.
        </div>
      </div>
    </div>
  </div>`;
}

