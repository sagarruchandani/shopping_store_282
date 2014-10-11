
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path')
  , application_root = __dirname
  , AWS = require('aws-sdk');

var app = express();
AWS.config.region = 'us-east-1'; //N.Virginia // OREGON>> us-west-2
// all environments

app.configure(function () {
//	app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
//	app.use(express.cookieParser());																						//Parses the Cookie header field and populates req.cookies 
	app.use(express.cookieParser("thissecretrocks"));
	//app.use(express.cookieSession({ secret: 'xDDFsdfddsdfSDdbg', cookie: { maxAge: null }}));									//To maintain cookie-based sessions and populates req.session
	app.use(express.session({secret: '1234567890QWERTY'}));
	
	app.use(app.router);
	app.use(express.static(path.join(application_root, "public")));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));/*
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'xDDFsdfddsdfSDdbg', cookie: { maxAge: null }}));
app.use(express.session({
	cookie: {
		path    : '/',
		httpOnly: false,
		maxAge  : 24*60*60*1000
		},
		secret: '1234567890QWERT'
	}));
app.use(express.static(path.join(__dirname, 'public')));
*/
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', user.index);
app.get('/users', user.list);


app.get('/login', function(req, res){
	console.log("in server.js: "+req.session.category);
	res.render("login.ejs",{category:req.session.category, products: req.session.products});
});
app.get('/cart', function(req, res){
	res.render("cart.ejs");
});
app.get('/checkout', function(req, res){
	res.render("checkout.ejs");
});


app.post('/authenticate', user.authentication );
app.post('/sign_up', user.signup );
app.get('/logout', user.logout);


//ADMIN SIDE
app.get('/admin', function(req, res){
	res.render("admin.ejs");
});
app.post('/add_category', user.add_categ);
app.post('/add_product', user.add_product);
app.get('/remove_category/:cat_name', user.remove_cat);
app.get('/remove_product/:prod_id', user.remove_prod);
app.get('/product_details/:prod_id', user.prod_details);
app.post('/add_to_cart/:prod_id', user.add_to_cart);
app.get('/get_cart',user.view_cart);
app.get('/remove_from_cart/:prod_id',user.remove_from_cart);
app.get('/get_category_products/:cat_name', user.get_category_products);
app.get('/your_history',user.your_history);
app.get('/my_account',user.my_account);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
