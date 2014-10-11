
/*
 * GET home page.
 */
var MongoClient = require('mongodb').MongoClient, format = require('util').format;

exports.index = function(req, res){

	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) {throw err;}

		var collection = db.collection('catalog');
		collection.find({},{'category': true}).toArray(function(err, results) {
			console.log(results); //console.dir(results);
			db.close();
			});
	
		
		db.collection("test").find({},[{'name':true,'last':false}]).toArray(function(err, results) {
		    console.dir(results);
		});
	
	});
	
	
	res.render('index', { title: 'Express' });
};