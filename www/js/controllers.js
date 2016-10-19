var imdb = require('imdb-api');

angular.module('pocketreel.controllers', [])

.controller('DashCtrl', ['$scope', 'RecentActivity', function($scope, RecentActivity) {
  $scope.dummyData = RecentActivity.getDummyRecentActivity();
}])

.controller('CheckInCtrl', ['$rootScope', '$scope', 'UtilService', '$ionicPopup', function($rootScope, $scope, UtilService, $ionicPopup) {

  $scope.searchTitle = function(queryText) {
      $scope.lastSearchAt = new Date().getTime();

      UtilService.displayLoading();
    
      imdb.getReq({ name: queryText }).then(function(data) {
        if (data) {
          UtilService.hideLoading();
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

  $scope.clearInput = function() {
    $scope.searchText = "";
  };

}])

.controller('CheckInDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicPopup', 'UtilService', 'DataService', '$state',
  function($scope, $rootScope, $stateParams, $ionicPopup, UtilService, DataService, $state) {
  $scope.userScore = 50;
  for (index in $rootScope.searchResults) {
    if ($rootScope.searchResults[index].imdbid === $stateParams.checkInTitleId)
      $scope.titleInfo = $rootScope.searchResults[index];
  }

  $scope.confirmCheckIn = function(userScore) {
    // TODO: save data to some DB via service. Maybe display a new view that confirms the check-in and also shows badges, if there are any?
    DataService.saveCheckIn({
      "imdbid": $scope.titleInfo.imdbid,
      "title": $scope.titleInfo.title,
      "poster": $scope.titleInfo.poster,
      "imdburl": $scope.titleInfo.imdburl,
      "userScore": userScore,
      "time": UtilService.getDateString()
    })
    // .then(function () {
      var msg = `You gave title ${$scope.titleInfo.title} a score of ${userScore}`;
      var popupOptions = UtilService.getSimplePopupOptObj(msg, "Check-in complete!");
      $rootScope.searchResults = [];
      $rootScope.searchResultDetails = [];
      $rootScope.searchText = "";
      $ionicPopup.alert(popupOptions).then(function() {
        $state.go('tab.myCheckIns');
      });
    //});

  };

}])

.controller('MyCheckInsCtrl', ['$scope', '$window', 'DataService', function($scope, $window, DataService) {
  $scope.myCheckedInItems = DataService.getCheckedInItems();

  $scope.openLink = function(url) {
    window.open(url, '_system', 'location=yes');
  };

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
