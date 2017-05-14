var activityApp = angular.module('activityApp', ['ngRoute', 'ui.bootstrap','ngAnimate']);

// configure our routes
activityApp.config(function ($routeProvider) {
	$routeProvider

	// route for the home page
	.when('/', {
		templateUrl : 'template/activity.html',
		controller : 'activityCtrl'
	})

	// route for the home page
	.when('/activity', {
		templateUrl : 'template/activity.html',
		controller : 'activityCtrl'
	})
	// route for the contact page
	.when('/activity-create', {
		templateUrl : 'template/activitycreate.html',
		controller : 'createCtrl'
	})

	//.when('/login', {
		//templateUrl : 'template/login.html',
		//controller : 'loginCtrl'
	//})
});
activityApp.factory("globalData", function ($http, $q) {
	var factory_ins = { loaded: false}

	factory_ins.read_user = function () {
		var deferred = $q.defer();
		if(! factory_ins.loaded){
			console.debug("user info not load, initiate");
			$http.get('/rest/currentuser').success(function (response) {
				factory_ins.loaded = true;
				factory_ins.user = response;
				deferred.resolve(factory_ins);
			}).error(function (response) {
				console.debug("user info already load, just return");
				console.error("failed to get current user in load");
				console.error(response);
				deferred.reject(response);
			});
		}else{
			deferred.resolve(factory_ins);
		}
		return deferred.promise;
	}

	factory_ins.set_user = function (user) {
		factory_ins.user = user;
	}
    
	return factory_ins;
});
activityApp.controller('headerCtrl', function ($scope, $http, $location, $uibModal, globalData) {
	$scope.is_login = false;
	globalData.read_user().then(function (data) {
		$scope.user = data.user;
		console.log(data);
		$scope.is_login = true;
	}, function (reason) {
		$scope.is_login = false;
	});
	$scope.show_login = function () {
		var modalInstance = $uibModal.open({
				templateUrl : 'template/modal/login.html',
				controller : 'loginCtrl'
			});
		modalInstance.result.then(function (info) {
			console.debug("login succeeded");
			window.location.href = "/";
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};

	$scope.show_register = function () {
		var modalInstance = $uibModal.open({
				templateUrl : 'template/modal/register.html',
				controller : 'userRegisterCtrl'
			});
		modalInstance.result.then(function (info) {
			console.debug("register succeeded");
			window.location.href = "/";
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};
	
	$scope.show_edit = function () {
		var modalInstance = $uibModal.open({
				templateUrl : 'template/modal/user_edit.html',
				controller : 'userEditCtrl'
			});
		modalInstance.result.then(function (info) {
			console.debug("user edit succeeded");
			window.location.href = "/";
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};
	
	$scope.logout = function () {
		$http.get("/logout").success(function (res) {
			window.location.reload();
		}).error(function (res) {
			console.error("logout failed");
			console.error(res);
		});
	};
});
