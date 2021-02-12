function setDoorHeight() {

	const ratio = 0.605;	// 121 / 200

	let doors = document.getElementsByClassName('door');
	let doorWidth = doors[0].offsetWidth;
	let doorHeight = Math.floor(doorWidth * ratio) + 'px';
	
	for(var i=0; i < doors.length; i++) {
		doors[i].style.height = doorHeight;
	}
}

(function(angular) {
  'use strict';
angular.module('BirthdayApp', ['ngCookies']).controller('BirthdayController',
function($scope, $window, $cookies, $sce) {

$scope.doors = [];

$scope.today = '';
$scope.startDate = new Date("02/11/2020");		// wombat make this 02/14/2021

const numDays = 46;

$scope.loadData = function() {
	
	$scope.today = new Date();
	
	for(var i=0; i<numDays; i++) {

		$scope.doors.push({day: i+1, position: Math.random(), opened: false, videoId: videoIds[i]});
	}
	
	var alreadyOpened = $cookies.get(cookieName);

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

	if (!canOpenDoor(dayNum)) {
		return;
	}
	
	$scope.doors[dayNum-1].opened = true;
	var allOpenedDoors = $scope.extractOpenDoorNumbers();

	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + 365);

	$cookies.put(cookieName, allOpenedDoors, {'expires': expireDate});
};

function canOpenDoor(dayNum) {
	
	var timeSinceStart = $scope.today.getTime() - $scope.startDate.getTime();
	var daysSinceStart = timeSinceStart / (1000 * 3600 * 24); 
	
	return dayNum <= (daysSinceStart + 1);	// on the first day, daysSinceStart will be 0, but we want door 1 to be openable
}

$scope.getVideoUrl = function(dayNum) {
	var videoId = $scope.doors[dayNum-1].videoId;
	var fullUrl = 'https://www.youtube.com/embed/' + videoId;

	return $sce.trustAsResourceUrl(fullUrl);
};

$scope.random = function() {
	return 0.5 - Math.random();
}

angular.element(function () {
    setDoorHeight();
});

});
})(window.angular);