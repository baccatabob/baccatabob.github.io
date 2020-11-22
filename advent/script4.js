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

$scope.foundCookie = false;
$scope.loading = true;
$scope.displayCalendar = false;

$scope.doors = [
{day:1, opened:false, videoId:'nn5ken3RJBo'},
{day:2, opened:false, videoId:'U_Tux6tixN0'},
{day:3, opened:false, videoId:'Y7uhbiUs6eY'},
{day:4, opened:false, videoId:'-7oJ9I2N3xk'},
{day:5, opened:false, videoId:'7qQAE794uvo'},
{day:6, opened:false, videoId:'IetPAANnhzQ'},
{day:7, opened:false, videoId:'C6o0amydcLU'},
{day:8, opened:false, videoId:'0j2JRcC6wBs'},
{day:9, opened:false, videoId:'Wit-jGD4wCw'},
{day:10, opened:false, videoId:'pliqObTHxUQ'},
{day:11, opened:false, videoId:'yxDZjg_Igoc'},
{day:12, opened:false, videoId:'h7QlxvTIU6Q'},
{day:13, opened:false, videoId:'UbR5p34-grc'},
{day:14, opened:false, videoId:'OxSJSZsD62g'},
{day:15, opened:false, videoId:'sw5ZCZeS32M'},
{day:16, opened:false, videoId:'AEyGZlBdkaA'},
{day:17, opened:false, videoId:'ifXjjHWmOC4'},
{day:18, opened:false, videoId:'QUzwkchlOw0'},
{day:19, opened:false, videoId:'tFFv6ZePDG0'},
{day:20, opened:false, videoId:'tue3g6tmys4'},
{day:21, opened:false, videoId:'pwpxAtJS-Sc'},
{day:22, opened:false, videoId:'2Bayi6ETui8'},
{day:23, opened:false, videoId:'NaJ5FnM0Bzo'},
{day:24, opened:false, videoId:'BIPTE84l9ls'}
// cxqQtUQErhQ
// j8N2YTikOsc
// cjtYgGN3z6U
];

const cookieName = 'adventCalendar';

$scope.loadData = function() {
	var alreadyOpened = $cookies.get(cookieName);

	if (alreadyOpened) {
		$scope.foundCookie = true;
		
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

$scope.cookieModalDismissed = function() {
	$scope.displayCalendar = true;
};

angular.element(function () {
    setDoorHeight();
	$scope.loading = false;
	$scope.displayCalendar = $scope.foundCookie;
});

});
})(window.angular);