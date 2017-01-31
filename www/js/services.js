angular.module('pocketreel.services', [])

.factory('DataService', ['$window', '$ionicUser', 'UtilService', '$ionicDB',
function($window, $ionicUser, UtilService, $ionicDB) {

  //$window.localStorage.removeItem("CHECKED_IN_TITLES")

  var saveCheckIn = function(itemToCheckIn) {
    var checkedInItems = $ionicUser.get("CHECKED_IN_TITLES", {});
    //var checkedInItems = JSON.parse($window.localStorage.getItem("CHECKED_IN_TITLES")) || JSON.parse("{}");
    checkedInItems[itemToCheckIn.imdbid] = itemToCheckIn;
    $ionicUser.set("CHECKED_IN_TITLES", checkedInItems);
    //$window.localStorage.setItem("CHECKED_IN_TITLES", JSON.stringify(checkedInItems));
    $ionicUser.save();
  };

  var getCheckedInItems = function() { // TODO: take param for user
    return $ionicUser.get("CHECKED_IN_TITLES", {});
    //return JSON.parse($window.localStorage.getItem("CHECKED_IN_TITLES")) || JSON.parse("{}");
  };

  var saveToStream = function(itemToCheckIn) {
    console.log("saveToStream...")
    $ionicDB.connect();
    var streamPosts = $ionicDB.collection('stream');
    streamPosts.store(itemToCheckIn).subscribe(
      function(id) {
        console.log("id value:", id)
        $ionicDB.disconnect();
      },
      function(err) { console.error(err) }
    );
    //$ionicDB.disconnect();
  };

  return {
    saveCheckIn: saveCheckIn,
    getCheckedInItems: getCheckedInItems,
    saveToStream: saveToStream
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

  var getDateString = function() {
    var d = new Date();
    var time = d.getTime()-d.getTimezoneOffset()*60000; // offset in minutes, convert to milliseconds
    var datestr = new Date(time).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
  }

  return {
    displayLoading: displayLoading,
    hideLoading: hideLoading,
    getSimplePopupOptObj: getSimplePopupOptObj,
    getDateString: getDateString
  }

})

.factory('RecentActivity', [function () {

  var dummyData = [{
      id: 0,
      date: "2015-03-25 12:00:00",
      title: "Shawshank Redemption",
      user: "Bob"
    }, {
      id: 1,
      date: "2015-03-24 19:03:54",
      title: "The Matrix",
      user: "Anna"
    }, {
      id: 2,
      date: "2015-03-24 18:54:10",
      title: "Toy Story 2",
      user: "Bob"
    }, {
      id: 3,
      date: "2015-03-23 11:00:00",
      title: "The Lord of the Rings",
      user: "Jim"
    }, {
      id: 4,
      date: "2015-03-22 23:15:11",
      title: "The Blind Side",
      user: "Jim"
    }, {
      id: 5,
      date: "2015-03-22 22:43:34",
      title: "Ted",
      user: "Anna"
    }, {
      id: 6,
      date: "2015-03-22 21:27:28",
      title: "Sponge Bob Square Pants",
      user: "Bob"
    }, {
      id: 7,
      date: "2015-03-22 20:57:44",
      title: "Full Metal Jacket",
      user: "Jim"
    }, {
      id: 8,
      date: "2015-03-22 19:41:05",
      title: "Prometheus",
      user: "Anna"
    }, {
      id: 9,
      date: "2015-03-21 16:14:53",
      title: "Die Hard",
      user: "Jim"
    }];

  return {
    getDummyRecentActivity: function() {
      return dummyData;
    }
  }

}]);
