const sendSMS = async (mobileNumber, message) => {
        // You can integrate Twilio, MSG91, etc.
        console.log(`📲 SMS sent to ${mobileNumber}: ${message}`);
      };
      
      module.exports = sendSMS;
      