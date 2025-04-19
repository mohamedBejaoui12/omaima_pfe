// This file previously contained email functionality that has been removed
// It now provides stub functions that log messages instead of sending emails

// Stub function for project assignment email
exports.sendProjectAssignmentEmail = async ({ to, projectName, memberName, emailType = 'assignment' }) => {
  console.log(`[Email Service] Would have sent ${emailType} email to ${to} for project "${projectName}"`);
  return { success: true, messageId: 'email-disabled' };
};

// Stub function for email connection verification
exports.verifyEmailConnection = async () => {
  console.log('[Email Service] Email functionality is disabled');
  return { success: true, disabled: true };
};

// Stub function for test email
exports.sendTestEmail = async (to) => {
  console.log(`[Email Service] Would have sent test email to ${to}`);
  return { success: true, disabled: true };
};