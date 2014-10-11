
/*
 * GET users listing.
 */
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database:'xxxxx'
});

/*
var mysql = require('mysql');
var pool  = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	port     : '3306',
	database : 'test',
	connectionLimit : '10'
});

*/
//var MongoClient = require('mongodb').MongoClient, format = require('util').format;




exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.signup = function(req,res){
	console.log("check1");
	var params = [req.param('username'), req.param('pass'), req.param('email')];
	if(req.param('username') ==='admin' && req.param('pass') ==='admin') {
		res.redirect('admin');
		// show error message that we cannot sign up as admin. also it exists
		}
	pool.connect();
	pool.query("insert into user values (?,?,?);",params,function(err, rows, fields) {
		if (err) {
		console.log("ERROR: " + err.message);
		res.redirect('/login');
		} else {
			console.log('The rows are: ', rows);
			console.log("The fields are: " + fields);
			
			console.log('name: ', req.param('username'));
			
			req.session.username= req.param('username');
			
			console.log('name: ', req.session.username);
			res.render('index',{
			//username: rows[0].username,
			username: req.session.username,
			message: "User Successfully Created"
			}); }
	
	
	});

	pool.end();
	/*var query = require('./SQL_DB');
	var params = [req.param('username'), req.param('pass'), req.param('email')];
	if(req.param('user_id') =='admin' & req.param('pass') =='admin') {
	res.redirect('admin');	
	}
	var sqlStmt = "insert into user values (?,?,?);";
	query.execQuery(sqlStmt, params, function(err, rows) {
		if (err) {
			console.log("ERROR: " + err.message);
			res.redirect('/login');
		} else {
			console.log(" " + rows);
		res.render('/index',{
			username: rows[0].username,
			message: "User Successfully Created",
			}); }
														}); */
};
//connection.escape(userId) to avoid SQL Injection attacks

exports.authentication=function(req,res){
	
	console.log("login check");
	console.log("WASSUP: "+ req.param('username')+" "+ req.param('pass'));

	var params = [req.param('username'), req.param('pass')];
	
	if(req.param('username') ==='admin' && req.param('pass') ==='admin') {
		//res.redirect('/admin', {username: "admin"});
		res.render('admin',{username: "admin"});
		}
	else {
	pool.connect();
	
	pool.query("select * from user where username=? and pass=? limit 1;",params,function(err, rows, fields) {
		if (err) {
		console.log("ERROR: " + err.message);
		res.redirect('/login');
		} else {
			console.log('The rows are: ', rows);
			console.log("The fields are: " + fields);
			console.log('The rows are: '+ rows[0].username+' '+ rows[0].email);
			console.log('name: ', req.param('username'));
			
			req.session.username= rows[0].username;
			
			console.log('name: ', req.session.username);
			res.render('index',{
			//username: rows[0].username,
			username: req.session.username,
			message: "User Successfully Logged In"
			}); }
	
	
	});

	pool.end();
	}
};

exports.logout=function(req,res){
	req.session = null;
	res.render('index');
};


exports.view_catalog=function(req,res){
	
};
exports.add_to_catalog=function(req,res){
	
};



