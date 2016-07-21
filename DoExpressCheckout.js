/*****************************************************
 * Partial implementation of PayPal DoExpressCheckout (nvp) request, emits 'done' event when request is complete.
 *****************************************************/
var querystring = require('querystring');
var https = require('https');
var events = require("events").EventEmitter;
var ShoppingCart = require("./ShoppingCart");
var credentials = require("./data/PayPalMerchantCredentials");

function prepare( data, cart, token, payerId)
{
	data.USER = credentials.USER;
	data.PWD = credentials.PWD;
	data.SIGNATURE = credentials.SIGNATURE;
	data.PAYMENTREQUEST_0_AMT = ShoppingCart.amount(cart);
    data.TOKEN = token;
	data.PAYERID = payerId;
	return data;
}

function emitEvent(self,data,cart)
{
	switch(data.ACK.toLowerCase())
	{
		case "success":
		  self.emit('success', paypalResData, cart);
		  break;
		case "failure":
		  self.emit('fail', data, cart);
		  break;
		default:
		  console.info("done");
	}
}
function DoExpressCheckout(cart,token,payerId){
	events.call(this);

	this.checkOutData= {
		'VERSION' : '113',
		'PAYMENTREQUEST_0_CURRENCYCODE' : 'SGD',
		'PAYMENTREQUEST_0_PAYMENTACTION' : 'Sale',
		'METHOD' : 'DoExpressCheckoutPayment'
	};

	this.checkOutDetails = prepare(this.checkOutData,cart,token,payerId);
	
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
		  res.on('data', function (chunk) {  responseData+=chunk; });

		  res.on('end', function() {
			  paypalResData = querystring.parse(responseData);
			  emitEvent(self,paypalResData,cart);			  
		  });
	  });

	  post_req.on('error', function (err) {
		console.log("Ignoring exception in DoExpressCheckout: " + err.message);
	  });
	  
	  // http post
	  console.log("DoExpressCheckout.post: "+JSON.stringify(postData,undefined,2));
	  post_req.write(postData);
	  post_req.end();
	}
} //DoExpressCheckOut
DoExpressCheckout.prototype.__proto__ = events.prototype;
module.exports = DoExpressCheckout;