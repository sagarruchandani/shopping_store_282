/**
 * New node file
 */
var mysql = require('mysql');
var pool  = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	port     : '3306',
	database : 'test',
	connectionLimit : '10'
});

exports.sql_pool = pool;
