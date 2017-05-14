activityApp.controller('userRegisterCtrl', function ($scope, $http, $uibModalInstance, globalData) {
	
	$scope.register_func = function () {
		var req_data = {
			method : "POST",
			url : "/rest/user/register",
			data : $scope.user
		}
		console.log(req_data);
		$http(req_data).success(function (res) {
			globalData.set_user(res);
			$uibModalInstance.close('login_success');
		}).error(function (res) {
			$scope.login_failed = true;
		});
	};
	
	$scope.hide = function(){
		$uibModalInstance.dismiss('cancel');
	}
});


activityApp.directive('ngUnique', ['$http', function ($http) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
 
            elem.on('blur', function (evt) {
                scope.$apply(function () {                   
                    var val = elem.val();
                    var req = { "userid": val }
                    if(val == ""){
                    	console.error("need user id");
                    	ctrl.$setValidity('unique', true);
                    	return;
                    }
                    $http.get("/rest/user/"+val).success(function(data){
                    	//exist_code is 1 means id exist
                    	if(data.exist_code == 1){
                    		ctrl.$setValidity('unique', false);
                    	}else{
                    		ctrl.$setValidity('unique', true);
                    	}
                    }).error(function(data){
                    	console.error("failed to check userid");
                    	console.error(data);
                    });
                });
            });
        }
    }
}]);

activityApp.directive("passwordVerify", function() {
	   return {
	      require: "ngModel",
	      scope: {
	        passwordVerify: '='
	      },
	      link: function(scope, element, attrs, ctrl) {
	    	  element.on('blur', function (evt) {
	                scope.$apply(function () {                   
	                    var val = element.val();
	                    
	                    if(val == ""){
	                    	console.error("need confirm password");
	                    	ctrl.$setValidity('unique', true);
	                    	return;
	                    }
	                    //val is the same to ctrl.$viewValue
//	                    console.debug(scope.passwordVerify);
//	                    console.debug(ctrl.$viewValue);
	                    if(scope.passwordVerify == ctrl.$viewValue){
	                    	ctrl.$setValidity("passwordVerify", true);
	                    }else{
	                    	ctrl.$setValidity("passwordVerify", false);
	                    }
	                });
	            });
//	        scope.$watch(function() {
//	            var combined;
//
//	            if (scope.passwordVerify || ctrl.$viewValue) {
//	               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
//	            }                    
//	            return combined;
//	        }, function(value) {
//	            if (value) {
//	                ctrl.$parsers.unshift(function(viewValue) {
//	                    var origin = scope.passwordVerify;
//	                    if (origin !== viewValue) {
//	                        ctrl.$setValidity("passwordVerify", false);
//	                        return undefined;
//	                    } else {
//	                        ctrl.$setValidity("passwordVerify", true);
//	                        return viewValue;
//	                    }
//	                });
//	            }
//	        });
	     }
	   };
	});

