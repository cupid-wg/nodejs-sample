/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var exsession = require('express-session');
var cookieParser = require('cookie-parser');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var info_before_request = require('./middleware/infoBeforeRequest');
var get_id_detail = require('./middleware/get-id-detail');
var auth = require('./middleware/auth');
var Q = require("q");
var exsession = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mail_func = require('./middleware/mail');

// create a new express server
var app = express();

app.use(cookieParser());
app.use(exsession({
		secret : 'xxxxxxx',
		name : 'testapp', // the cookie name, default is "connect.sid"
		cookie : {
			maxAge : 8000000
		}, // set maxAge in ms，which means the session and cookie will expire in 80s
		resave : false,
		saveUninitialized : true,
	}));

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
var cloudant = {
	"username" : "xxx",
	"password" : "xxx",
	"host" : "xxx",
	"port" : 443,
	url : "xxx",
};

var activity_url = "activity.mybluemix.net";
if (process.env.hasOwnProperty("VCAP_SERVICES")
	 && JSON.parse(process.env.VCAP_SERVICES)['cloudantNoSQLDB']) {
	// Running on Bluemix. Parse out the port and host that we've been assigned.
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var host = process.env.VCAP_APP_HOST;
	var port = process.env.VCAP_APP_PORT; // Also parse out Cloudant settings.
	console.log("debug -- env ---" + writeObj(env));
	cloudant = env['cloudantNoSQLDB'][0].credentials;
	console.log("debug ---- cloudant info from bluemix -----" + cloudant);
} else {
	console.log("debug ---- cloudant info from default -----" + cloudant);
}

var nano = require('nano')(cloudant.url);

// app.use(info_before_request);
app.get('/test', function (req, res) {
	console.log('get request for test');
	res.send('hello world')
});

app.get('/rest/activities',auth, function (req, res) {
	var activity_db = nano.db.use('activities');

	activity_db.list({
		include_docs : true
	}, function (err, body) {
		if (!err) {
			var funcs = [];
			var cur_time = (new Date()).getTime();
			var results = [];
			body.rows.forEach(function(doc){
				if(cur_time < new Date(doc.doc['expire-time']+" 23:59")){
					results.push(doc.doc);
				}
			});
			res.send(results);
		}
	});
});

app.get('/rest/activities/:id',auth, function (req, res) {
	var activity_db = nano.db.use('activities');
	var doc_id = req.params.id;
	activity_db.get(doc_id, function (err, body) {
		res.send(body);
	});
});

app.get('/rest/currentuser',auth, function (req, res) {
	res.send(req.session.user);
});

// the rest is to add a joiner to an activity
app.put('/rest/activities/:activity_id/joiner/:userid',auth, function (req, res) {
	var activity_db = nano.db.use('activities');
	activity_db.get(req.params.activity_id, {
		revs : true
	}, function (err, body) {
		if (!err) {
			body.joiners.push(req.params.userid);
			creater_id = body.creater;
			activity_title = body.title;
			activity_db.insert(body, function (err, body) {
				if (!err) {
					var user_db = nano.db.use('user');
					user_db.list({include_docs : true,keys:[creater_id, req.params.userid]}, function(err, body){
						if(!err){
							var toList=[];
							var subject = "";
							var text = "";
							var html = "";
							body.rows.forEach(function(data){
								if(data.doc._id == creater_id){
									if(data.doc.email){
										toList.push(data.doc.email);
									}
								}else{
									subject = data.doc.name + " joined your activity ["+activity_title+"]";
									text = data.doc.name + " joined your activity ["+activity_title+"] , you can go to "+activity_url+" to have a look at";
									html = data.doc.name + " joined your activity ["+activity_title+"]"+"<br>you can go to <a href=\"http://"+activity_url+"\">"+activity_url+"</a> to have a look at";
								}
							});
							if(toList.length > 0){
								mail_func(toList, subject, text, html);
							}else{
								console.error("user's email is not set");
							}
						}else{
							console.error(err);
						}
						
					});
					res.send({
						"message" : "add joiner succeeded"
					});
				} else {
					// throw err not working
					// throw err;
					error_handle(err, res);
				}
			});
		} else {
			error_handle(err, res);
			// throw err;
		}
	});
});
app.post('/rest/activities',auth,function(req, res){
	var activity_db = nano.db.use('activities');
	activity_db.get(req.body._id, {
		revs : true
	}, function (err, body) {
		if (!err) {
			body.title = req.body.title;
			body.description = req.body.description;
			body['expire-time'] = req.body['expire-time'];
			body['max-joiners'] = req.body['max-joiners'];
			console.log("start to update activity");
			console.log(body);
			activity_db.insert(body, function (err, body) {
				if (!err) {
					res.send({
						"message" : "update activity succeeded"
					});
				} else {
					throw err;
				}
			});
		} else {
			throw err;
		}
	});
});
app.delete('/rest/activities/:activity_id',auth, function(req, res){
	var activity_db = nano.db.use('activities');
	activity_db.get(req.params.activity_id, {
		revs : true
	}, function (err, body) {
		if (!err) {
			activity_db.destroy(body._id,body._rev, function (err, body) {
				if (!err) {
					res.send({
						"message" : "delete activity succeeded"
					});
				} else {
					throw err;
				}
			});
		} else {
			throw err;
		}
	});
});

app.post('/rest/activities2',auth, function(req, res) {
	var activity_db = nano.db.use('activities');
	var results = [];

    // when insert a record, you can specify a docname , then it'll be used as
	// _id
    // for the record
    // if docname is not specified, the id will be generated by cloudantDB
    console.log("req.body is --------------------------------- ");
    console.log(req.body);
    activity_db.insert(req.body, function(err, body) {
	    if (!err) {
	    	creater_id = req.body.creater;
	    	activity_title = req.body.title;
	    	to_list = req.body.invited_emails;
	    	var user_db = nano.db.use('user');
	    	user_db.get(creater_id, function(err, body){
	    		if(!err){
	    			creater = body.name;
	    			subject = creater + " invite you to join activity ["+activity_title+"]";
					text = creater + " invite you to join activity ["+activity_title+"] , you can go to "+activity_url+" to have a look at";
					html = creater + " invite you to join activity ["+activity_title+"]"+"<br>you can go to <a href=\"http://"+activity_url+"\">"+activity_url+"</a> to have a look at";
					if(to_list && to_list.length > 0){
						mail_func(to_list, subject, text, html);
					}else{
						console.log("invite list is empty");
					}
	    		}else{
	    			console.error("error when query user :"+creater_id);
	    			console.error(err);
	    		}
	    	});
	    	res.send("Success");
	    } else {
		    // if the docname already existed, the insert will fail
		    console.log(err);
	    }
    });
});

app.delete ('/rest/activities/:activity_id/joiner/:userid',auth, function (req, res) {
	var activity_db = nano.db.use('activities');
	activity_db.get(req.params.activity_id, {
		revs : true
	}, function (err, body) {
		if (!err) {
			var new_joiner = [];
			body.joiners.forEach(function (data) {
				if (data != req.params.userid) {
					new_joiner.push(data);
				}
			});
			body.joiners = new_joiner;
			creater_id = body.creater;
			activity_title = body.title;
			activity_db.insert(body, function (err, body) {
				if (!err) {
					var user_db = nano.db.use('user');
					user_db.list({include_docs : true,keys:[creater_id, req.params.userid]}, function(err, body){
						if(!err){
							var toList=[];
							var subject = "";
							var text = "";
							var html = "";
							body.rows.forEach(function(data){
								if(data.doc._id == creater_id){
									if(data.doc.email){
										toList.push(data.doc.email);
									}
								}else{
									subject = data.doc.name + " leaved your activity ["+activity_title+"]";
									text = data.doc.name + " leaved your activity ["+activity_title+"] , you can go to "+activity_url+" to have a look at";
									html = data.doc.name + " joined your activity ["+activity_title+"]"+"<br>you can go to <a href=\"http://"+activity_url+"\">"+activity_url+"</a> to have a look at";
								}
							});
							if(toList.length > 0){
								mail_func(toList, subject, text, html);
							}else{
								console.error("user's email is not set");
							}
						}else{
							console.error(err);
						}
					});
					res.send({
						"message" : "delete joiner succeeded"
					});
				} else {
					throw err;
				}
			});
		} else {
			throw err;
		}
	});
});

app.post('/rest/login',
	function (req, res) {

	var userdb = nano.db.use('user')

		var get_q = function (db, doc_id) {
		var deferred = Q.defer();
		db.get(doc_id, function (err, body) {
			if (!err) {
				deferred.resolve(body);
			} else {
				deferred.reject(err);
			}
		});
		return deferred.promise;
	}

	get_q(userdb, req.body.userid).then(function (obj) {
		if (obj.password == req.body.password) {
			delete obj.password;
			delete obj._rev;
			req.session.user = obj;
			res.send(req.session.user);
		} else {
			console.log("login failed to password incorrect");
			res.status(401);
			res.send({ message: 'login failed'});
		}
	}, function (obj) {
		console.log("login failed");
		res.status(401);
		res.send({ message: 'login failed'});
	});
});

app.get('/logout',auth,
	function (req, res) {
	req.session.destroy();
	res.send({
		'message' : 'logout succeeded'
	});
});


app.post("/rest/users",auth, function(req, res){
	var list_param = {};
	if(req.body.users){
		list_param = {
				include_docs : true,
				keys : req.body.users
			};
	}else{
		list_param = {
				include_docs : true,
			};
	}
	userdb = nano.db.use("user");
	var results = [];
	userdb.list(list_param, function(err, body) {
		if (!err) {
			var results = [];
			body.rows.forEach(function(doc) {
				var result = doc.doc;
				console.log(result);
				delete result.password;
				results.push(result);
			})
			res.send(results);
		}else{
			console.err("-----------------------------------");
			console.err("failed to retrieve user db");
			console.err(err);
			console.err("-----------------------------------");
		}
	});
});

app.get('/rest/user/:id', function(req, res){
	userdb = nano.db.use("user");
	userdb.get(req.params.id, function(err, body){
		if(!err){
			delete body.password;
			delete body._rev;
			res.send({ exist_code:1, message:"user existed", user: body});
		}else{
			if(err.statusCode == 404){
				res.send({ exist_code:0, message:"user not existed"});
			}else{
				console.error(err);
				res.send({ exist_code:1, message:"server error"});
			}
		}
	});
});

app.delete('/rest/user/:id', auth, function(req, res){
	userdb = nano.db.use("user");
	userdb.get(req.params.id, {
		revs : true
	},function(err, body){
		if(!err){
			userdb.destroy(body._id,body._rev, function (err, body) {
				if (!err) {
					req.session.destroy();
					res.send({
						"message" : "delete user succeeded"
					});
				} else {
					console.error(err);
					res.status(500);
					res.send({message:"unregister failed"});
				}
			});
		}else{
			console.error(err);
			res.status(500);
			res.send({message:"unregister failed"});
		}
	});
});

app.post('/rest/user/register', function(req, res){
	userdb = nano.db.use("user");
	var user_data = {
			'_id': req.body.userid,
			'name': req.body.name,
			'password': req.body.password,
	}
	if('email' in req.body){
		user_data.email = req.body.email;
	}
	userdb.insert(user_data, function(err, body){
		if(!err){
			delete user_data.password;
			req.session.user = user_data;
			res.send({ register_code:0, message:"register succeeded"});
		}else{
			res.status(401);
			res.send({ message: 'register failed'});
		}
	});
});

app.post('/rest/user/edit',auth, function(req, res){
	userdb = nano.db.use("user");
	userdb.get(req.body.userid, {
		revs : true
	},function(err, body){
		if(!err){
			if("old_password" in req.body && req.body.old_password != body.password){
				res.status(401);
				res.send({exit_code:1, message: "auth failed"});
				return;
			}
			if("old_password" in req.body){
				body.password = req.body.new_password;
			}
			if("name" in req.body){
				body.name = req.body.name;
			}
			if("email" in req.body){
				body.email = req.body.email;
			}
			
			userdb.insert(body, function(err, body_doc){
				if(!err){
					delete body._rev;
					delete body.password;
					console.log(body);
					req.session.user = body;
					res.send({exit_code:0,message:"update user info succeeded"});
				}else{
					console.error(err);
					res.status(500);
					res.send({exit_code:2,message:"update user info failed"});
				}
			});
		}else{
			console.error(err);
			res.status(500);
			res.send({exit_code:255,message:"get user info failed"});
		}
	});
});

// app.get('/rest/mail', function(req, res){
// toList = ['luowg@cn.ibm.com'];
// subject = 'an activity is waiting for your join';
// text = 'an activity is waiting for your join';
// mail_func(toList, subject, text);
// res.send('success');
// });
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	console.log("error ------ " + err);
	res.send({
		error_message : err.message
	});
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {

	// print a message when the server starts listening
	console.log("server starting on " + appEnv.url);
});

function writeObj(obj) {
	var description = "\n ===================== \n";
	for (var i in obj) {
		var property = obj[i];
		description += i + " = " + property + "\n";
	}
	description += " ===================== \n";
	return description;
}

function error_handle(err, res) {
	res.status(err.status || 500);
	console.log("error ------ " + err);
	res.send({
		error_message : err.message
	});
}