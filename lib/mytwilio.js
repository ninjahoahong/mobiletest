var router = require('express').Router();
var twilio = require('twilio');

//change this to the real phone number for twilio to send text
var appConfig = {
    toPhone: "+15551234567",
    fromPhone: "+15557654321"
};

var twilioClient;

var myTwilio = {
		
	/*
     * To test: curl -X POST -H "Content-Type: application/json" http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/notifyOtherDevices
     */	
	notifyOtherDevices: function(req,res) {
		var logger = req.logger;
		var twilioTextMessage = "Hello from cloudcode";
		
        // Send twilio text
        twilioClient.sendMessage({
            to: appConfig.toPhone,
            from: appConfig.fromPhone,
            body: twilioTextMessage
        }, function(err, message) {
            if (err) {
                var errorMessage = "An error occurred sending the SMS through twilio.";
                logger.error(errorMessage+": "+err)
                res.send(500, {
                    status: "FAILED",
                    statusMessage: errorMessage,
                    error: err
                });
            } else {
                logger.info('Twilio Sent message ID: ' + message.sid);
                res.send({
                    status: "SUCCESS",
                    statusMessage: "Sent text message to Twilio phone number successfully",
                    smsMessage: twilioTextMessage,
                    twilioResponse: message
                });
                logger.info("Returned response to device");
            }
        });
	},
	
	error: function(req, res) {
		res.send("Failed to initialize Twilio, please check your configuration!");
	}
};

module.exports = exports = function(ibmbluemix){
	var logger = ibmbluemix.getLogger();
	var myTwilioCallback = myTwilio.notifyOtherDevices;
	try {
		var twilioSid = ibmbluemix.getConfig().vcapServices['user-provided'][0].credentials.accountSID;
		var twilioToken = ibmbluemix.getConfig().vcapServices['user-provided'][0].credentials.authToken;
		
		logger.info("Twilio account SID=" + twilioSid);
		logger.info("Twilio authToken=" + twilioToken);

		twilioClient = new twilio.RestClient(twilioSid, twilioToken);
		
	} catch (err) {
		logger.error("Create Twilio client failed, please check if the Twilio service has been bound to this application.");
		myTwilioCallback = myTwilio.error;
	}
	
	router.post('/notifyOtherDevices', myTwilioCallback);
	
	return router;
};


	

