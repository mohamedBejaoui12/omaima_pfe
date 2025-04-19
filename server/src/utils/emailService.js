const nodemailer = require('nodemailer');

// Create a transporter object with more explicit settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps with some certificate issues
  },
  debug: true // Enable debug output
});

// Function to send project assignment email
exports.sendProjectAssignmentEmail = async ({ to, projectName, memberName, emailType = 'assignment' }) => {
  try {
    // Determine email content based on type
    let subject, text;
    
    // Common HTML header with styling (no logo)
    const htmlHeader = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1890ff; margin: 0;">PMS</h1>
          <p style="margin: 5px 0 0;">Project Management System</p>
        </div>
        <div style="background-color: #1890ff; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">${emailType === 'removal' ? 'Project Removal Notification' : 'Project Assignment Notification'}</h2>
        </div>
    `;
    
    // Common HTML footer
    const htmlFooter = `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
          <p>Best regards,<br>The Project Management Team</p>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Project Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    
    if (emailType === 'removal') {
      subject = `Removed from Project: ${projectName}`;
      text = `Hello ${memberName},\n\nYou have been removed from the project "${projectName}". Please contact your project manager for more information.\n\nBest regards,\nThe Project Management Team`;
      
      html = `${htmlHeader}
        <div style="padding: 0 15px;">
          <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${memberName}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">We're writing to inform you that you have been <span style="color: #ff4d4f; font-weight: bold;">removed</span> from the project:</p>
          <div style="background-color: #f0f5ff; border-left: 4px solid #1890ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #1890ff;">${projectName}</h3>
            <p style="margin: 0; color: #555;">Please contact your project manager for more information about this change.</p>
          </div>
        </div>${htmlFooter}`;
    } else {
      subject = `New Project Assignment: ${projectName}`;
      text = `Hello ${memberName},\n\nYou have been assigned to the project "${projectName}". Please log in to the system to view your project details.\n\nBest regards,\nThe Project Management Team`;
      
      html = `${htmlHeader}
        <div style="padding: 0 15px;">
          <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${memberName}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">We're excited to inform you that you have been <span style="color: #52c41a; font-weight: bold;">assigned</span> to a new project:</p>
          <div style="background-color: #f0f5ff; border-left: 4px solid #1890ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #1890ff;">${projectName}</h3>
            <p style="margin: 0; color: #555;">Please log in to the system to view your project details and get started.</p>
          </div>
          <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">We look forward to your valuable contributions to this project!</p>
        </div>${htmlFooter}`;
    }

    // Prepare email options (without logo attachment)
    const mailOptions = {
      from: `"Project Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };
    
    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
    
    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't throw the error, just log it to prevent API failures
    return { error: error.message, success: false };
  }
};

// Add a verification function to test the connection
exports.verifyEmailConnection = async () => {
  try {
    console.log('Verifying email connection...');
    const verification = await transporter.verify();
    console.log('SMTP connection verified:', verification);
    return verification;
  } catch (error) {
    console.error('SMTP verification failed:', error.message);
    return { error: error.message, success: false };
  }
};

// Add a test function to send a test email
exports.sendTestEmail = async (to) => {
  try {
    const info = await transporter.sendMail({
      from: `"Project Management System Test" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Test Email from Project Management System',
      text: 'This is a test email to verify that the email service is working correctly.',
      html: '<p>This is a test email to verify that the email service is working correctly.</p>'
    });
    
    console.log('Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Test email failed:', error);
    return { error: error.message, success: false };
  }
};