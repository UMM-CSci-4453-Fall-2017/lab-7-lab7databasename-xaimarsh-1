async = require("async");
var credentials=require('./credentials.json');
var mysql=require("mysql");

credentials.host="ids";
var connection = mysql.createConnection(credentials);

var express=require('express'),
app = express(),
port = process.env.PORT || 1337;

var storedButtons=[];

var buttons=[{"buttonID":1,"left":10,"top":70,"width":100,"label":"hotdogs","invID":1},{"buttonID":2,"left":110,"top":70,"width":100,"label":"hambugers","invID":2},{"buttonID":3,"left":210,"top":70,"width":100,"label":"bannanas","invID":3},{"buttonID":4,"left":10,"top":120,"width":100,"label":"milkduds","invID":4}]; //static buttons

async.series([
	function(callback) {
		connection.connect(function(err){
			if(err){
				console.log("Problems with MySQL: "+err);
			} else {
			}
		});
		connection.query('select * from XaiMarsh.till_buttons', function(err, rows, fields){
			if(err){
				console.log("Problems using XaiMarsh: "+err);
			} else {
				storedButtons=rows;
			}
			callback();
		});
	},

	function(callback) {
		connection.end();
		callback();
	}
]);

app.use(express.static(__dirname + '/public')); //Serves the web pages
app.get("/buttons",function(req,res){ // handles the /buttons API
  res.send(storedButtons);
});

app.listen(port);
