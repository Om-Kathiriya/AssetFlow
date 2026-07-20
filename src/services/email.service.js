import nodemailer from 'nodemailer';

// Configure Transporter based on Environment Variables
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

// Generic send helper with fallback console logger for development
const sendMail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'AssetFlow Support'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@assetflow.com'}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Fallback logger if no SMTP config in .env
  console.log('\n=================== [MOCK EMAIL NOTIFICATION] ===================');
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CONTENT: ${text || html}`);
  console.log('=================================================================\n');

  return { success: true, mocked: true };
};

// Send Asset Allocation Email
export const sendAllocationEmail = async ({ to, userName, assetName, assetTag, expectedReturnDate }) => {
  const subject = `Asset Allocated: ${assetName} (${assetTag})`;
  const text = `Hello ${userName},\n\nThe asset "${assetName}" [Tag: ${assetTag}] has been allocated to you.\nExpected Return Date: ${new Date(expectedReturnDate).toLocaleDateString()}\n\nThank you,\nAssetFlow Team`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Asset Flow — Allocation Receipt</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>The following asset has been officially allocated to you:</p>
      <ul>
        <li><strong>Asset Name:</strong> ${assetName}</li>
        <li><strong>Asset Tag:</strong> ${assetTag}</li>
        <li><strong>Expected Return Date:</strong> ${new Date(expectedReturnDate).toLocaleDateString()}</li>
      </ul>
      <p>Please ensure proper care and report any issues promptly.</p>
      <br/>
      <p>Best regards,<br/><strong>AssetFlow Team</strong></p>
    </div>
  `;

  return await sendMail({ to, subject, html, text });
};

// Send Overdue Return Reminder Email
export const sendOverdueReminderEmail = async ({ to, userName, assetName, assetTag, expectedReturnDate }) => {
  const subject = `URGENT: Overdue Asset Return Notice — ${assetName} (${assetTag})`;
  const text = `Hello ${userName},\n\nThis is an urgent reminder that your checkout for "${assetName}" [Tag: ${assetTag}] was expected back on ${new Date(expectedReturnDate).toLocaleDateString()} and is now OVERDUE.\n\nPlease return the asset as soon as possible.\n\nAssetFlow Management`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #dc2626;">URGENT: Overdue Asset Return Notice</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>Our records indicate that the following asset assigned to you is past its due date:</p>
      <ul>
        <li><strong>Asset Name:</strong> ${assetName}</li>
        <li><strong>Asset Tag:</strong> ${assetTag}</li>
        <li><strong>Due Date:</strong> ${new Date(expectedReturnDate).toLocaleDateString()}</li>
      </ul>
      <p style="color: #dc2626; font-weight: bold;">Please arrange for the return of this asset immediately.</p>
      <br/>
      <p>Best regards,<br/><strong>AssetFlow Management</strong></p>
    </div>
  `;

  return await sendMail({ to, subject, html, text });
};

// Send Maintenance Status Update Email
export const sendMaintenanceUpdateEmail = async ({ to, userName, assetName, status, notes }) => {
  const subject = `Maintenance Update: ${assetName} is now ${status}`;
  const text = `Hello ${userName},\n\nThe maintenance ticket for "${assetName}" has been updated to ${status}.\nNotes: ${notes || 'N/A'}\n\nAssetFlow Support`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #059669;">Maintenance Ticket Update</h2>
      <p>Hello <strong>${userName}</strong>,</p>
      <p>The repair ticket for <strong>${assetName}</strong> has been updated:</p>
      <ul>
        <li><strong>Current Status:</strong> <span style="font-weight: bold;">${status}</span></li>
        <li><strong>Notes:</strong> ${notes || 'None'}</li>
      </ul>
      <br/>
      <p>Best regards,<br/><strong>AssetFlow Support</strong></p>
    </div>
  `;

  return await sendMail({ to, subject, html, text });
};
