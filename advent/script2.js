
// https://www.geeksforgeeks.org/how-to-set-get-and-clear-cookies-in-angularjs/

(function(angular) {
  'use strict';
angular.module('adventCalendar', ['ngCookies']).controller('AdventCalendarController',
function($scope, $window, $cookies) {

$scope.doors = [
{day:1, text:'apple', opened:false},
{day:2, text:'banana', opened:false},
{day:3, text:'cherry', opened:false}
];

const cookieName = 'adventCalendar';

$scope.loadData = function() {
	var alreadyOpened = $cookies.get(cookieName);

	console.log("alreadyOpened = " + alreadyOpened);

	if (alreadyOpened) {
		openedDoors = alreadyOpened.split(",");

		angular.forEach(openedDoors, function(d) {
			$scope.doors[d-1].opened = true;
		});
	}
};

$scope.extractOpenDoorNumbers = function () {
	var openedDoors = [];

	angular.forEach($scope.doors, function(d) {
		if (d.opened) {
			openedDoors.push(d.day);
		}
	});

	var result = openedDoors.join();

	return result;
}

$scope.openDoor = function(dayNum) {

	// wombat put something in here to check that this door isn't for the future

	$scope.doors[dayNum-1].opened = true;
	var allOpenedDoors = $scope.extractOpenDoorNumbers();

	console.log("opened doors = " + allOpenedDoors);

	$cookies.put(cookieName, allOpenedDoors);
};

});
})(window.angular);