/**
 * New node file
 */
var MongoClient = require('mongodb').MongoClient, format = require('util').format;



exports.add_category = function(req, res){

	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) {throw err;}

		var collection = db.collection('catalog');
		collection.insert({'catalog':req.param('new_category')}, function(err, docs) {
			console.log("TESTING1: "+docs); //console.dir(results);
			db.close();
		});
	});
	
	
	res.render('admin', { title: 'Added new category' });
};

exports.remove_category = function(req, res){
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err) {throw err;}

		var collection = db.collection('catalog');
		collection.remove({'catalog':req.param('remove_category')}, function(err, docs) {
			console.log("TESTING2: "+docs); //console.dir(results);
			db.close();
		});
	});
	
	
	res.render('admin', { title: 'Removed a category' });
	
	
};

exports.add_product = function(req, res){};
exports.remove_product = function(req, res){};