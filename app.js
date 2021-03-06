var express 	= require('express'),
	app     	= express(),
	ibmbluemix 	= require('ibmbluemix'),
	ibmdata     = require('ibmdata'),
	config  	= {
		// change to real application route assigned for your application
		applicationRoute : "yourApplicationRoute",
		// change to real application ID generated by Bluemix for your application
		applicationId : "yourApplicationId"
	};

var https = require('https');

// init core sdk
ibmbluemix.initialize(config);
var logger = ibmbluemix.getLogger();

app.use(express.static(__dirname + "/public"));

//redirect to cloudcode doc page when accessing the root context
app.get('/', function(req, res){
	res.sendfile('index.html');
});

// init service sdks 
app.use(function(req, res, next) {
    req.data = ibmdata.initializeService(req);
//    req.ibmpush = ibmpush.initializeService(req);
    req.logger = logger;
    next();
});


// init basics for an express app
app.use(require('./lib/setup'));

  function callApi(details, callback) {
    var payload = details.payload ? details.payload: "";
    var options = {
      host: "nordea-api.icds.ibmcloud.com",
      path: "/nordea/sb"+details.route+"&client_id="+details.clientId,
      method: "GET",
      port: 443,
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length
      }
    };
    var data = "";
    var apiReq = https.request(options, function(response) {
      response.on('data', function(d) {
        data += d;
      });
      response.on('end', function() {
        callback(data);
      });
      response.on('error', function(error) {
        process.stdout.write(error);
      });
    });
    if (payload.length > 0) {
      apiReq.write(payload);
    }
    apiReq.end();
  }

   app.get('/api/getAccount/:id', function(req, res){
    var details = {
      route: "/accounts/get?AccountId="+req.params.id,
      method: "GET",
      clientId: "0454e152-3e29-447a-91b5-a3d22ba984a4"
    };

    callApi(details, function(data){
      var customer = JSON.parse(data);

      res.json(customer);
    });
  });

   app.get('/api/getNeededInfo/:id', function(req, res){
    var details = {
      route: "/accounts/get?AccountId="+req.params.id,
      method: "GET",
      clientId: "0454e152-3e29-447a-91b5-a3d22ba984a4"
    };

    callApi(details, function(data){
      var customer = JSON.parse(data);
      if (customer.Income > 20) {
        res.json({
                  income: customer.Income,
                  threshold: 20,
                  button: {yes: "yes", no:"no"},
                  message:"<p>Hi John,</p><p>We have noticied that there has been significant surplus on your account over 20 days. We suggest that you consider investing it to a more profitable solution. Press products to read about our current investment options, press request contact to receivea call from our investment advisor or press call to call directly to our investment advisor.</p>"
                });
      } else {
        res.json({
                  income: customer.Income,
                  threshold: 20,
                  button: {yes: "yes", no:"no"},
                  message:"nothing special"
                });
      }
      
    });
  });
//uncomment below code to protect endpoints created afterwards by MAS
//var mas = require('ibmsecurity')();
//app.use(mas);

var ibmconfig = ibmbluemix.getConfig();

logger.info('mbaas context root: '+ibmconfig.getContextRoot());
// "Require" modules and files containing endpoints and apply the routes to our application
app.use(ibmconfig.getContextRoot(), require('./lib/accounts'));
app.use(ibmconfig.getContextRoot(), require('./lib/staticfile'));

// Want to see how you can easily extend this template to work with third party node modules?
// If so, add the Twilio service to your Mobile Cloud application and uncomment this next line.
// app.use(ibmconfig.getContextRoot(), require('./lib/mytwilio')(ibmbluemix));

app.listen(ibmconfig.getPort());
logger.info('Server started at port: '+ibmconfig.getPort());
