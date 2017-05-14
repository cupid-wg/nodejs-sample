activityApp.controller('activityCtrl', function ($scope, $http, $route, $uibModal, globalData) {
	$scope.show_tag = false;
	$scope.show_list = true;
	globalData.read_user().then(function(data){ $scope.cur_user = data.user._id });
	
	$scope.showdetail = function (activity) {
		/*
		 * console.debug(activity); console.debug(activity.joiners);
		 */
		if ($scope.cur_user == activity.creater) {
			var modalInstance = $uibModal.open({
					templateUrl : 'template/modal/activity_edit.html',
					controller : 'activityEditCtrl',
					resolve : {
						obj : function () {
							return {
								'activity' : activity,
								'cur_user' : $scope.cur_user
							};
						}
					}
				});
			modalInstance.result.then(function (info) {
				$route.reload();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		} else {
			var modalInstance = $uibModal.open({
					templateUrl : 'template/modal/activity_show.html',
					controller : 'activityShowCtrl',
					resolve : {
						obj : function () {
							return {
								'activity' : activity,
								'cur_user' : $scope.cur_user
							};
						}
					}
				});
			modalInstance.result.then(function (info) {
				$route.reload();
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
		}
	};

	$http.get("/rest/activities").success(function (response) {
		$scope.activities = response;
	});
});

function date_to_string(the_date) {
	var year = the_date.getFullYear();
	var month = the_date.getMonth();
	var day = the_date.getDate();
	if (month < 9) {
		month = "0" + (month + 1);
	}
	if (day < 10) {
		day = "0" + day;
	}
	return [year, month, day].join("-");
}
activityApp.controller('activityEditCtrl', function ($scope, $http, $uibModalInstance, obj) {
	$scope.activity = obj.activity;
	$scope.cur_user= obj.cur_user;
	$scope.activity['expire-time-in-date'] = new Date($scope.activity['expire-time']);
	$scope.today = new Date();
	$scope.dateOptions = {
	        showWeeks: false,
	        minDate: new Date()
	    };

	    $scope.open1 = function() {
	        $scope.popup1.opened = true;
	    };

	    $scope.popup1 = {
	        opened: false
	    };
	$scope.delete_func = function (activity_id, cur_user) {
		$http.delete ("/rest/activities/" + activity_id).success(function (response) {
			$uibModalInstance.close('delete_success');
		})
	}

	$scope.edit_func = function (activity_id, cur_user) {
		$scope.activity['expire-time'] = date_to_string($scope.activity['expire-time-in-date']);
		console.debug($scope.activity);
		$http({
			method : "POST",
			url : "/rest/activities",
			data : $scope.activity
		}).success(function (response) {
			$uibModalInstance.close('edit_success');
		})
	}

	$scope.hide_edit_detail = function () {
		$uibModalInstance.dismiss('cancel');
	};
});

activityApp.controller('activityShowCtrl', function ($scope,$http, $uibModalInstance, obj) {
	
	$scope.activity = obj.activity;
	$scope.cur_user= obj.cur_user;
	$scope.show_leave = false;
	$http({
		method : "POST",
		url : "/rest/users",
		data : {
			users : obj.activity.joiners
		}
	}).success(function (response) {
		$scope.activity.joiners_ins = response;
	});

	$scope.activity.joiners.forEach(function (data) {
		if (data == $scope.cur_user) {
			$scope.show_leave = true;
		}
	});
	if ($scope.activity['max-joiners'] > $scope.activity.joiners.length && !$scope.show_leave) {
		$scope.show_join = true;
	} else {
		$scope.show_join = false;
	}

	$scope.join_func = function (activity_id, cur_user) {
		$http.put("/rest/activities/" + activity_id + "/joiner/" + cur_user).success(function (response) {
			$uibModalInstance.close('join_success');
		})
	}

	$scope.leave_func = function (activity_id, cur_user) {
		console.debug("leave activity " + activity_id);
		$http.delete ("/rest/activities/" + activity_id + "/joiner/" + cur_user).success(function (response) {
			$uibModalInstance.close('leave_success');
		})
	}

	$scope.hidedetail = function () {
		$uibModalInstance.dismiss('cancel');
	};
});
/**
 * activityApp.directive('convertMil', function () { return { restrict: 'A',
 * require: 'ngModel', link: function (scope, element, attr, ngModel) {
 *
 * var formatDate = function (dateIn) { console.debug("formatDate");
 * console.log(dateIn); try { if ((angular.isDefined(dateIn)) && (dateIn !==
 * null)) { return new Date(parseInt(dateIn)); } else {
 * console.debug("formatDate > dateIn not defined"); return ""; } } catch (err) {
 * console.log("Error : " + err); return ""; } };
 *
 * var parseDate = function (input) { console.debug("parseDate"); try { var
 * tmpDate = new Date(input); return tmpDate.getTime(); } catch (err) {
 * console.debug("Error : " + err + " on " + input); return null; } }; var
 * fromUser = function (text) { // view to model var tmpResult =
 * parseDate(text); console.log("view to model / date to milli" + text + " -> " +
 * tmpResult); return tmpResult; }; var toUser = function (text) { // model to
 * view var tmpResult = formatDate(text); console.log("model to view / milli to
 * date : " + text + " -> " + tmpResult); return tmpResult; };
 * //ngModel.$parsers.push(fromUser); ngModel.$formatters.push(toUser); } }; });
 */
