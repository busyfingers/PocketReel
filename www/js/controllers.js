var imdb = require('imdb-api');

angular.module('pocketreel.controllers', [])

.controller('DashCtrl', ['$scope', 'RecentActivity', function($scope, RecentActivity) {
  $scope.dummyData = RecentActivity.getDummyRecentActivity();
}])

.controller('CheckInCtrl', ['$rootScope', '$scope', 'UtilService', '$ionicPopup', function($rootScope, $scope, UtilService, $ionicPopup) {
  //$scope.chats = Chats.all();

  $scope.searchTitle = function(queryText) {

    //if (queryText.length >= 3 && (new Date().getTime()-$scope.lastSearchAt >= 500 || !$scope.lastSearchAt)) {
      //console.log("ok", "len: " + queryText.length, "lastsearch: " + $scope.lastSearchAt)
      $scope.lastSearchAt = new Date().getTime();

      UtilService.displayLoading();
    
      imdb.getReq({ name: queryText }).then(function(data) {
        if (data) {
          UtilService.hideLoading();
          console.log(data)
          console.log(data.constructor.name)
          $scope.resultType = data.constructor.name
          $rootScope.searchResults = [ data ];

          if (data.constructor.name === "TVShow") {
            data.episodes().then(function(episodes) {
                return $rootScope.searchResultDetails = [ episodes ];
            });
          }
        }

      }).catch(function(err) {
        var popupOptions = "";
        if (err.RequestError) {
          popupOptions = UtilService.getSimplePopupOptObj("Check your connection or try again later", "Service not available");
        } else {
          popupOptions = UtilService.getSimplePopupOptObj("Try another search phrase", "Nothing found");
        }
        UtilService.hideLoading();
        $ionicPopup.alert(popupOptions);

        $rootScope.searchResults = "";
        $rootScope.searchResultDetails = "";
        console.log("ERR: ", err)
      });
      

    //}
  };

  $scope.checkIn = function(titleInfo) {
    console.log("Checkin:", titleInfo.constructor.name, titleInfo.title)
  };


}])

.controller('CheckInDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicPopup', 'UtilService', 'DataService', '$state',
  function($scope, $rootScope, $stateParams, $ionicPopup, UtilService, DataService, $state) {
  $scope.userScore = 50;
  for (index in $rootScope.searchResults) {
    if ($rootScope.searchResults[index].imdbid === $stateParams.checkInTitleId)
      $scope.titleInfo = $rootScope.searchResults[index];
  }

  $scope.confirmCheckIn = function() {

    // TODO: save data to some DB via service. Maybe display a new view that confirms the check-in and also shows badges, if there are any?
    DataService.saveCheckIn({
      "title": $scope.titleInfo,
      "score": $scope.userScore,
      "time:": UtilService.getDateString()
    });
    var msg = `Gave title ${$scope.titleInfo.title} a score of ${$scope.userScore}`;
    console.log(msg);
    var popupOptions = UtilService.getSimplePopupOptObj(msg, "Check-in complete!");
    $ionicPopup.alert(popupOptions).then(function() { $state.go('tab.checkIn') });
  };

}])

.controller('MyCheckInsCtrl', ['$window', 'DataService', function($window, DataService) {
  $scope.myCheckedInItems = DataService.getCheckedInItems();
}])

// starter biolerplate
.controller('ChatsCtrl', ['$scope', 'Chats', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
}])

.controller('ChatDetailCtrl', ['$scope', '$stateParams', 'Chats', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
}])

.controller('AccountCtrl', ['$scope', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
//starter biolerplate

}]);
