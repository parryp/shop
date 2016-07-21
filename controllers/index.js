var main = require('./main');
var login = require('./login');
var order = require('./order');
var cart = require('./cart');

function simpleAuth(req,res,next)
{
	if(req.session !== undefined && req.session.userId !== undefined && req.session.userId.length > 0)
		next();
	else
		res.redirect("/login");
}

module.exports.route = function(app) {
    //app.get('/', simpleAuth, main);
	app.get('/', main);
	app.get('/login', login.form);
	app.post('/login', login);
	app.get('/logout', login.logout, login.form);
	app.get('/cart', cart);
	app.post('/cart/add', cart.add);
	app.post('/cart/remove', cart.remove);
	app.get('/cart/checkout', cart.checkout);
	app.get('/order', order);
	app.post('/order/confirm', order.confirm);
}