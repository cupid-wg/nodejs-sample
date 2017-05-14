module.exports = function(req, res, next) {
    if(req.session.user){
    	next();
    }else{
    	err = new Error("No user session");
    	err.status = 401;
    	throw(err);
    }
};