var Q = require("q");

module.exports = function(nano_ins, userids, doc) {
	var deferred = Q.defer();
	userdb = nano_ins.db.use("user");
	var results = [];
	userdb.list({
		include_docs : true,
		keys : userids
	}, function(err, body) {
		if (!err) {
			var results = [];
			body.rows.forEach(function(doc) {
				var result = doc.doc;
				delete result.password;
				results.push(result);
			})
			doc.joiners = results;
			deferred.resolve(doc);
		}else{
			console.err("-----------------------------------");
			console.err("failed to retrieve user db");
			console.err(err);
			console.err("-----------------------------------");
			deferred.reject(err);
		}
	});
	return deferred.promise;
}