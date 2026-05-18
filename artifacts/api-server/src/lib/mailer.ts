import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "rekhamth2020@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: GMAIL_APP_PASSWORD,
  },
});

export async function sendAdminNewRegistrationAlert(opts: {
  userName: string;
  userEmail: string;
  role: string;
  businessName?: string | null;
  locality?: string | null;
}) {
  const roleLabel = opts.role === "shop_owner" ? "Shop Owner" : "Customer";
  const extra =
    opts.role === "shop_owner"
      ? `<p><b>Business Name:</b> ${opts.businessName ?? "—"}</p><p><b>Locality:</b> ${opts.locality ?? "—"}</p>`
      : "";

  await transporter.sendMail({
    from: `"LocalBiz" <${ADMIN_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `[LocalBiz] New ${roleLabel} Registration — ${opts.userName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f0ff;border-radius:12px;overflow:hidden;">
        <div style="background:#8E9AAF;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">🏪 LocalBiz</h2>
          <p style="color:#eee;margin:4px 0 0;">New Registration Alert</p>
        </div>
        <div style="padding:28px 32px;">
          <p>A new <b>${roleLabel}</b> has registered and is waiting for your approval.</p>
          <table style="border-collapse:collapse;width:100%;background:#fff;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#666;width:40%">Name</td><td style="padding:12px 16px;border-bottom:1px solid #eee;font-weight:600">${opts.userName}</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${opts.userEmail}</td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#666">Role</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${roleLabel}</td></tr>
            ${opts.businessName ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #eee;color:#666">Business</td><td style="padding:12px 16px;border-bottom:1px solid #eee">${opts.businessName}</td></tr>` : ""}
            ${opts.locality ? `<tr><td style="padding:12px 16px;color:#666">Locality</td><td style="padding:12px 16px">${opts.locality}</td></tr>` : ""}
          </table>
          <p style="margin-top:24px;">Log in to your <b>Admin Panel</b> to approve or reject this registration.</p>
          <a href="${process.env.REPLIT_DOMAINS ? "https://" + process.env.REPLIT_DOMAINS.split(",")[0] : "http://localhost"}/admin" style="display:inline-block;margin-top:8px;padding:12px 28px;background:#8E9AAF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Open Admin Panel</a>
        </div>
        <div style="padding:16px 32px;background:#EFD3D7;text-align:center;font-size:12px;color:#666;">LocalBiz Admin Notifications</div>
      </div>
    `,
  });
}

export async function sendUserApprovalEmail(opts: {
  userName: string;
  userEmail: string;
  approved: boolean;
  reason?: string | null;
}) {
  const subject = opts.approved
    ? "[LocalBiz] Your account has been approved!"
    : "[LocalBiz] Update on your LocalBiz registration";

  const body = opts.approved
    ? `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f0ff;border-radius:12px;overflow:hidden;">
        <div style="background:#8E9AAF;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">🏪 LocalBiz</h2>
        </div>
        <div style="padding:28px 32px;">
          <h3 style="color:#2d6a4f;">✅ Account Approved!</h3>
          <p>Hi <b>${opts.userName}</b>,</p>
          <p>Great news! Your LocalBiz account has been <b>approved</b>. You can now log in and start using all features.</p>
          <a href="${process.env.REPLIT_DOMAINS ? "https://" + process.env.REPLIT_DOMAINS.split(",")[0] : "http://localhost"}/login" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#8E9AAF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Log in to LocalBiz</a>
        </div>
        <div style="padding:16px 32px;background:#EFD3D7;text-align:center;font-size:12px;color:#666;">LocalBiz — Your Neighbourhood Business Directory</div>
      </div>
    `
    : `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f0ff;border-radius:12px;overflow:hidden;">
        <div style="background:#8E9AAF;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">🏪 LocalBiz</h2>
        </div>
        <div style="padding:28px 32px;">
          <h3 style="color:#c0392b;">Registration Update</h3>
          <p>Hi <b>${opts.userName}</b>,</p>
          <p>Unfortunately your LocalBiz registration was not approved at this time.</p>
          ${opts.reason ? `<p><b>Reason:</b> ${opts.reason}</p>` : ""}
          <p>If you think this is a mistake, please contact us by replying to this email.</p>
        </div>
        <div style="padding:16px 32px;background:#EFD3D7;text-align:center;font-size:12px;color:#666;">LocalBiz — Your Neighbourhood Business Directory</div>
      </div>
    `;

  await transporter.sendMail({
    from: `"LocalBiz" <${ADMIN_EMAIL}>`,
    to: opts.userEmail,
    subject,
    html: body,
  });
}

export async function sendPasswordResetEmail(opts: {
  userName: string;
  userEmail: string;
  resetToken: string;
}) {
  const base = process.env.REPLIT_DOMAINS
    ? "https://" + process.env.REPLIT_DOMAINS.split(",")[0]
    : "http://localhost";
  const resetUrl = `${base}/reset-password?token=${opts.resetToken}`;

  await transporter.sendMail({
    from: `"LocalBiz" <${ADMIN_EMAIL}>`,
    to: opts.userEmail,
    subject: "[LocalBiz] Reset your password",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f0ff;border-radius:12px;overflow:hidden;">
        <div style="background:#8E9AAF;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">🏪 LocalBiz</h2>
          <p style="color:#eee;margin:4px 0 0;">Password Reset Request</p>
        </div>
        <div style="padding:28px 32px;">
          <p>Hi <b>${opts.userName}</b>,</p>
          <p>We received a request to reset your password. Click the button below to set a new one. This link expires in <b>1 hour</b>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin-top:8px;padding:12px 28px;background:#8E9AAF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset My Password</a>
          <p style="margin-top:24px;font-size:13px;color:#888;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
          <p style="font-size:12px;color:#aaa;word-break:break-all;">Or copy this link: ${resetUrl}</p>
        </div>
        <div style="padding:16px 32px;background:#EFD3D7;text-align:center;font-size:12px;color:#666;">LocalBiz — Your Neighbourhood Business Directory</div>
      </div>
    `,
  });
}

export async function sendShopApprovalEmail(opts: {
  ownerName: string;
  ownerEmail: string;
  shopName: string;
  approved: boolean;
  reason?: string | null;
}) {
  const subject = opts.approved
    ? `[LocalBiz] Your shop "${opts.shopName}" is now live!`
    : `[LocalBiz] Update on your shop "${opts.shopName}"`;

  const body = opts.approved
    ? `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f0ff;border-radius:12px;overflow:hidden;">
        <div style="background:#8E9AAF;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">🏪 LocalBiz</h2>
        </div>
        <div style="padding:28px 32px;">
          <h3 style="color:#2d6a4f;">✅ Shop Approved & Live!</h3>
          <p>Hi <b>${opts.ownerName}</b>,</p>
          <p>Your shop <b>"${opts.shopName}"</b> has been approved and is now <b>live</b> on LocalBiz. Customers can now find and visit your shop.</p>
          <a href="${process.env.REPLIT_DOMAINS ? "https://" + process.env.REPLIT_DOMAINS.split(",")[0] : "http://localhost"}/shops" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#8E9AAF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">View My Shop</a>
        </div>
        <div style="padding:16px 32px;background:#EFD3D7;text-align:center;font-size:12px;color:#666;">LocalBiz — Your Neighbourhood Business Directory</div>
      </div>
    `
    : `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#f9f0ff;border-radius:12px;overflow:hidden;">
        <div style="background:#8E9AAF;padding:24px 32px;">
          <h2 style="color:#fff;margin:0;">🏪 LocalBiz</h2>
        </div>
        <div style="padding:28px 32px;">
          <h3 style="color:#c0392b;">Shop Listing Update</h3>
          <p>Hi <b>${opts.ownerName}</b>,</p>
          <p>Your shop <b>"${opts.shopName}"</b> was not approved at this time.</p>
          ${opts.reason ? `<p><b>Reason:</b> ${opts.reason}</p>` : ""}
          <p>Please contact us by replying to this email if you have any questions.</p>
        </div>
        <div style="padding:16px 32px;background:#EFD3D7;text-align:center;font-size:12px;color:#666;">LocalBiz — Your Neighbourhood Business Directory</div>
      </div>
    `;

  await transporter.sendMail({
    from: `"LocalBiz" <${ADMIN_EMAIL}>`,
    to: opts.ownerEmail,
    subject,
    html: body,
  });
}
