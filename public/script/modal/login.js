activityApp.controller('loginCtrl', function ($scope, $http, $uibModalInstance, globalData) {
	$scope.login_failed = false;
	$scope.login_func = function () {
		var req_data = {
			method : "POST",
			url : "/rest/login",
			data : $scope.user
		}
		$http(req_data).success(function (res) {
			globalData.set_user(res);
			$uibModalInstance.close('login_success');
		}).error(function (res) {
			$scope.login_failed = true;
		});
	}
	
	$scope.hide = function(){
		$uibModalInstance.dismiss('cancel');
	}
});
