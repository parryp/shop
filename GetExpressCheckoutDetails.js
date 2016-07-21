/*****************************************************
 * Implements PayPal GetExpressCheckout request, emits 'done' event when request is complete.
 *****************************************************/
 
var querystring = require('querystring');
var https = require('https');
var events = require("events").EventEmitter;
var credentials = require("./data/PayPalMerchantCredentials");

function prepare(data,token) {
	data.USER = credentials.USER;
	data.PWD = credentials.PWD;
	data.SIGNATURE = credentials.SIGNATURE;
	data.TOKEN = token;
	return data;
}

function GetExpressCheckoutDetails(token){
	events.call(this);
	
	this.checkOutDetails = {
	'VERSION' : '113',
	'METHOD' : 'GetExpressCheckoutDetails'
	};
	
	this.checkOutDetails = prepare(this.checkOutDetails,token);
	
	this.post = function () {

	  var postData = querystring.stringify(this.checkOutDetails);
	  var self = this;
	  
	  // An object of options to indicate where to post to
	  var post_options = {
		  host: 'api-3t.sandbox.paypal.com',  port: '443',
		  path: '/nvp',  method: 'POST',
		  timeout: '25000',  followRedirect: true, maxRedirects: '3',
		  headers: {
			  'User-Agent' : 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Content-Length': postData.length
		  }
	  };

	  // Set up the request
	  var responseData='';
	  var post_req = https.request(post_options, function(res) {
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {  responseData+=chunk;  });

		  res.on('end', function() {
			  paypalResData = querystring.parse(responseData);
			  self.emit('done', paypalResData);
		  });
	  });

	  post_req.on('error', function (err) {
		console.log("Ignoring exception in SetCheckOut: " + err.message);
	  });
	  
	  // http post
	  console.log("GetExpressCheckoutDetails post: "+postData);
	  post_req.write(postData);
	  post_req.end();
	}
    
} //GetExpressCheckOutDetails
GetExpressCheckoutDetails.prototype.__proto__ = events.prototype;
module.exports = GetExpressCheckoutDetails;