import { Resend } from "resend";

/**
 * Email is a nice-to-have, never a blocker: if it isn't configured or the
 * send fails, we log and carry on rather than failing the user's request.
 */
async function send(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "AMOURA <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, html });
  } catch (error) {
    console.error("Failed to send email to", to, error);
  }
}

function layout(heading: string, body: string) {
  return `
  <div style="background:#1B0609;padding:32px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#2B0D12;border:1px solid rgba(232,180,172,0.14);border-radius:20px;padding:32px">
      <div style="font-size:20px;color:#F3D2CB;font-style:italic;margin-bottom:24px">&hearts; AMOURA</div>
      <h1 style="font-size:20px;color:#F3E6E1;margin:0 0 12px">${heading}</h1>
      <div style="font-size:14px;color:#C9A79E;line-height:1.6">${body}</div>
    </div>
    <p style="text-align:center;color:#7A5A54;font-size:11px;margin-top:20px">You're receiving this because you have an AMOURA account.</p>
  </div>`;
}

export async function sendPaymentReceivedEmail(opts: {
  to: string;
  name: string;
  tier: string;
  amount: number;
  transactionId: string;
}) {
  const tierName = opts.tier.toUpperCase();
  await send(
    opts.to,
    `We received your payment details — AMOURA ${tierName}`,
    layout(
      `Thanks, ${opts.name.split(" ")[0]} — we've got your payment details`,
      `<p>We've received your submission for <strong style="color:#E4C892">${tierName}</strong>.</p>
       <table style="width:100%;margin:16px 0;font-size:13px">
         <tr><td style="color:#7A5A54;padding:4px 0">Transaction ID</td><td style="color:#F3E6E1;text-align:right;font-family:monospace">${opts.transactionId}</td></tr>
         <tr><td style="color:#7A5A54;padding:4px 0">Amount</td><td style="color:#F3E6E1;text-align:right">BDT ${opts.amount.toLocaleString()}</td></tr>
       </table>
       <p>Our team verifies each payment against our mobile banking statement. This usually takes a few hours, and up to 24 hours if you paid late at night.</p>
       <p>You'll get another email the moment your plan is active — no need to pay again or submit anything else.</p>`
    )
  );
}

export async function sendPaymentApprovedEmail(opts: {
  to: string;
  name: string;
  tier: string;
  expiresAt: Date;
}) {
  const tierName = opts.tier.toUpperCase();
  const expiry = opts.expiresAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await send(
    opts.to,
    `Your AMOURA ${tierName} plan is active`,
    layout(
      `You're on ${tierName} now`,
      `<p>Your payment is confirmed and your <strong style="color:#E4C892">${tierName}</strong> plan is live.</p>
       <p>You now have unlimited messaging, more photo slots, and everything else in your plan. It runs until <strong style="color:#F3E6E1">${expiry}</strong>.</p>
       <p style="margin-top:20px"><a href="${process.env.SITE_URL ?? "https://site.amouradhaka.workers.dev"}/dashboard" style="display:inline-block;background:#C9A66B;color:#2a1c05;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:13px">Open AMOURA</a></p>`
    )
  );
}

export async function sendPaymentRejectedEmail(opts: {
  to: string;
  name: string;
  transactionId: string;
  note: string;
}) {
  await send(
    opts.to,
    "We couldn't verify your AMOURA payment",
    layout(
      "We couldn't verify that payment",
      `<p>We weren't able to match transaction <strong style="font-family:monospace;color:#F3E6E1">${opts.transactionId}</strong> against our records.</p>
       ${opts.note ? `<p style="background:#3A131A;padding:12px;border-radius:10px">${opts.note}</p>` : ""}
       <p>This is usually a typo in the transaction ID. Please double-check the TrxID in your bKash or Nagad message and submit it again.</p>
       <p><strong style="color:#F3E6E1">If you did send the money, don't worry</strong> — nothing is lost. Reply to this email with a screenshot and we'll sort it out.</p>`
    )
  );
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${process.env.SITE_URL ?? "https://site.amouradhaka.workers.dev"}/reset-password?token=${opts.token}`;
  await send(
    opts.to,
    "Reset your AMOURA password",
    layout(
      `Reset your password, ${opts.name.split(" ")[0]}`,
      `<p>Someone requested a password reset for this account. If that was you, click below — this link works for 1 hour.</p>
       <p style="margin-top:20px"><a href="${url}" style="display:inline-block;background:#C9A66B;color:#2a1c05;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:13px">Reset password</a></p>
       <p style="margin-top:20px;font-size:12px">If you didn't request this, you can ignore this email — your password won't change.</p>`
    )
  );
}

export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const url = `${process.env.SITE_URL ?? "https://site.amouradhaka.workers.dev"}/verify-email?token=${opts.token}`;
  await send(
    opts.to,
    "Verify your email — AMOURA",
    layout(
      `Welcome, ${opts.name.split(" ")[0]}`,
      `<p>One last step — verify your email so we know it's really you.</p>
       <p style="margin-top:20px"><a href="${url}" style="display:inline-block;background:#C9A66B;color:#2a1c05;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:13px">Verify email</a></p>
       <p style="margin-top:20px;font-size:12px">This link works for 24 hours.</p>`
    )
  );
}

/** Tells the admin a payment is waiting, so nothing sits unnoticed. */
export async function sendAdminNewPaymentEmail(opts: {
  userName: string;
  userEmail: string;
  tier: string;
  amount: number;
  transactionId: string;
  senderNumber: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await send(
    adminEmail,
    `New ${opts.tier.toUpperCase()} payment to verify — BDT ${opts.amount.toLocaleString()}`,
    layout(
      "A payment is waiting for review",
      `<table style="width:100%;font-size:13px">
         <tr><td style="color:#7A5A54;padding:4px 0">Member</td><td style="color:#F3E6E1;text-align:right">${opts.userName} (${opts.userEmail})</td></tr>
         <tr><td style="color:#7A5A54;padding:4px 0">Plan</td><td style="color:#F3E6E1;text-align:right">${opts.tier.toUpperCase()}</td></tr>
         <tr><td style="color:#7A5A54;padding:4px 0">Amount</td><td style="color:#F3E6E1;text-align:right">BDT ${opts.amount.toLocaleString()}</td></tr>
         <tr><td style="color:#7A5A54;padding:4px 0">TrxID</td><td style="color:#F3E6E1;text-align:right;font-family:monospace">${opts.transactionId}</td></tr>
         <tr><td style="color:#7A5A54;padding:4px 0">Sent from</td><td style="color:#F3E6E1;text-align:right">${opts.senderNumber}</td></tr>
       </table>
       <p style="margin-top:20px"><a href="${process.env.SITE_URL ?? "https://site.amouradhaka.workers.dev"}/admin" style="display:inline-block;background:#C7364B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:600;font-size:13px">Review in admin</a></p>`
    )
  );
}
