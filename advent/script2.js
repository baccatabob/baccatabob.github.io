(function(angular) {
  'use strict';
angular.module('adventCalendar', ['ngCookies']).controller('AdventCalendarController',
function($scope, $window, $cookies, $sce) {

$scope.doors = [
{day:1, text:'apple', opened:false, videoId:'nn5ken3RJBo'},
{day:2, text:'banana', opened:false, videoId:'U_Tux6tixN0'},
{day:3, text:'cherry', opened:false, videoId:'Y7uhbiUs6eY'}
];

const cookieName = 'adventCalendar';

$scope.loadData = function() {
	var alreadyOpened = $cookies.get(cookieName);

	console.log("alreadyOpened = " + alreadyOpened);

	if (alreadyOpened) {
		var openedDoors = alreadyOpened.split(",");

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

	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + 365);

	$cookies.put(cookieName, allOpenedDoors, {'expires': expireDate});
};

$scope.getVideoUrl = function(dayNum) {
	var videoId = $scope.doors[dayNum-1].videoId;
	var fullUrl = 'https://www.youtube.com/embed/' + videoId;

	console.log('about to trust ' + fullUrl);

	return $sce.trustAsResourceUrl(fullUrl);
};

});
})(window.angular);