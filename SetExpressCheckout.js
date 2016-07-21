/*****************************************************
 * Implements PayPal SetExpressCheckout request, emits 'done' event when request is complete.
 *****************************************************/
var querystring = require('querystring');
var https = require('https');
var events = require("events").EventEmitter;
var os = require("os");
var ShoppingCart = require("./ShoppingCart");
var credentials = require("./data/PayPalMerchantCredentials");

function prepare( data, cart )
{
	data.USER = credentials.USER;
	data.PWD = credentials.PWD;
	data.SIGNATURE = credentials.SIGNATURE;
	data.PAYMENTREQUEST_0_AMT = ShoppingCart.amount(cart);
	
	for( c=0; c<cart.items.length; c++)
	{
		data["L_PAYMENTREQUEST_0_NAME"+c]=cart.items[c].name;
		data["L_PAYMENTREQUEST_0_AMT"+c]=cart.items[c].price;
			if(cart.items[c].description !== undefined && cart.items[c].description.length > 0)
			{
				//PayPal limits this to 127 characters.
				data["L_PAYMENTREQUEST_0_DESC"+c]=cart.items[c].description.substring(0,127); 
			}
	}

	return data;
}
	
function SetExpressCheckout(cart){
	this.checkOutData= {
		'VERSION' : '113',
		'PAYMENTREQUEST_0_PAYMENTACTION' : 'Sale',
		'RETURNURL' : 'http://' + os.hostname() + ':3000/order',
		'CANCELURL' : 'http://' + os.hostname() + ':3000/cart',
		'PAYMENTREQUEST_0_CURRENCYCODE' : 'SGD',
		'METHOD' : 'SetExpressCheckout'
	};
	
	events.call(this);

	this.checkOutData = prepare(this.checkOutData, cart);

	this.post = function () {

	  var postData = querystring.stringify(this.checkOutData);
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
			  console.log("SetExpressCheckout response: "+JSON.stringify(paypalResData,undefined,2));
			  if(paypalResData && paypalResData.ACK !== undefined)
			  {
				switch(paypalResData.ACK.toLowerCase())
				{
 					case "failure" : self.emit("fail", paypalResData); break;
					case "success" : self.emit("success", paypalResData); break;
					case "error" : self.emit("error", paypalResData, "Paypal returned an error"); break;
                                        default : self.emit("unknown", paypalResData ); break;
				}
			  }
                          else
                            self.emit('error', "No proper response from PayPal");
		  });
	  });

	  post_req.on('error', function (err) {
		console.log("Ignoring exception in SetCheckOut: " + err.message);
	  });
	  
	  // http post
	  console.log("SetExpressCheckout.post: "+JSON.stringify(postData,undefined,2));
	  post_req.write(postData);
	  post_req.end();
	}
    
} //SetExpressCheckOut
SetExpressCheckout.prototype.__proto__ = events.prototype;
module.exports = SetExpressCheckout;
