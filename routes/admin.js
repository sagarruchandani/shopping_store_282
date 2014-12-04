/**
 * New node file
 */
//var MongoClient = require('mongodb').MongoClient, format = require('util').format;

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
AWS.config.update({accessKeyId: 'AWS_ACCESS_KEY', secretAccessKey: 'AWS_SECRET_ACCESS_KEY'});


exports.add_category = function(req, res){

	var new_cate = req.param('new_category');
	var dynamodb = new AWS.DynamoDB();
	console.log("1 "+new_cate);
	var params = {
  		    TableName : 'categories',
  		    Item : { 
  		      "category": { "S" : new_cate },
  		    	   }
      		}
	dynamodb.putItem(params, function(err, data) {
		    if (err) {
		      console.log(err); // an error occurred
		    res.render('admin', { message: 'Sorry, some error occured. May be category already exists.' });
		      } 
		    else {
		      console.log(data); // successful response
		      res.redirect('/admin', { message: 'Added new category '+new_cate });
		      //res.send(data);
		      }
		    
		  });
	
	/*
	 
	 var check_if_exists = {
		    "TableName" : 'categories',
		    "Limit"     : 1,
		    "ScanFilter":{
	            "category"  :{"AttributeValueList":[{"S":new_cate}],"ComparisonOperator":"EQ"}
	        },
	};
	console.log("2 "+new_cate);
	
	
	dynamodb.scan(check_if_exists, function(err, data) {
	    if (err) {
	      console.log("SAG "+err);
	      res.render('admin', { message: 'Sorry, some error occured. Please Try Again.' });
	    } else {
	    	console.log("SAG : " + data.count);
	    	if (!data.count)
	    	{
	    		console.log("CP 5");
	    		var params = {
	    	  		    TableName : 'catalog',
	    	  		    Item : { 
	    	  		      "id" : {"S" : String(new Date()) },
	    	  		      "category": { "S" : new_cate },
	    	  		    	   }
	    	      		}
	    		dynamodb.putItem(params, function(err, data) {
		  		    if (err) {
		  		      console.log(err); // an error occurred
		  		    res.render('admin', { message: 'Sorry, some error occured. Please Try Again.' });
		  		      } 
		  		    else {
		  		      console.log(data); // successful response
		  		      res.render('admin', { message: 'Added new category '+new_cate });
		  		      //res.send(data);
		  		      }
		  		    
		  		  });
	 
	    	} else {
	    		res.render('admin', { message: 'Category '+new_cate+' already exists.' });		
	    	}
	    }
	});
	*/
	res.render('admin', { title: 'Added new category' });
};

exports.remove_category = function(req, res){
	
	var remove_cate = req.param('remove_category');
	var dynamodb = new AWS.DynamoDB();
	var params = {
  		    TableName : 'categories',
  		    Key : { 
		      "category" : remove_cate,
		    	}
      		}
	dynamodb.deleteItem(params, function(err, data) {
		    if (err) {
		      console.log(err); // an error occurred
		    res.render('admin', { message: 'Sorry, some error occured. May be category does not exist.' });
		      } 
		    else {
		    	//remove related products first. For this, first get primary key of products to be deleted.
		    	
		    	
		    	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
				
				var params = {
						
					    "TableName" : 'catalog',
					    "Limit"     : 10,
					    "Select": 'ALL_ATTRIBUTES',
					    "ScanFilter": {
					        "category": {
					          ComparisonOperator: 'NOT_NULL'}},
					  }
				var products="";
				dynamodb.scan(params, function(err, data) {
			        if (err) {
			            console.log(err, err.stack); // an error occurred
			            res.render('admin', {
			    		    message: 'admin',
			    		    products: err,
			    				});
			        } else {
			        	var categories="";
			        	console.log("CP1");
			        	products= data;
			        	var category_param = {
								
							    "TableName" : 'categories',
							    "Limit"     : 25,
							    "Select": 'ALL_ATTRIBUTES',
							    "ScanFilter": {
							        "category": {
							          ComparisonOperator: 'NOT_NULL'}},
			        	}
						dynamodb.scan(category_param, function(err, data2) {
					        if (err) {
					            console.log(err, err.stack); // an error occurred
					            res.render('admin', {
					    		    message: 'Oops! something went wrong. Please try again.'
					    				});
					        } else {
					        	console.log("CP2");
					        	
					        	categories = data2;
					        	
					        	console.log("CP3 "+categories);
					        	res.render('admin', {
					    		    message: 'admin',
					    		    
					    		    category: categories,
					    		    products: products,
					    				});
					        	
					        }
						});
			        	
			        	
			        	
			        }
				});
		    	
		    	
		    	
		    	
		    	
		    	
		      console.log(data); // successful response
		      res.redirect('/admin', { message: 'Removed category '+remove_cate+' and all related products.' });
		      //res.send(data);
		      }
		    
		  });
	
};

exports.add_product = function(req, res){};
exports.remove_product = function(req, res){};
