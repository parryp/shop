var HTTP_PORT = 3000;
var express = require('express');
var path = require('path');

/* Routes */
var controllers = require('./controllers');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.session({secret: 'undefinederotselpmaslapyap'}));
app.use(express.static(path.join(__dirname, 'static')));

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

controllers.route(app);

//404
app.use(function(req, res, next){
  res.status(404);
  
  if (req.accepts('html')) {
    res.send("<html><head><title>404 - File not found</title><link href=\"/css/main.css\" media=\"screen\" rel=\"stylesheet\" type=\"text/css\"></head><body class=\"FileNotFound\">I'm sorry, <span class=\"highlight\">"+req.url+"</span> does not exist on this server.</body></html>");
    return;
  }
  
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  res.type('txt').send('Not found');
});

app.listen(HTTP_PORT);
console.log("Listening to port "+HTTP_PORT);