var imdb = require('imdb-api');

angular.module('pocketreel.controllers', [])

	.controller('SignInCtrl', ['$scope', '$ionicAuth', '$ionicUser', '$state', 'UtilService', '$ionicPopup',
		function ($scope, $ionicAuth, $ionicUser, $state, UtilService, $ionicPopup) {

			if ($ionicAuth.isAuthenticated()) {
				$state.go('tab.dash');
			}

			$scope.validateUser = function (userCredentials) {
				var details = { 'email': userCredentials.mail, 'password': userCredentials.password };

				$ionicAuth.login('basic', details).then(function () {
					//$scope.userCredentials.mail = "";
					//$scope.userCredentials.password = "";  
					$state.go('tab.dash');
				}).catch(function (err) {
					var popupOptions;

					if (err.status === 401)
						popupOptions = UtilService.getSimplePopupOptObj("Invalid login credentials", "Sign in error");
					else
						popupOptions = UtilService.getSimplePopupOptObj("Error code: " + err.status + "\nMessage: " + err.message, "Sign in error");

					$ionicPopup.alert(popupOptions);
				});
			};

		}])

	.controller('SignUpCtrl', ['$scope', '$state', '$ionicAuth', '$ionicUser', '$ionicPopup', 'UtilService',
		function ($scope, $state, $ionicAuth, $ionicUser, $ionicPopup, UtilService) {

			$scope.signup = function (newUserCredentials) {

				if (!newUserCredentials || !newUserCredentials.mail || !newUserCredentials.password || !newUserCredentials.username) {
					var popupOptions = UtilService.getSimplePopupOptObj("You need to fill in all fields", "Signup error");
					$ionicPopup.alert(popupOptions);
				} else {

					var details = { 'email': newUserCredentials.mail, 'password': newUserCredentials.password, 'username': newUserCredentials.username };
					var popupOptions;

					$ionicAuth.signup(details).then(function () {
						popupOptions = UtilService.getSimplePopupOptObj("You can now login using your credentials.", "Signup successful");
						$ionicPopup.alert(popupOptions).then(function () {
							//$scope.newUserCredentials.mail = "";
							//$scope.newUserCredentials.password = "";        
							$state.go('auth.signin');
						});
					}, function (err) {

						for (var e of err.details) {
							if (e === 'conflict_email') {
								popupOptions = UtilService.getSimplePopupOptObj("Email already exists.", "Signup error");
							} else if (e === 'invalid_email') {
								popupOptions = UtilService.getSimplePopupOptObj("Invalid e-mail.", "Signup error");
							} else if (e === 'conflict_username') {
								popupOptions = UtilService.getSimplePopupOptObj("Username already exists.", "Signup error");
							} else {
								popupOptions = UtilService.getSimplePopupOptObj(e, "Signup error");
							}
							$ionicPopup.alert(popupOptions);
						}
					});
				};
			};
		}])

	.controller('DashCtrl', ['$scope', 'RecentActivity', '$ionicDB', '$ionicPopup',
		function ($scope, RecentActivity, $ionicDB, $ionicPopup) {
			$scope.updateStream = function () {
				$ionicDB.connect();
				var streamPosts = $ionicDB.collection('stream');
				var messageList = [];
				streamPosts.order("time", "descending").limit(10).fetch().subscribe(
					function(result) {
						result.forEach(function(element) {
						messageList.push(element);
						});
						$scope.streamUpdates = messageList
					},
					function(err) {
						console.error(err)
						var popupOptions = UtilService.getSimplePopupOptObj("Try again later", "Refresh error");
				  		$ionicPopup.alert(popupOptions);
					},
					function() {
						$scope.$broadcast('scroll.refreshComplete');
						$ionicDB.disconnect();
					}
				);
			};

			$scope.updateStream();
		}])

	.controller('CheckInCtrl', ['$rootScope', '$scope', 'UtilService', '$ionicPopup', function ($rootScope, $scope, UtilService, $ionicPopup) {

		$scope.searchParams = {};

		$scope.searchTitle = function () {
			$scope.lastSearchAt = new Date().getTime();

			UtilService.displayLoading();

			imdb.getReq({ name: $scope.searchParams.searchText }).then(function (data) {
				if (data) {
					UtilService.hideLoading();
					$scope.resultType = data.constructor.name
					$rootScope.searchResults = [data];

					if (data.constructor.name === "TVShow") {
						data.episodes().then(function (episodes) {
							return $rootScope.searchResultDetails = [episodes];
						});
					}
				}

			}).catch(function (err) {
				var popupOptions = "";
				if (err.constructor.name === "ImdbError") {
					popupOptions = UtilService.getSimplePopupOptObj("Try again later", "IMDb API error");
				} else {
					popupOptions = UtilService.getSimplePopupOptObj("Try another search phrase", "Nothing found");
				}
				UtilService.hideLoading();
				$ionicPopup.alert(popupOptions);

				$rootScope.searchResults = "";
				$rootScope.searchResultDetails = "";
				console.log("ERR: ", err)
			});
		};

		$scope.clearInput = function () {
			$scope.searchParams.searchText = "";
		};

	}])

	.controller('CheckInDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicPopup', 'UtilService', 'DataService', '$state', '$ionicHistory', '$ionicUser',
		function ($scope, $rootScope, $stateParams, $ionicPopup, UtilService, DataService, $state, $ionicHistory, $ionicUser) {
			$scope.userScore = 50;
			for (index in $rootScope.searchResults) {
				if ($rootScope.searchResults[index].imdbid === $stateParams.checkInTitleId)
					$scope.titleInfo = $rootScope.searchResults[index];
			}

			$scope.confirmCheckIn = function (userScore) {

				var itemToCheckIn = {
					"imdbid": $scope.titleInfo.imdbid,
					"title": $scope.titleInfo.title,
					"poster": $scope.titleInfo.poster,
					"imdburl": $scope.titleInfo.imdburl,
					"userScore": userScore,
					"time": UtilService.getDateString(),
					"user": $ionicUser.details.username
				};

				DataService.saveCheckIn(itemToCheckIn);
				DataService.saveToStream(itemToCheckIn);

				// .then(function () {
				var msg = `You gave title ${$scope.titleInfo.title} a score of ${userScore}`;
				var popupOptions = UtilService.getSimplePopupOptObj(msg, "Check-in complete!");
				$rootScope.searchResults = [];
				$rootScope.searchResultDetails = [];
				$ionicHistory.goBack();
				$ionicPopup.alert(popupOptions).then(function () {
					$state.go('tab.myCheckIns');
				});
				//});

			};

		}])

	.controller('MyCheckInsCtrl', ['$scope', '$window', 'DataService', function ($scope, $window, DataService) {
		$scope.myCheckedInItems = DataService.getCheckedInItems();

		$scope.showPlaceHolder = function () {
			return Object.keys($scope.myCheckedInItems).length < 1 ? true : false
		};

		$scope.openLink = function (url) {
			cordova.InAppBrowser.open(url, '_system', 'location=yes');
		};

	}])

	.controller('MyBadgesCtrl', ['$scope', function ($scope) {


	}])

	.controller('AccountCtrl', ['$state', '$scope', '$ionicAuth', function ($state, $scope, $ionicAuth) {
		$scope.logout = function () {
			$ionicAuth.logout();
			$state.go('auth.signin');
		};
	}]);
