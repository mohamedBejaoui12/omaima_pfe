const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,     // e.g., 'smtp.gmail.com'
  port: process.env.EMAIL_PORT,     // e.g., 587
  secure: false,                    // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,   // Your email
    pass: process.env.EMAIL_PASS    // Your email password or app password
  }
});

/**
 * Send an email to a project member about their project status
 * @param {Object} options - Email configuration options
 * @param {string} options.to - Recipient email address
 * @param {string} options.projectName - Name of the project
 * @param {string} options.memberName - Name of the member
 * @param {string} [options.emailType='assignment'] - Type of email (assignment or removal)
 */
const sendProjectAssignmentEmail = async (options) => {
  const { 
    to, 
    projectName, 
    memberName, 
    emailType = 'assignment' 
  } = options;

  try {
    const emailTemplates = {
        assignment: {
          subject: `Project Assignment: ${projectName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Project Assignment Notification</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    background-color: #f2f7fc;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  }
                  .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                  }
                  .header {
                    background: linear-gradient(90deg, #a7d0f0, #6ec5ff);
                    padding: 20px;
                    text-align: center;
                  }
                  .header h2 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 26px;
                    letter-spacing: 0.5px;
                  }
                  .content {
                    padding: 30px;
                    color: #333333;
                    line-height: 1.6;
                  }
                  .content p {
                    margin: 0 0 20px;
                    font-size: 16px;
                  }
                  .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #6ec5ff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                  }
                  .footer {
                    background-color: #f7f9fc;
                    padding: 15px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #999999;
                    border-top: 1px solid #e0e6ed;
                  }
                  @media (max-width: 600px) {
                    .container {
                      margin: 20px;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>Project Assignment Notification</h2>
                  </div>
                  <div class="content">
                    <p>Dear ${memberName},</p>
                    <p>We are delighted to inform you that you have been assigned to the project <strong>${projectName}</strong>. Your expertise is highly valued, and we are confident you will make significant contributions to its success.</p>
                    <p>Please log in to our Project Management System to review the project details and next steps.</p>
                    <p><a href="https://yourprojectmanagementsystem.com" class="button">View Project Details</a></p>
                  </div>
                  <div class="footer">
                    <p>This is an automated notification. Please do not reply.</p>
                  </div>
                </div>
              </body>
            </html>
          `
        },
        removal: {
          subject: `Project Removal Notification: ${projectName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Project Removal Notification</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    background-color: #f2f7fc;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  }
                  .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    overflow: hidden;
                  }
                  .header {
                    background: linear-gradient(90deg, #a7d0f0, #6ec5ff);
                    padding: 20px;
                    text-align: center;
                  }
                  .header h2 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 26px;
                    letter-spacing: 0.5px;
                  }
                  .content {
                    padding: 30px;
                    color: #333333;
                    line-height: 1.6;
                  }
                  .content p {
                    margin: 0 0 20px;
                    font-size: 16px;
                  }
                  .footer {
                    background-color: #f7f9fc;
                    padding: 15px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #999999;
                    border-top: 1px solid #e0e6ed;
                  }
                  @media (max-width: 600px) {
                    .container {
                      margin: 20px;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>Project Removal Notification</h2>
                  </div>
                  <div class="content">
                    <p>Dear ${memberName},</p>
                    <p>We regret to inform you that you have been removed from the project <strong>${projectName}</strong>. If you have any questions or need further information, please contact your project manager directly.</p>
                    <p>We appreciate your contributions and hope to collaborate with you on future projects.</p>
                  </div>
                  <div class="footer">
                    <p>This is an automated notification. Please do not reply.</p>
                  </div>
                </div>
              </body>
            </html>
          `
        }
      };
      

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Project Management System" <noreply@yourcompany.com>',
      to: to,
      subject: emailTemplates[emailType].subject,
      html: emailTemplates[emailType].html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendProjectAssignmentEmail
};