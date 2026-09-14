const fs = require('fs');
let content = fs.readFileSync('backend/server.cjs', 'utf8');

const oldHtmlBlock = /const html = `[\s\S]*?`;/;

const newHtmlBlock = "const html = `\n" +
'      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; color: #333333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">\n' +
'        <div style="text-align: center; margin-bottom: 30px;">\n' +
'          <img src="${origin}/nhfg-logo.png" alt="New Holland Financial Group Logo" style="max-width: 150px; height: auto;" />\n' +
'        </div>\n' +
'        \n' +
'        <h2 style="color: #0B2240; font-size: 24px; text-align: center; margin-bottom: 20px;">Welcome to New Holland Financial Group!</h2>\n' +
'        \n' +
'        <p>Hello ${name},</p>\n' +
'        \n' +
'        <p>We’re excited to welcome you to the NHFG advisor network.</p>\n' +
'        \n' +
'        <p>Your application to join New Holland Financial Group has been approved, and we’re ready to help you get started. Our goal is to provide you with the tools, resources, technology, and support you need to build and grow your practice while serving your clients.</p>\n' +
'        \n' +
'        <h3 style="color: #0A62A7; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Your Next Step: Create Your NHFG Account</h3>\n' +
'        \n' +
'        <p>Please use the link below to complete your account setup:</p>\n' +
'        \n' +
'        <div style="text-align: center; margin: 30px 0;">\n' +
'          <a href="${inviteLink}" style="display: inline-block; background-color: #0A62A7; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px;">CREATE YOUR NHFG ACCOUNT</a>\n' +
'        </div>\n' +
'        \n' +
'        <p>Once your account is created, you’ll be able to access your advisor resources and complete the remaining onboarding steps.</p>\n' +
'        \n' +
'        <h3 style="color: #0B2240; font-size: 18px; margin-top: 30px;">What You’ll Have Access To</h3>\n' +
'        \n' +
'        <p>As an NHFG advisor, you may have access to resources designed to help you:</p>\n' +
'        \n' +
'        <ul style="padding-left: 20px;">\n' +
'          <li style="margin-bottom: 8px;">Manage your advisor profile and account</li>\n' +
'          <li style="margin-bottom: 8px;">Access NHFG tools and resources</li>\n' +
'          <li style="margin-bottom: 8px;">Submit and manage applicable applications</li>\n' +
'          <li style="margin-bottom: 8px;">Access carrier and product resources</li>\n' +
'          <li style="margin-bottom: 8px;">Manage client-related information and documents</li>\n' +
'          <li style="margin-bottom: 8px;">Communicate with the NHFG support team</li>\n' +
'          <li style="margin-bottom: 8px;">Access training and educational resources</li>\n' +
'          <li style="margin-bottom: 8px;">Grow and manage your practice through the NHFG platform</li>\n' +
'        </ul>\n' +
'        \n' +
'        <p style="font-size: 14px; color: #64748b; margin-top: 20px;"><i>Additional access may become available as you complete your onboarding requirements and any applicable agreements, licensing, compliance, or carrier requirements.</i></p>\n' +
'        \n' +
'        <h3 style="color: #0B2240; font-size: 18px; margin-top: 30px;">Important</h3>\n' +
'        \n' +
'        <p>Your NHFG account is intended for your individual use. Please keep your login credentials secure and do not share your account access with anyone else.</p>\n' +
'        \n' +
'        <p>If you have questions or need assistance during the onboarding process, our team is here to help.</p>\n' +
'        \n' +
'        <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px;">\n' +
'          <p style="font-weight: bold; margin-bottom: 5px; color: #0B2240;">New Holland Financial Group</p>\n' +
'          <p style="margin: 0; font-size: 14px; color: #475569;">Des Moines, Iowa</p>\n' +
'          <p style="margin: 0; font-size: 14px; color: #475569;">515-318-7450</p>\n' +
'          <p style="margin: 0; font-size: 14px; color: #0A62A7;"><a href="mailto:info@newhollandfinancial.com" style="color: #0A62A7; text-decoration: none;">info@newhollandfinancial.com</a></p>\n' +
'        </div>\n' +
'        \n' +
'        <p style="margin-top: 30px; font-weight: bold; color: #0B2240;">We’re excited to have you with us and look forward to supporting your success.</p>\n' +
'        \n' +
'        <p style="font-size: 16px; margin-top: 20px; color: #0B2240;">Welcome to NHFG!<br><br><strong>The New Holland Financial Group Team</strong></p>\n' +
'      </div>\n' +
'    `;';

content = content.replace(oldHtmlBlock, newHtmlBlock);
fs.writeFileSync('backend/server.cjs', content);
console.log('Patched email template in backend/server.cjs');
