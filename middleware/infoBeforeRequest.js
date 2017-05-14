module.exports = function(req, res, next) {
    console.log("user:"+req.user);
    console.log("req header:"+writeObj(req.headers));
    //console.log("req token:"+req.token);
    console.log("req query:"+writeObj(req.query));
    console.log("req body:"+writeObj(req.body));
    console.log("req params:"+writeObj(req.params));
    //console.log("res:"+writeObj(res));
    console.log("session:"+writeObj(req.session));
    next();
};

function writeObj(obj){ 
	var description = "\n ===================== \n"; 
	for(var i in obj){ 
		var property=obj[i]; 
		description+=i+" = "+property+"\n"; 
	} 
	description += " ===================== \n";
	return description; 
}
