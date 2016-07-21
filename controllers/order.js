var querystring=require("querystring");
var url=require('url');
var DoExpressCheckout=require("../DoExpressCheckout");
var Order=require("../Order");
var ShoppingCart=require("../ShoppingCart");

function hasTokenAndPayerId(query)
{
	return (query !== undefined && query.token !== undefined && query.PayerID !== undefined);
}

module.exports = function(req, res, next){
	url_parts = url.parse(req.url, true);
	query = url_parts.query;

	if(req.session.cart === undefined)
	{
		res.render('error', {message : "Sorry, we seem to have lost your cart. Please shop again"});
	}
	else if(hasTokenAndPayerId(query))
	{
		//console.log('query.PayerID='+query.PayerID);
		dataObj = { title : 'Order confirmation', paypal : {token:query.token, PayerID:query.PayerID} }
		dataObj.shoppingcart = req.session.cart;
		dataObj.cartsize = ShoppingCart.size(req);
		dataObj.total = ShoppingCart.amount(req.session.cart);
		res.render('order', dataObj);
	}
	else
		res.redirect('/cart');
};

module.exports.confirm = function(req,res,next) {
	url_parts = url.parse(req.url, true);
	postBody = "";
	query = url_parts.query;	
	token = query.token;
	cart = req.session.cart;
	
    if(cart === undefined || cart.items.length < 1 )
		res.redirect('/cart');
		
	req.on('data', function(chunk) {
		postBody+=chunk;
	});
	
	req.on('end', function(){
		formData = querystring.parse(postBody);
		if(formData.token == undefined || formData.PayerID == undefined)
			res.render("error", {message : "I'm sorry, we seem to have lost your PayPal token and Payer id. Please try again later"});
		else
		{
			doExpressCheckout = new DoExpressCheckout(cart,formData.token,formData.PayerID);
			doExpressCheckout.post();
			doExpressCheckout.on('success', function(data,cart) {
				confirmedOrder = new Order();
				confirmedOrder.items = cart.items;
				confirmedOrder.loadAddress(formData);
				
				if(data.PAYMENTINFO_0_ACK !== undefined && data.PAYMENTINFO_0_ACK.toLocaleLowerCase() == "success")
					confirmedOrder.status = "Paid";
				else
					confirmedOrder.status = data.PAYMENTINFO_0_ACK;
					
				console.log("DoExpressCheckout ack:" + JSON.stringify(data,undefined,2));

				//Assign a new cart
				req.session.cart = new ShoppingCart();
				
				res.render('order_confirmed', { title:"Order confirmed",
				                                order: confirmedOrder,
												total: data.PAYMENTREQUEST_0_AMT
											  });
			});

			doExpressCheckout.on('fail', function(data,cart) {
				console.log("DoExpressCheckout [failure] ack:" + JSON.stringify(data,undefined,2));
				
				res.render('error', { title:"Failed to check out", 
									  message: "I'm sorry, we could not do a PayPal express checkout, reason being, "+
											   ((data.L_LONGMESSAGE0 !== undefined) ? data.L_LONGMESSAGE0 : "unknown.") });
			});
		}
	});
};
