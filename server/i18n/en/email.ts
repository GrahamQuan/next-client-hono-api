export const email = {
  signUpEmailTemplate: {
    subject: 'Verify your email',
    preview: '{websiteName} Email Verification',
    heading: 'Verify your email address',
    mainText:
      "Thanks for starting the new {websiteName} account creation process. We want to make sure it's really you. Please enter the following verification code when prompted. If you don't want to create an account, you can ignore this message.",
    verifyText: 'Verification code',
    validityText: '(This code is valid for 10 minutes)',
    cautionText:
      '{websiteName} will never email you and ask you to disclose or verify your password, credit card, or banking account number.',
    footerText:
      'This message was produced and distributed by {websiteName}, Inc., 410 Terry Ave. North, Seattle, WA 98109. © 2022, {websiteName}, Inc.. All rights reserved. {websiteName} is a registered trademark of {websiteName}, Inc. View our privacy policy.',
    logoAlt: "{websiteName}'s Logo",
  },
} as const;
