angular.module('pocketreel.services', [])

	.factory('DataService', ['$window', '$ionicUser', 'UtilService', '$ionicDB',
		function ($window, $ionicUser, UtilService, $ionicDB) {
			var saveCheckIn = function (itemToCheckIn) {
				var checkedInItems = $ionicUser.get("CHECKED_IN_TITLES", {});
				checkedInItems[itemToCheckIn.imdbid] = itemToCheckIn;
				$ionicUser.set("CHECKED_IN_TITLES", checkedInItems);
				$ionicUser.save();
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

			return {
				saveCheckIn: saveCheckIn,
				getCheckedInItems: getCheckedInItems,
				saveToStream: saveToStream,
				updateUsrImage: updateUsrImage,
				getUsrImage: getUsrImage
			};
		}])

	.factory('UtilService', function ($ionicLoading) {
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
		}

		return {
			displayLoading: displayLoading,
			hideLoading: hideLoading,
			getSimplePopupOptObj: getSimplePopupOptObj,
			getDateString: getDateString
		}

	});
