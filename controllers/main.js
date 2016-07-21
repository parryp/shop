var products = require('../data/Products.json');
var ShoppingCart = require('../ShoppingCart');

module.exports=function(req,res) {
	dataObj=new Object();
	dataObj.title="Achmed Shop of Wonders";
	dataObj.cartsize = ShoppingCart.size(req)

	if(req.session.userId)
		dataObj.user = {name : req.session.userId };
	
	dataObj.products = products;
	
	res.render('index', dataObj); 
};