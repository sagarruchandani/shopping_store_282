
/*
 * GET users listing.
 */
var mysql = require('mysql');

var pool = mysql.createConnection({
  host     : 'user.crf2mftam4cg.us-east-1.rds.amazonaws.com',
  user     : 'root',
  password : 'sagar009428731',
  port     : '3306',
  database : 'shopping_store'
});

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
AWS.config.update({accessKeyId: 'AKIAJZUHAAYNHF4XIJ3Q', secretAccessKey: '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'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


function get_all_products(callback) {
	
	var params = {
			
		    "TableName" : 'catalog',
		    "Limit"     : 10,
		    "Select": 'ALL_ATTRIBUTES',
		    "ScanFilter": {
		        "category": {
		          ComparisonOperator: 'NOT_NULL'}},
		  }
	
	dynamodb.scan(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(err);
        } else {
        	callback(data);
	
        }
	});
	
}



function get_all_categories(callback) {
	
	
	console.log("CP1");
	var category_param = {
			
		    "TableName" : 'categories',
		    "Limit"     : 25,
		    "Select": 'ALL_ATTRIBUTES',
		    "ScanFilter": {
		        "category": {
		          ComparisonOperator: 'NOT_NULL'}},
		  }
	dynamodb.scan(category_param, function(err, categories) {
        if (err) {
            console.log(err, err.stack); // an error occurred
           callback(err);
        } else {
        	console.log("CP2");
        	callback(categories);
        }
	});
}

function remove_category(cat_name,callback) {
	
	var params = {
  		    TableName : 'categories',
  		    Key : { 
		      "category" : { "S" : cat_name},
		    	}
      		}
	dynamodb.deleteItem(params, function(err, data) {
		    if (err) {
		      console.log(err); // an error occurred
		      callback(err); 
		    } 
		    else {
		    	//call the function to remove all products related to a category
		    	console.log(data);
		    	callback(data);
		    }
	});
}

function remove_product(p_id,callback) {
	
	var params = {
  		    TableName : 'catalog',
  		    Key : { 
		      "id" : { "S" : p_id},
		    	}
      		};
	dynamodb.deleteItem(params, function(err, data) {
		    if (err) {
		      console.log(err); // an error occurred
		      callback(err); 
		    } 
		    else {
		    	//call the function to remove all products related to a category
		    	console.log(data);
		    	callback(data);
		    }
	});
}

function add_category(new_category,callback) {
	
	var params = {
			TableName : 'categories',
			Item : {
				"category": { "S" : new_category },
				}
		};
	dynamodb.putItem(params, function(err, data) {
			if (err) {
				console.log(err); // an error occurred
				callback(err);
			}
			else {
				console.log(data); // successful response
				callback(data);
			}
		});
}

////////////////////////////////////////




////////////////////////////////////////


exports.list = function(req, res){
  res.send("respond with a resource");
};
exports.index = function(req, res){
	var categories="";
	var product="";
	get_all_categories(function(cat){ categories=cat;
		get_all_products(function(prod){ product=prod;
			res.render('index',{message:'Shopping store',category:categories, products:product});
		});
	});
	
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
	
};
//connection.escape(userId) to avoid SQL Injection attacks


exports.authentication=function(req,res,next){
	
	console.log("login check");
	console.log("WASSUP: "+ req.param('username')+" "+ req.param('pass'));
	var all_data=[];
	var params = [req.param('username'), req.param('pass')];
	res.setHeader('Access-Control-Allow-Origin','*');
	
	if(req.param('username') ==='admin' && req.param('pass') ==='admin') {
		var categories="";
		var product="";
		get_all_categories(function(cat){ categories=cat;
			get_all_products(function(prod){ product=prod;
				res.render('admin',{message:'admin',category:categories, products:product});
			});
		});
		
		
		
	}
	else {
	pool.connect();
	
	pool.query("select * from user where username=? and pass=? limit 1;",params,function(err, rows, fields) {
		if (err) {
		console.log("ERROR: " + err.message);
		res.redirect('/login');
		} else {
			// should call get_all_categories and get_all_products to display on index page.
			console.log('The rows are: ', rows);
			console.log("The fields are: " + fields);
			console.log('The rows are: '+ rows[0].username+' '+ rows[0].email);
			console.log('name: ', req.param('username'));
			
			/*
			var dynamodb = new AWS.DynamoDB();
			var params = {
					/*AttributesToGet: [
								      "category" //if AttributesToGet is not specified then everything is returned.
								    ],*/
			/*	    TableName : 'catalog',
				    Key : { 
				      "id" : { "S" : "2"},
				    	}
				};
				
			dynamodb.getItem(params, function(err, data) {
				if (err) {
					console.log(err); // an error occurred
					} 
				    else {
				      console.log(data); // successful response
				      res.send(data);
				      }
				    
				  });
			*/
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

exports.remove_cat = function(req,res) {
	//call remove_category, then call get_all_categories and get_all_products and render it to admin page
	//var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	console.log("THE protocol IS: "+req.protocol);
	console.log("THE host IS: "+req.get('host'));
	console.log("THE original url IS: "+req.originalUrl);
	var URL=req.originalUrl;
	var cat_name = URL.replace("/remove_category/", "");
	//var cat_name = req.session.cat_name; // check if id works
	console.log("THE ID IS: "+cat_name);
	var categories="";
	var product="";
	remove_category(cat_name, function(useless_data){ console.log(useless_data);
		get_all_categories(function(cat){ categories=cat;
			get_all_products(function(prod){ product=prod;
				res.render('admin',{message:'admin',category:categories, products:product});
			});
		});
	});
};


exports.remove_prod = function(req,res) {
	//call remove_category, then call get_all_categories and get_all_products and render it to admin page
	//var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	console.log("THE protocol IS: "+req.protocol);
	console.log("THE host IS: "+req.get('host'));
	console.log("THE original url IS: "+req.originalUrl);
	var URL=req.originalUrl;
	var prod_id = URL.replace("/remove_product/", "");
	//var cat_name = req.session.cat_name; // check if id works
	console.log("THE ID IS: "+prod_id);
	var categories="";
	var product="";
	remove_product(prod_id, function(useless_data){ console.log(useless_data);
		get_all_categories(function(cat){ categories=cat;
			get_all_products(function(prod){ product=prod;
				res.render('admin',{message:'admin',category:categories, products:product});
			});
		});
	});
};

exports.add_categ = function(req,res) {
	var new_cat=req.param('new_category');
	console.log(new_cat+" "+req.param('new_category'));
	var categories="";
	var product="";
	add_category(new_cat,function(categ_data){console.log(categ_data);
		get_all_categories(function(cat){ categories=cat;
			get_all_products(function(prod){ product=prod;
				res.render('admin',{message:'admin',category:categories, products:product});
			});
		});
	});
};

exports.add_product= function(req,res) {
	var params = {
  		    TableName : 'catalog',
  		    Item : { 
  		      "product": { "S" : req.param.new_product },
  		      "category": { "S" : req.param.drop_down_category },
  		      "price": { "S" : req.param.price },
  		      //"image": { "S" : req.param.image },
  		      "id": {"S" : new Date()},
  		    	   }
      		}
	dynamodb.putItem(params, function(err, data) {
	    if (err) {
	      console.log(err); // an error occurred
	      res.render('admin',{message:'Oops! Something went wrong. Please try again with proper values.'});
	    } 
	    else {
	      console.log(data); // successful response
	      var categories="";
	  	  var product="";
	      get_all_categories(function(cat){ categories=cat;
			get_all_products(function(prod){ product=prod;
				res.render('admin',{message:'admin',category:categories, products:product});
			});
	      });
	    }
	    
	  });	
	
};

exports.logout=function(req,res){
	req.session = null;
	res.render('index');
};

exports.prod_details=function(req,res){
	console.log("THE protocol IS: "+req.protocol);
	console.log("THE host IS: "+req.get('host'));
	console.log("THE original url IS: "+req.originalUrl);
	var URL=req.originalUrl;
	var prod_id = URL.replace("/product_details/", "");
	//var cat_name = req.session.cat_name; // check if id works
	console.log("THE ID IS: "+prod_id);
	var categories="";
	var product="";
	var params = {
			/*AttributesToGet: [
						      "category" //if AttributesToGet is not specified then everything is returned.
						    ],*/
		    TableName : 'catalog',
		    Key : { 
		      "id" : { "S" : prod_id},
		    	}
		};
		
	dynamodb.getItem(params, function(err, data) {
		if (err) {
			console.log(err); // an error occurred
			res.render('index',{message:'Oops! Something went wrong. Please try again with proper values.'});
			} 
		    else {
		      console.log(data); // successful response
		      var obj2=[];
		      for (var i in data) {
			  		var obj1=data[i];
	  				for (var j in obj1){
		  				var obj11= obj1[j];
		  				for (var k in obj11){
		  				obj2[j]=obj11[k];
		  				// id, image, category, price, product, details
		  				}
	  				}
				}
		      var obj3="";
		    console.log("OBJ2 "+obj2);
		    for(var temp in obj2) {
		    	console.log(" TEMP VAR: "+temp+" WASSUP: "+ obj2[temp]);
		    	var i=0;
		    	obj3[i]=obj2[temp];
		    	i++;
		    }
		    
		    console.log("OBJ3 "+obj3+" its element:"+ obj3[1]);
		    
		      get_all_categories(function(cat){ categories=cat;
					res.render('product-details',{message:'product details',category:categories, product:obj3, test_product:data});
		      		});
		    	}
		    
		  });
	
	
};

exports.add_to_cart=function(req,res){
	
	
};


exports.view_catalog=function(req,res){
	
};
exports.add_to_catalog=function(req,res){
	
};




