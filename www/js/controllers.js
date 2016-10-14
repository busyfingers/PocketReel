var imdb = require('imdb-api');

angular.module('pocketreel.controllers', [])

.controller('DashCtrl', ['$scope', 'RecentActivity', function($scope, RecentActivity) {
  $scope.dummyData = RecentActivity.getDummyRecentActivity();
}])

.controller('CheckInCtrl', ['$scope', 'UtilService', '$ionicPopup', function($scope, UtilService, $ionicPopup) {
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
          $scope.searchResults = [ data ];

          if (data.constructor.name === "TVShow") {
            data.episodes().then(function(episodes) {
                return $scope.searchResultDetails = [ episodes ];
            });
          }
        }

      }).catch(function(err) {
        var popupOptions = UtilService.getSimplePopupOptObj("Try another search phrase", "Nothing found");
        UtilService.hideLoading();
        $ionicPopup.alert(popupOptions);

        $scope.searchResults = "";
        $scope.searchResultDetails = "";
        console.log("ERR: ", err)
      });
      

    //}
  }; 
}])

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
}]);
