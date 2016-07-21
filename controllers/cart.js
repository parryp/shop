var querystring=require("querystring");
var url=require('url');
var ShoppingCart=require("../ShoppingCart");
var ProductItem=require("../ProductItem");
var Products=require("../data/Products.json");
var SetExpressCheckout=require("../SetExpressCheckout");
var GetExpressCheckoutDetails=require("../GetExpressCheckoutDetails");

function verify(req,res)
{
	if(req.method !== 'POST')
		res.redirect('/');

	if(req.session.cart === undefined)
		req.session.cart = new ShoppingCart();
}

module.exports = function(req,res,next) {
	if(req.session.cart === undefined)
		req.session.cart = new ShoppingCart();

	res.render('cart', { title : "Shopping Cart", 
	                     shoppingcart : req.session.cart, 
						 total : ShoppingCart.amount(req.session.cart),
						 cartsize : ShoppingCart.size(req) });
}

module.exports.add = function(req, res, next){

	verify(req,res);
	
	postBody="";
	
	req.on('data', function(chunk){ postBody+=chunk; });
	req.on('end', function() { 
		query = querystring.parse(postBody);
		if(query.productId!==undefined)
		{
			for(p=0; p<Products.length; p++)
			{
				if(Products[p].productId == query.productId)
				{
					product = Products[p];
					product = ProductItem.setId(product);
					req.session.cart.items.push(product);
					res.send("OK");
					break;
				}
			}
		}
		else
			res.send("FAIL");
	});
};

module.exports.remove = function(req,res,next) {
	verify(req,res);

	postBody="";
	req.on('data', function(chunk){ postBody+=chunk; });
	req.on('end', function() { 
						query = querystring.parse(postBody);
						if(query.itemId!==undefined)
						{
							for(i=0; i<req.session.cart.items.length; i++)
								if(req.session.cart.items[i].itemId == query.itemId)
								{
									req.session.cart.items.splice(i,1);
									res.send("OK");
									break;
								}
						}
	});
};

module.exports.checkout = function(req,res,next) {

    if(req.session.cart == undefined || req.session.cart.items.size < 1)
	{
		res.render("error", { message : "Sorry, we couldn't find your cart. Please try again." } );
	}
	else
	{
		var setExpressCheckout = new SetExpressCheckout(req.session.cart);
		
		//A hack to figure out a virtual box host/domain name.
		setExpressCheckout.checkOutData.RETURNURL = "http://" + req.headers.host + "/order";
		setExpressCheckout.checkOutData.CANCELURL = "http://" + req.headers.host + "/cart";
		
		setExpressCheckout.on('success', function(data) {
			var getExpressCheckoutDetails = new GetExpressCheckoutDetails(data.TOKEN);
			getExpressCheckoutDetails.on('done',function(data) { console.log("GetExpressCheckoutDetails ACK: "+JSON.stringify(data,undefined,2)); });
			getExpressCheckoutDetails.post();
			
			res.redirect("https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token="+data.TOKEN);
		});
		
		setExpressCheckout.on('fail', function(data) {
			res.render("error", { message : "Sorry, we couldn't do a PayPal express checkout due to the following reason, "+ data.L_LONGMESSAGE0 } );
		});

		setExpressCheckout.on('error', function(data) {
			res.render("error", { message : "Sorry, we couldn't do a PayPal express checkout at this moment. Please try again later." } );
		});

		setExpressCheckout.post();
	}
}
