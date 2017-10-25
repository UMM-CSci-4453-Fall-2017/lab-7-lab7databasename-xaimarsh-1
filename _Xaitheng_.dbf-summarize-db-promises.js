Promise=require('bluebird');
mysql=require('mysql');
DBF=require('./_Xaitheng_.dbf-setup.js');

var getDatabases=function(){//returns promise that can take a handler ready to process the results
	var sql = "SHOW DATABASES";
	return DBF.query(mysql.format(sql)); //return promise
}

var processDBFs=function(queryResults){
	dbfs=queryResults;
	return(Promise.all(dbfs.map(dbfToPromise)).then(processTables));
}

var processTables=function(results){ //returns a promise that forces all table description promises to resolve before .then runs
	var descriptionPromises=results.map(tableAndDbfToPromise);
	var allTables=Promise.all(descriptionPromises).then(function(results){return(results)});
	return(allTables);
}

//takes an object (returned by showDatabases)
//returns a promise that resolves to an array of objects containing table names for the dbf in dbfObj
var dbfToPromise=function(dbfObj){
	var dbf = dbfObj.Database;
	var sql = mysql.format("SHOW TABLES IN ??", dbf);
	var queryPromise=DBF.query(sql);
	queryPromise=queryPromise.then(function(results){return({table:results,dbf:dbf})});
	return(queryPromise);
}

//Takes an object (as returned by showDatabases)
////returns a promise tat resolves to an array of objects containing table descriptions
////Creates helper functions: describeTable()
////which contains its own helper function printer(), for writing the output to console
var tableAndDbfToPromise=function(obj){
	var dbf=obj.dbf;
	var tableObj=obj.table;
	var key = "Tables_in_"+dbf;

	var tables=tableObj.map(function(val){return(val[key])})

	var describeTable=function(val,index){
		var table=dbf+"."+val;
		var printer=function(results){
			var desc=results;
			if(index==0){console.log("---|",dbf,">")};
			console.log(".....|"+table,">");
			desc.map(function(field){//show fields nicely
				console.log("\tFieldName: '"+field.Field+"' \t("+field.Type+")");
			})
		}

		 
		var describeSQL = mysql.format("DESCRIBE ??",table);
		var promise=DBF.query(describeSQL).then(printer);
		return(promise);
	}
	var describePromises = tables.map(describeTable);
	return(Promise.all(describePromises));
}

var dbf=getDatabases().then(processDBFs).then(DBF.releaseDBF).catch(function(err){console.log("Danger:",err)});
