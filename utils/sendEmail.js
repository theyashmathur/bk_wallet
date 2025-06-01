const mailjet = require('node-mailjet');

const mailjetClient = mailjet.apiConnect(
  '864264e755d79ff39a9b4e94e93eb1c5',
  '8c3610829e02a20b57a774ea9c0e56e8'
);

// sendEmail.js


const sendEmail = async () => {
  try {
    const request = await mailjetClient
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'your_verified_sender@example.com',
              Name: 'Your Name',
            },
            To: [
              {
                Email: 'recipient@example.com',
                Name: 'Recipient Name',
              },
            ],
            Subject: 'Hello from Mailjet',
            TextPart: 'This is a test email using Mailjet and Node.js',
            HTMLPart:
              '<h3>Hello from <a href="https://www.mailjet.com/">Mailjet</a>!</h3><p>This is a test email sent via Node.js.</p>',
          },
        ],
      });

    console.log('Email sent:', request.body);
  } catch (err) {
    console.error('Error sending email:', err.response?.body || err);
  }
};




module.exports = sendEmail;
