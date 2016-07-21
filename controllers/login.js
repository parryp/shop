var querystring=require("querystring");

module.exports = function(req, res){
  var postBody = '';
  req.on('data', function(data) { postBody+=data; } );
  req.on('end', function() {
	post = querystring.parse(postBody);
	
    if (post.userId === 'shopper' && post.password === 'shopper') {
	  console.log(req+", post.userId="+post.userId);
      req.session.userId = 'Lenny';
      res.redirect('/');
    } else {
      res.render('login', { message : "Invalid login" } );
    }
  });
};

module.exports.form = function(req,res) {
  res.render('login');
};

module.exports.logout = function (req, res, next) {
  delete req.session.userId;
  next();
};