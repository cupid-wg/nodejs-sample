activityApp.controller('loginCtrl', function($scope, $http) {
    $scope.message = 'login.';
    $scope.$emit('login', 'I am login');
});