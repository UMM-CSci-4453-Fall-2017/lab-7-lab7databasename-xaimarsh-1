var credentials = require('./credentials.json');

var mysql=require("mysql");

credentials.host="ids";

var connection = mysql.createConnection(credentials);

var data={};
var processed={};

sql = "SHOW DATABASES";
connection.query(sql,function(err,rows,fields){
	if(err){
		console.log('error looking up databases');
		connection.end();
	} else {
		processDBFs(rows);
	}
});

function processDBFs(dbfs){ //asynchronous row handler
	for(var index in dbfs){
		var dbf = dbfs[index].Database;
		var sql = 'SHOW TABLES IN '+dbf;
		data[dbf] = Number.POSITIVE_INFINITY; //exists but not set
		connection.query(sql, (function(dbf){
			return function(err,tables,fields){
				if(err){
					console.log('error finding tables in dbf '+dbf);
					connection.end();
				} else {
					processTables(tables,dbf);
				}
			};
		})(dbf));
	}
}

function processTables(tables,dbf){ //async row handler
	data[dbf] = tables.length; // key identified by the given dbf now has a value
	processed[dbf] = 0; //given dbf hasn't been used as a label
	for(var index in tables){
		var tableObj = tables[index];
		for(key in tableObj){
			var table = tableObj[key];
			table = dbf+"."+table;
			var sql = 'DESCRIBE '+table;
			connection.query(sql, (function(table,dbf){
				return function(err,desc,fields){
					if(err){
						console.log('Error desc. table '+table);
					} else {
						processDescription(desc,table,dbf);
					}
				};
			})(table,dbf));
		}
	}
}

function processDescription(desc,table,dbf){
	data[dbf]--; //one table has been processed
	if(processed[dbf] == 0){
		processed[dbf]=1;
		console.log('---|'+dbf+'>');
	}
	console.log('.....|'+dbf+'.'+table+'>');
	desc.map(function(field){
		console.log("\tFieldName: '"+field.Field+"' \t("+field.Type+")");
	});

	if(allZero(data)){connection.end()}
}

function allZero(object){
	allzero = true;
	for(obj in object){
		if(object[obj]!=0){allzero=false}
	}
	return(allzero);
}
