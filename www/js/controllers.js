var imdb = require('imdb-api');

angular.module('pocketreel.controllers', [])

	.controller('SignInCtrl', ['$scope', '$ionicAuth', '$ionicUser', '$state', 'UtilService', '$ionicPopup', 'DataService',
		function ($scope, $ionicAuth, $ionicUser, $state, UtilService, $ionicPopup, DataService) {

			if ($ionicAuth.isAuthenticated()) {
				DataService.updateUsrImage($ionicAuth.userService.user.id, $ionicUser.details.image);
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

			$scope.newUserCredentials = {};

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
							$scope.newUserCredentials.username = "";
							$scope.newUserCredentials.mail = "";
							$scope.newUserCredentials.password = "";        
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

	.controller('DashCtrl', ['$scope', 'DataService', '$ionicDB', '$ionicPopup', '$ionicUser',
		function ($scope, DataService, $ionicDB, $ionicPopup, $ionicUser) {

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

			//DataService.clearData();
			
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
				// -- For testing while in browser since omdb doesnt allow cors --
				/*
				UtilService.hideLoading();
				var data = { imdbid: "t8u12ndi21e", title:"RoboCop",_year_data:"2014",Rated:"PG-13",Released:"12 Feb 2014",runtime:"117 min",genres:"Action, Crime, Sci-Fi","Director":"José Padilha",Writer:"Joshua Zetumer, Edward Neumeier, Michael Miner, Edward Neumeier, Michael Miner",Actors:"Joel Kinnaman, Gary Oldman, Michael Keaton, Abbie Cornish",plot:"In 2028 Detroit, when Alex Murphy - a loving husband, father and good cop - is critically injured in the line of duty, the multinational conglomerate OmniCorp sees their chance for a part-man, part-robot police officer.",Language:"English, Persian, Ukrainian",Country:"USA",Awards:"4 wins & 1 nomination.",poster:"https://images-na.ssl-images-amazon.com/images/M/MV5BMjAyOTUzMTcxN15BMl5BanBnXkFtZTgwMjkyOTc1MDE@._V1_SX300.jpg",Metascore:"52",rated:"6.2",imdbVotes:"187,953",imdbID:"tt1234721",Type:"movie",Response:"True"};

				$scope.resultType = data.constructor.name
				$rootScope.searchResults = [data];

				return;
				*/
				// -- Temporary for testing while imdb API is faulty --

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

	.controller('CheckInDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicPopup', 'UtilService', 'DataService', '$state', '$ionicHistory', '$ionicUser', '$ionicAuth',
		function ($scope, $rootScope, $stateParams, $ionicPopup, UtilService, DataService, $state, $ionicHistory, $ionicUser, $ionicAuth) {
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
					"user": $ionicUser.details.username,
					"userimage": $ionicUser.details.image
				};

				DataService.saveCheckIn(itemToCheckIn, function(popupContent) {
					var popupOptions;
					if (popupContent) {
						popupOptions = UtilService.getSimplePopupOptObj(popupContent, "Badge unlocked!");
						/*
						popupOptions = {
							//cssClass: "popup-notitle",
							template: '<h3>Badge unlocked!</h3>' + popupContent,
							scope: $scope,
							buttons: [
								{ text: "OK", type: "button-positive" }
							]
						};
						*/
					} else {
						var msg = `You gave title ${$scope.titleInfo.title} a score of ${userScore}`;
						popupOptions = UtilService.getSimplePopupOptObj(msg, "Check-in complete!");
					}

					$rootScope.searchResults = [];
					$rootScope.searchResultDetails = [];
					$ionicHistory.goBack();
					$ionicPopup.alert(popupOptions).then(function () {
						$state.go('tab.myCheckIns');
					});				

				});
				DataService.saveToStream(itemToCheckIn, $ionicUser.id);

				/*
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
				*/

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

	.controller('MyBadgesCtrl', ['$scope', 'DataService', function ($scope, DataService) {
		$scope.myBadges = DataService.getBadges();
	}])

	.controller('AccountCtrl', ['$state', '$scope', '$ionicAuth', '$ionicUser', 'DataService', '$ionicPopup',
	 function ($state, $scope, $ionicAuth, $ionicUser, DataService, $ionicPopup) {

		$scope.accountinfo = {};
		$scope.accountinfo.usrImageUrl = $ionicUser.details.image;
		$scope.accountinfo.username = $ionicUser.details.username;
		$scope.accountinfo.name = $ionicUser.details.name;
		$scope.accountinfo.numCheckIns = Object.keys(DataService.getCheckedInItems()).length;
		
		$scope.logout = function () {
			$ionicAuth.logout();
			$state.go('auth.signin');
		};

	}]);
