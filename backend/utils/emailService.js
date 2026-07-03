const nodemailer = require('nodemailer');

// Email transporter configuration
let transporter = null;

const initializeEmailService = () => {
  try {
    // Check if email credentials are configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection
      transporter.verify((error, success) => {
        if (error) {
          console.error('Email service verification failed:', error);
          transporter = null;
        } else {
          console.log('Email service is ready');
        }
      });
    } else {
      console.log('Email service not configured (missing SMTP credentials)');
    }
  } catch (error) {
    console.error('Failed to initialize email service:', error);
    transporter = null;
  }
};

const sendEmail = async (to, subject, html, text = null) => {
  if (!transporter) {
    console.log('Email service not available, skipping email send');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"Society Maintenance Tracker" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for plain text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

// Email templates for different notification types
const emailTemplates = {
  // Complaint created notification to admin
  complaintCreated: (data) => ({
    subject: `🚨 New Complaint: ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
          .badge-priority-low { background: #10B981; color: white; }
          .badge-priority-medium { background: #F59E0B; color: white; }
          .badge-priority-high { background: #EF4444; color: white; }
          .badge-priority-urgent { background: #7C3AED; color: white; }
          .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🚨 New Complaint Submitted</h2>
        </div>
        <div class="content">
          <p><strong>Resident:</strong> ${data.userName} (${data.userApartment})</p>
          <p><strong>Title:</strong> ${data.title}</p>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Priority:</strong> <span class="badge badge-priority-${data.priority}">${data.priority.toUpperCase()}</span></p>
          <p><strong>Description:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px;">${data.description}</p>
          ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
          ${data.hasPhoto ? '<p>📷 Photos attached</p>' : ''}
          <p style="margin-top: 20px;">
            <a href="${data.url}/admin" class="btn">View Complaint in Admin Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Society Maintenance Tracker</p>
        </div>
      </body>
      </html>
    `
  }),

  // Status update notification to resident
  statusUpdated: (data) => ({
    subject: `📋 Complaint Status Update: ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .status-change { background: #ecfdf5; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📋 Your Complaint Status Has Been Updated</h2>
        </div>
        <div class="content">
          <p><strong>Complaint:</strong> ${data.title}</p>
          <div class="status-change">
            <p><strong>Status Changed:</strong> <span style="color: #6B7280;">${data.oldStatus}</span> → <strong>${data.newStatus}</strong></p>
            ${data.comment ? `<p><strong>Admin Note:</strong> ${data.comment}</p>` : ''}
          </div>
          ${data.updatedBy ? `<p><strong>Updated by:</strong> ${data.updatedBy}</p>` : ''}
          <p style="margin-top: 20px;">
            <a href="${data.url}/resident" class="btn">View Complaint History</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Society Maintenance Tracker</p>
        </div>
      </body>
      </html>
    `
  }),

  // New notice notification
  newNotice: (data) => ({
    subject: `📢 ${data.priority === 'urgent' ? 'URGENT: ' : ''}${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${data.priority === 'urgent' ? '#EF4444' : data.priority === 'high' ? '#F59E0B' : '#3B82F6'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .notice-body { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${data.priority === 'urgent' ? '🚨 URGENT NOTICE' : '📢 New Society Notice'}</h2>
        </div>
        <div class="content">
          <p><strong>From:</strong> Society Administration</p>
          <div class="notice-body">
            <p>${data.content.replace(/\n/g, '</p><p>')}</p>
          </div>
          ${data.expiresAt ? `<p><strong>Expires:</strong> ${new Date(data.expiresAt).toLocaleDateString()}</p>` : ''}
          <p style="margin-top: 20px;">
            <a href="${data.url}/notices" class="btn">View All Notices</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Society Maintenance Tracker</p>
        </div>
      </body>
      </html>
    `
  }),

  // Notice created notification
  noticeCreated: (data) => ({
    subject: `📢 ${data.priority === 'urgent' ? 'URGENT: ' : ''}${data.noticeTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${data.priority === 'urgent' ? '#EF4444' : data.priority === 'high' ? '#F59E0B' : '#3B82F6'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .notice-body { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${data.priority === 'urgent' ? '🚨 URGENT NOTICE' : '📢 New Society Notice'}</h2>
        </div>
        <div class="content">
          <p><strong>From:</strong> Society Administration (${data.authorName})</p>
          <div class="notice-body">
            <p>${data.content.replace(/\n/g, '</p><p>')}</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="${data.url}/notices" class="btn">View All Notices</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Society Maintenance Tracker</p>
        </div>
      </body>
      </html>
    `
  }),

  // Priority change notification to resident
  priorityUpdated: (data) => ({
    subject: `⚡ Complaint Priority Changed: ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .priority-change { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>⚡ Your Complaint Priority Has Been Updated</h2>
        </div>
        <div class="content">
          <p><strong>Complaint:</strong> ${data.title}</p>
          <div class="priority-change">
            <p><strong>Priority Changed:</strong> ${data.oldPriority} → <strong>${data.newPriority}</strong></p>
            ${data.comment ? `<p><strong>Reason:</strong> ${data.comment}</p>` : ''}
          </div>
          ${data.updatedBy ? `<p><strong>Updated by:</strong> ${data.updatedBy}</p>` : ''}
          <p style="margin-top: 20px;">
            <a href="${data.url}/resident" class="btn">View Complaint Details</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Society Maintenance Tracker</p>
        </div>
      </body>
      </html>
    `
  })
};

module.exports = {
  initializeEmailService,
  sendEmail,
  emailTemplates
};