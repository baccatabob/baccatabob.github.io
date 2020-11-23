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
angular.module('adventCalendar', ['ngCookies']).controller('AdventCalendarController',
function($scope, $window, $cookies, $sce) {

$scope.doors = [];

$scope.today = '';

const numDays = 24;

$scope.loadData = function() {
	
	var date = new Date();
	$scope.today = date.getDate();
	
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

	if (dayNum > $scope.today) {
		return;
	}
	
	$scope.doors[dayNum-1].opened = true;
	var allOpenedDoors = $scope.extractOpenDoorNumbers();

	var expireDate = new Date();
	expireDate.setDate(expireDate.getDate() + 365);

	$cookies.put(cookieName, allOpenedDoors, {'expires': expireDate});
};

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