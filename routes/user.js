
/*
 * GET users listing.
 */
var mysql = require('mysql');

var pool = mysql.createConnection({
  host     : 'user.crf2mftam4cg.us-east-1.rds.amazonaws.com',
  user     : 'root',
  password : 'sagar009428731',
  port     : '3306',
  database : 'shopping_store',
  connectionLimit : '10'
});

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
AWS.config.update({accessKeyId: 'AKIAJ5WDAWMKMV5KBGOQ', secretAccessKey: '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'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var categories="";
var product="";



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
           callback(err);
        } else {
        	callback(data);
        }
	});
}

function get_all_categories(callback) {
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
           callback(err);
        } else {
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
		      callback(err); 
		    }
		    else {
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
		      callback(err); 
		    } 
		    else {
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
				callback(err);
			}
			else {
				callback(data);
			}
		});
}

////////////////////////////////////////

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.index = function(req, res){
	get_all_categories(function(cat){ req.session.category=cat;
		get_all_products(function(prod){  req.session.products=prod;
			res.render('index',{message:'Shopping store',category:req.session.category, products: req.session.products,user_check: req.session.username});
		});
	});
};

exports.signup = function(req,res){
	var params = [req.param('email'), req.param('f_name'), req.param('l_name'), req.param('pass')];
	if(req.param('email') ==='admin' && req.param('pass') ==='admin') {
		res.redirect('login',{message: 'Cannot sign up as Admin. Use any other username'});
		}
	
	pool.query("insert into user values (?,?,?,?);",params,function(err, rows, fields) {
		if (err) {
			res.render('login',{message: 'Sorry, user already exists. please try different email id.'});
		} else {
			req.session.username= req.param('f_name');
			req.session.email=req.param('email');
			req.session.cart_counter=0;
			
			get_all_categories(function(cat){ categories=cat;
			get_all_products(function(prod){ product=prod;
				res.render('index',{message:'User Successfully Created',category:categories, products:product, user_check: req.session.username});
			});
		});
		}
	});
};
//connection.escape(userId) to avoid SQL Injection attacks

exports.authentication=function(req,res,next){
	
	var all_data=[];
	var params = [req.param('email'), req.param('pass')];
	if(req.param('email') ==='admin' && req.param('pass') ==='admin') {
		var categories="";
		var product="";
		res.render('admin',{message:'admin',category:req.session.category, products: req.session.products});
	}
	else {
		pool.query("select * from user where email=? and pass=? limit 1;",params,function(err, rows, fields) {
		if (err) {
		res.render('login',{message: 'Sorry. could not find this user. please check email and password.'});
		} else {
			if( (req.param('email') !==rows[0].email) || (req.param('pass') !==rows[0].pass)){
				res.render('login',{message: 'Username or password appears to be incorrect. please check username and password.'});
			}
			req.session.username= rows[0].f_name;
			req.session.email= rows[0].email;
			req.session.cart_counter=0;
			res.render('index',{message:'User Successfully Logged In',category:req.session.category, products:req.session.products, user_check:req.session.username});
		}
	});
	}
};

exports.remove_cat = function(req,res) {
	var cat_name = req.params.cat_name;
	var categories="";
	var product="";
	remove_category(cat_name, function(useless_data){ console.log(useless_data);
		get_all_categories(function(cat){ req.session.category=cat;
			get_all_products(function(prod){ req.session.products=prod;
				res.render('admin',{message:'removed the category',category:req.session.category, products:req.session.products});
			});
		});
	});
};

exports.remove_prod = function(req,res) {
	var prod_id= req.params.prod_id;
	var categories="";
	var product="";
	remove_product(prod_id, function(useless_data){ console.log(useless_data);
		get_all_categories(function(cat){ req.session.category=cat;
			get_all_products(function(prod){ req.session.products=prod;
				res.render('admin',{message:'removed the product.',category:req.session.category, products:req.session.products});
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
		get_all_categories(function(cat){ req.session.category=cat;
			get_all_products(function(prod){ req.session.products=prod;
				res.render('admin',{message:'added new category.',category:req.session.category, products:req.session.products});
			});
		});
	});
};

exports.add_product= function(req,res) {
		var params = {
  		    TableName : 'catalog',
  		    Item : { 
		      "id": {"S" : (Number(new Date())).toString()},
		      "category": { "S" : req.param('drop_down_category') },
		      "details":{"S" : req.param('details')},
		      "image": { "S" : req.param('image') },
		      "price": { "S" : req.param('price') },
		      "product": { "S" : req.param('new_product') },
		      "quantity":{"S" : req.param('quantity')},
  		    	   }
      		}
	dynamodb.putItem(params, function(err, data) {
	    if (err) {
	      res.render('admin',{message:'Oops! Something went wrong. Please try again with proper values.',category:req.session.category, products:req.session.products});
	    }
	    else {
	      var categories="";
	  	  var product="";
	  	get_all_categories(function(cat){ req.session.category=cat;
	  		get_all_products(function(prod){ req.session.products=prod;
	  			res.render('admin',{message:'added new product',category:req.session.category, products:req.session.products});
	  		});
	  	});
	    }
	  });
};

exports.logout=function(req,res){
	req.session.username = null;
	req.session.email= null;
	get_all_categories(function(cat){ req.session.category=cat;
		get_all_products(function(prod){ req.session.products=prod;
			res.render('index',{message:'User logged out. ',category:req.session.category, products:req.session.products});
		});
	});
};

exports.prod_details=function(req,res){
	var prod_id = req.params.prod_id;
	var categories="";
	var product="";
	var params = {
		    TableName : 'catalog',
		    Key : { 
		      "id" : { "S" : prod_id},
		    	}
		};
		
	dynamodb.getItem(params, function(err, data) {
		if (err) {
			res.render('index',{message:'Oops! Something went wrong. Please try again with proper values.'});
			} 
		    else {
		    res.render('product-details',{message:'product details',category:req.session.category, test_product:data, user_check:req.session.username});
		      	}
		  });
};

exports.add_to_cart=function(req,res){
	if(!req.session.username){
		res.render('index',{message:'Login or Sign up to add products to the cart!',category:req.session.category, products:req.session.products});
	} else {
		var email=req.session.email;
		var prod_id=req.params.prod_id;
		var quantity=req.param('quantity');
		var params = {
				TableName : 'catalog',
			    Key : { 
			      "id" : { "S" : prod_id},
			    	}
			};
			
		dynamodb.getItem(params, function(err, data) {
			if (err) {
				res.render('index',{message:'Oops! Something went wrong. Please try again with proper values.'});
				} 
			    else {
			    	var new_data = data["Item"];
			    	params0=[req.session.email,new_data["id"]["S"],"In Cart"];
			    	console.log(params0);
			    	var check=0; // to check if item is already in cart or not.
			    	pool.query("select * from user_session where username=? and prod_id=? and transaction_status=? limit 1;",params0,function(err,rows,fields){
			    		check=JSON.stringify(rows[0]);
			    if(check==undefined) //means item doesnt exist in cart. please insert it
			    {
			    	var prod_id=new_data["id"]["S"];
			    	params=[new Date(),req.session.email,new_data["id"]["S"],new_data["product"]["S"],new_data["image"]["S"],new_data["price"]["S"],req.param('quantity'),"In Cart"];
			    	pool.query("insert into user_session values (?,?,?,?,?,?,?,?);",params,function(err, rows, fields) {
			    		if (err) {
			    		res.render('index',{message:'Sorry. Some technical error. Please try again with different quantity.',category:req.session.category, products:req.session.products, user_check:req.session.username});
			    		} else {
			    			req.session.cart_counter =req.session.cart_counter+1; 
			    			get_all_categories(function(cat){ categories=cat;
			    			get_all_products(function(prod){ product=prod;
			    				res.render('index',{message:'Added product to cart.',category:req.session.category, products:req.session.products, user_check:req.session.username});
			    			});
			    		});
			    		}
			    	});
			    } else // item exists. just update the quantity
			    {
			    	var existing_quant = parseInt(rows[0].quantity);
			    	var new_quantity= existing_quant + parseInt(quantity);
			    	params=[new_quantity,req.session.email,new_data["id"]["S"],"In Cart"];
			    	
			    	pool.query("update user_session set quantity=? where username=? and prod_id=? and transaction_status=?;",params,function(err, rows, fields) {
			    		if (err) {
			    		res.render('index',{message:'Sorry. Some problem in adding product to cart. please try with less quantity.',category:req.session.category, products:req.session.products, user_check:req.session.username});
			    		} else {
			    		get_all_categories(function(cat){ categories=cat;
			    			get_all_products(function(prod){ product=prod;
			    				res.render('index',{message:'Quantity updated in cart.',category:req.session.category, products:req.session.products, user_check:req.session.username});
			    			});
			    		});
			    		}
			    	});
			    }
			    	});	
	}
});
	} }

exports.view_cart=function(req,res){

	if(!req.session.username){
		res.render('index',{message:'Login or Sign up to view cart!',category:req.session.category, products:req.session.products});
	} else {
		var email=req.session.email;
		params=[email,"In Cart"];
		
		pool.query("select * from user_session where username=? and transaction_status=?;",params,function(err,rows,fields){
		if(err){
			res.render('index',{message:'Sorry, the cart could not be accessed. please try again',category:req.session.category, products:req.session.products, user_check:req.session.username});
			}
		res.render('cart',{message:'Your Cart.',current_cart:rows, category:req.session.category, products:req.session.products, user_check:req.session.username});
		});	    	
	}
};

exports.remove_from_cart=function(req,res){
	var email=req.session.email;
	var prod_id=req.params.prod_id;
	params=[email,prod_id,"In Cart"];
	var params0=[email,"In Cart"];
	pool.query("delete from user_session where username=? and prod_id=? and transaction_status=?;",params,function(err1,rows1,fields1){
		if(err1){
			pool.query("select * from user_session where username=? and transaction_status=?;",params0,function(err,rows,fields){
			res.render('cart',{message:'Sorry. Something went wrong. please try again.',current_cart:rows, category:req.session.category, products:req.session.products, user_check:req.session.username});
				});
			}
		pool.query("select * from user_session where username=? and transaction_status=?;",params0,function(err,rows,fields){
		res.render('cart',{message:'Removed product from cart.',current_cart:rows, category:req.session.category, products:req.session.products, user_check:req.session.username});
			});
		});	   
	
};

exports.get_category_products=function(req,res){
	var cat_name=req.params.cat_name;
	var params = {
				 "TableName" : 'catalog',
			    "Limit"     : 10,
			    "Select": 'ALL_ATTRIBUTES',
			    "ScanFilter": {
			        "category": { ComparisonOperator: 'EQ', AttributeValueList: [{'S':cat_name}]},
			    }
			  }
		
		dynamodb.scan(params, function(err, data) {
	        if (err) {
	            res.render('index',{message:'Sorry, Something went wrong. please try again',category:req.session.category, products:req.session.products, user_check:req.session.username});
			} else {
	        	res.render('index',{message:'Category specific products',category:req.session.category, products:data, user_check:req.session.username});
	 		}
		});
	}

exports.your_history=function(req,res){
	params=[req.session.email,"In Cart"];
	pool.query("select prod_id,quantity from user_session where username=? and transaction_status=?;",params,function(err, rows, fields) {
		for(var x in  rows){
			var params = {
					TableName : 'catalog',
				    Key : { 
				      "id" : { "S" : rows[x].prod_id},
				    	}
				};
			dynamodb.getItem(params, function(err1, data1) {
				if (err1) {
					res.render('index',{message:'Oops! Something went wrong. Please try again with proper values.',category:req.session.category, products:data, user_check:req.session.username});
					} 
				    else {
				    	var new_data = data1["Item"];
				    	var subtract = (Number(data1["Item"].quantity.S)-Number(rows[x].quantity)).toString();
				    	var params = {
				      		    TableName : 'catalog',
				      		    Key : { 
				    		      "id" : { "S" : rows[x].prod_id},
				    		    	}
				          		}
				    	dynamodb.deleteItem(params, function(err2, data2) {
				    		    if (err2) {
				    		    	res.render('index',{message:'Oops! Something went wrong. Please try again with proper values.',category:req.session.category, products:data, user_check:req.session.username});
								} 
				    		    else {
				    		    	var params = {
				    		      		    TableName : 'catalog',
				    		      		    Item : { 
				    		    		      "id": {"S" : rows[x].prod_id},
				    		    		      "category": { "S" : data1["Item"].category.S },
				    		    		      "details":{"S" : data1["Item"].details.S},
				    		    		      "image": { "S" : data1["Item"].image.S },
				    		    		      "price": { "S" : data1["Item"].price.S },
				    		    		      "product": { "S" : data1["Item"].product.S },
				    		    		      "quantity":{"S" : subtract},
				    		      		    	   }
				    		          		}
				    		    	dynamodb.putItem(params, function(err3, data3) {
				    		    	    if (err3) {
				    		    	     res.render('cart',{message:'Oops! Something went wrong. Please try again with proper values.',category:req.session.category, products:data, user_check:req.session.username});
				    		    	    }
				    		    	    else {
				    		    	      params0=[req.session.email,"In Cart"];
											pool.query("update user_session set transaction_status='COMPLETED' where username=? and transaction_status=?;",params0,function(err0, rows0, fields0) {
												if (err0) console.log(err0); // an error occurred
												  else {
													  params1=[req.session.email,"COMPLETED"];
														pool.query("select * from user_session where username=? and transaction_status=?",params1,function(err2, rows2, fields2) {
															if (err2) console.log(err2); // an error occurred
															  else {
																  res.render('your_history',{message:'Your full cart.',my_cart:rows2,category:req.session.category, products:req.session.products, user_check:req.session.username});
															  }
															});
												  		}
												});
				    		     }
				    	});
				    }
				   });
		}
});
}
});
}
//
exports.my_account=function(req,res){
	if(!req.session.email){
		res.render('index',{message:'Please Login to view your account',category:req.session.category, products:req.session.products});
	  }
	params1=[req.session.email,"COMPLETED"];
	pool.query("select * from user_session where username=? and transaction_status=?",params1,function(err2, rows2, fields2) {
		if (err2) console.log(err2); // an error occurred
		  else {
			  res.render('your_history',{message:'Your Account',my_cart:rows2,category:req.session.category, products:req.session.products, user_check:req.session.username});
		  }
		});
};
