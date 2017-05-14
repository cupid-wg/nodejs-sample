activityApp.controller('userEditCtrl', function ($scope, $http, $uibModalInstance, globalData) {
	$http.get('/rest/user/'+globalData.user._id).success(function(body){
		$scope.user = body.user;
		$scope.user.userid =$scope.user._id 
		delete $scope.user._id;
	});
	$scope.edit_func = function () {
		$scope.edit_failed = false;
		$scope.error_message = "";
		if($scope.user.old_password && $scope.user.old_password != ""){
			if(!$scope.user.new_password || $scope.user.new_password == ""){
				$scope.edit_failed = true;
				$scope.error_message = "please input new password";
				return;
			}else if(!$scope.user.conf_password || $scope.user.new_password != $scope.user.conf_password){
				$scope.edit_failed = true;
				$scope.error_message = "the new password is not same to the password confirmation, please re-enter";
				return;
			}
		}
		var user_data = {};
		user_data.userid = $scope.user.userid;
		if($scope.user.old_password && $scope.user.old_password != ""){
			user_data.old_password = $scope.user.old_password;
			user_data.new_password = $scope.user.new_password;
		}
		user_data.name = $scope.user.name;
		if("email" in $scope.user){
			user_data.email = $scope.user.email;
		}
		var req_data = {
			method : "POST",
			url : "/rest/user/edit",
			data : user_data
		}
		//console.log(req_data);
		$http(req_data).success(function (res) {
			$uibModalInstance.close('user_update_success');
		}).error(function (res) {
			$scope.edit_failed = true;
			if(res.exit_code == 1){
				$scope.error_message = "auth failed, please check your password is correct";
			}else{
				$scope.error_message = "update userinfo failed";
			}
			
		});
	};
	
	$scope.unregister_func = function(){
		$http.delete('/rest/user/'+$scope.user.userid).success(function(body){
			$uibModalInstance.close('unregister_success');
		});
	}
	$scope.hide = function(){
		$uibModalInstance.dismiss('cancel');
	}
});