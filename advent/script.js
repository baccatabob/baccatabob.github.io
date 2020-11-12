const cookieName = 'adventCalendar';

(function(angular) {
  'use strict';
angular.module('adventCalendar', ['ngCookies'])
.controller('AdventCalendarController', ['$sce', '$cookies',

function ($scope, $window, $sce, $cookies) {

$scope.loadData = function() {
	var alreadyOpened = $cookies.get(cookieName);
	
	console.log("alreadyOpened = " + alreadyOpened);
	
	if (alreadyOpened) {
		var openedDoors = alreadyOpened.split(",");
		
		angular.forEach(openedDoors, function(d) {
			doors[d-1].opened = true;
		});
	}
};

$scope.extractOpenDoorNumbers = function () {
	var openedDoors = [];
	
	angular.forEach(doors, function(d) {
		if (d.opened) {
			openedDoors.push(d.day);
		}
	});
	
	var result = openedDoors.join();
	
	return result;
};

$scope.openDoor = function(dayNum) {

	// wombat put something in here to check that this door isn't for the future

	doors[dayNum-1].opened = true;
	var allOpenedDoors = $scope.extractOpenDoorNumbers();
	
	console.log("opened doors = " + allOpenedDoors);
	
	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + 365);
  
  	$cookies.put(cookieName, allOpenedDoors, {'expires': expireDate});
};

$scope.getUrl = function(dayNum) {
	return $sce.trustAsResourceUrl(doors[dayNum-1].url);
};

}]);
})(window.angular);
