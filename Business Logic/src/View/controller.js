console.log("Hello");
var myAppModule = angular.module('myApp', []);
myAppModule.controller('TestController', function($scope) {
  console.log("Testing");
  $scope.message = "Goodbye World";
  $scope.arr = ["hi", "lol", "bye"];
  $scope.action = function(newMsg) {
    console.log("I've been clicked"); 
     $scope.arr.push(newMsg); 
  };
  $scope.show = false;
  $scope.username = "";
  $scope.password = "";
  $scope.submit = function() {
    console.log("Submit was clicked");
    if (!$scope.username || !$scope.password) {
      $scope.err = true;
    }
    else {
      $scope.err = false;
      console.log("Attempt to log in with" + $scope.username + " and password " + $scope.password);
    }
  };
  $scope.err = false;
});
