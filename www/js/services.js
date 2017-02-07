angular.module('pocketreel.services', [])

	.factory('DataService', ['$window', '$ionicUser', 'UtilService', '$ionicDB',
		function ($window, $ionicUser, UtilService, $ionicDB) {

			var clearData = function() { // dev only
				$ionicUser.set("CHECKED_IN_TITLES", {});
				$ionicUser.set("BADGES", []);
				$ionicUser.save();
			};

			var saveCheckIn = function (itemToCheckIn, badgePopupCallback) {
				var checkedInItems = $ionicUser.get("CHECKED_IN_TITLES", {});
				var numBeforeCheckIn = Object.keys(checkedInItems).length
				checkedInItems[itemToCheckIn.imdbid] = itemToCheckIn;
				var numAfterCheckIn = Object.keys(checkedInItems).length
				$ionicUser.set("CHECKED_IN_TITLES", checkedInItems);
				$ionicUser.save();

				if (numBeforeCheckIn !== numAfterCheckIn) { // if same number, an update was made
					badgePopupCallback(checkBadges(checkedInItems));
				} else {
					badgePopupCallback(null);
				}
			};

			var getCheckedInItems = function () {
				return $ionicUser.get("CHECKED_IN_TITLES", {});
			};

			var saveToStream = function (itemToCheckIn, userid) {
				itemToCheckIn.userid = userid;
				$ionicDB.connect();
				var streamPosts = $ionicDB.collection('stream');
				streamPosts.store(itemToCheckIn).subscribe(
					function (id) {
						$ionicDB.disconnect();
					},
					function (err) { console.error(err) }
				);
			};

			var updateUsrImage = function (userid, imageUrl) {
				$ionicDB.connect();
				var userdata = $ionicDB.collection('users');
				userdata.update({
					id: userid,
					imageurl: imageUrl
				});
			};

			// TODO: do this when updating the stream (and dont store the user image url in the stream database)
			var getUsrImage = function (userid) {
				var imageUrl = "";
				$ionicDB.connect();
				var userdata = $ionicDB.collection('users');
				userdata.find(userid).fetch().subscribe(
					function (result) {

							console.log("result:", result)
							//imageUrl = result.imageurl;

						if (result != null) {
							imageUrl = result.imageurl;
						}
				
					},
					function (err) {
						console.error(err)
					},
					function () {
						$ionicDB.disconnect();
						return imageUrl;
					}
				);
			};

		var updateBadges = function(checkInList) {
			// Get checkIns from database/$ionicUser.get()
			// Call checkBadges()
		};

		var checkBadges = function(itemList) {

			// TODO: get criteria for badges from the database, probably

			var popupContent = "";
			var badgeInfo = "";
			var numberOfCheckIns = Object.keys(itemList).length

			if (numberOfCheckIns === 1) {
				badgeInfo = {"name": "First check in!"};
				popupContent = '<img src="img/number-one-badge.png" style="width: 100%">' +
				'<p>You just made your first check-in, congratulations!</p>';
			}

			// More criteria here...

			if (badgeInfo !== "") {
				var badges = $ionicUser.get("BADGES", []);
				badges.push(badgeInfo);
				$ionicUser.set("BADGES", badges);
				$ionicUser.save();
			}
		
			return popupContent;
		};

		var getBadges = function() {
			return $ionicUser.get("BADGES", []);
		};

			return {
				saveCheckIn: saveCheckIn,
				getCheckedInItems: getCheckedInItems,
				saveToStream: saveToStream,
				updateUsrImage: updateUsrImage,
				getUsrImage: getUsrImage,
				clearData: clearData,
				checkBadges: checkBadges,
				getBadges: getBadges
			};
		}])

	.factory('UtilService', ['$ionicLoading', function ($ionicLoading) {
		/**
	   * @function displayLoading
	   * @memberOf pocketreel.services.UtilService
	   * @description Displays a loading animation.
	   */
		var displayLoading = function () {
			$ionicLoading.show({
				animation: 'fade-in',
				showBackdrop: true,
				maxWidth: 200,
				showDelay: 0
			});
		};

		/**
		 * @function hideLoading
		 * @memberOf pocketreel.services.UtilService
		 * @description Hides a loading animation currently showing.
		 */
		var hideLoading = function () {
			$ionicLoading.hide();
		};

		/**
		 * @function getSimplePopupOptObj
		 * @memberOf pocketreel.services.UtilService
		 * @param {string} _template - The message to be displayed
		 * @param {string} _title - The popup box title
		 * @description Returns an object that can be used as input to $ionicPopup.alert
		 */
		var getSimplePopupOptObj = function (_template, _title) {
			return {
				template: _template,
				title: _title,
				buttons: [
					{ text: "OK", type: "button-positive" }
				]
			};
		};

		var getDateString = function () {
			var d = new Date();
			var time = d.getTime() - d.getTimezoneOffset() * 60000; // offset in minutes, convert to milliseconds
			var datestr = new Date(time).toISOString().replace(/T/, ' ').replace(/Z/, '');
			return datestr;
		};

		return {
			displayLoading: displayLoading,
			hideLoading: hideLoading,
			getSimplePopupOptObj: getSimplePopupOptObj,
			getDateString: getDateString
		}

	}]);
