activityApp.controller('createCtrl', function($scope, $http, $location, globalData) {
    $scope.expireDate = new Date();

    $scope.dateOptions = {
        showWeeks: false
    };

    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };

    $scope.popup1 = {
        opened: false
    };
  
    $scope.tags = [
                {id:'tag1', name:'Hotel'},
                {id:'tag2', name:'Lunch'},
                {id:'tag3', name:'Outing'},
                {id:'tag4', name:'Others'}
            ];
            
    $scope.selected = [];
    $scope.selectedTags = [];

    var updateSelected = function(action,id,name){
        if (action == 'add' && $scope.selected.indexOf(id) == -1){
            $scope.selected.push(id);
            $scope.selectedTags.push(name);
        }
        if (action == 'remove' && $scope.selected.indexOf(id)!=-1){
            var idx = $scope.selected.indexOf(id);
            $scope.selected.splice(idx, 1);
            $scope.selectedTags.splice(idx, 1);
        }
    };
 
    $scope.updateSelection = function($event, id){
        var checkbox = $event.target;
        var action = (checkbox.checked?'add':'remove');
        updateSelected(action,id,checkbox.name);
    };
 
    $scope.isSelected = function(id){
        return $scope.selected.indexOf(id)>=0;
    };
            
    $scope.createActivity = function(){
        var doc_tmp = {};
        doc_tmp["creater"] = globalData.user._id;
        doc_tmp["title"] = $scope.activityName;
        doc_tmp["description"] = $scope.activityDescription;
        doc_tmp["tags"] = $scope.selectedTags;
        doc_tmp["expire-date"] = $scope.expireDate.toLocaleDateString();
        doc_tmp["expire-time"] = date_to_string($scope.expireDate);
        doc_tmp["max-joiners"] = $scope.maxJoiners;       
        doc_tmp["joiners"] = [];
        doc_tmp["invited_emails"] = $scope.invited_emails;
//        console.debug(doc_tmp);
//        return;
          //$location.path("/activity");  
        $http.post("/rest/activities2", doc_tmp).success(function(response) {
        	$location.path("/activity");
        }).error(function(response) {
            alert("create failed !");
        });
        //$scope.testdoc = doc_tmp; 
    };
    $scope.resetActivity = function(){
        $scope.activityName = "";
        $scope.expireDate = new Date();
        $scope.activityDescription = "";
        $scope.selectedTags = [];
        $scope.maxJoiners = "";
        $scope.invited_emails = "";
        $scope.selected = "";
    };
});