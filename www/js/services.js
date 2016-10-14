angular.module('pocketreel.services', [])

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

  return {
    displayLoading: displayLoading,
    hideLoading: hideLoading,
    getSimplePopupOptObj: getSimplePopupOptObj
  }

})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
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
