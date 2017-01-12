var imdb = require('imdb-api');

angular.module('pocketreel.controllers', ['ionic.cloud'])

.controller('SignInCtrl', function($scope, $ionicAuth, $ionicUser, $state, UtilService, $ionicPopup) {

  if ($ionicAuth.isAuthenticated()) {
    $state.go('tab.dash');
  }

  $scope.validateUser = function(userCredentials) {
    var details = {'email': userCredentials.mail, 'password': userCredentials.password};

    $ionicAuth.login('basic', details).then(function() {
      $state.go('tab.dash');
    }).catch(function(err) {
      var popupOptions;

      if (err.status === 401)
        popupOptions = UtilService.getSimplePopupOptObj("Invalid login credentials", "Sign in error");
      else
        popupOptions = UtilService.getSimplePopupOptObj("Error code: " + err.status + "\nMessage: " + err.message, "Sign in error");
       
      $ionicPopup.alert(popupOptions);
    });
  };
  
})

.controller('SignUpCtrl', function($scope, $state, $ionicAuth, $ionicUser, $ionicPopup, UtilService) {

  $scope.signup = function(newUserCredentials) {

    if (!newUserCredentials || !newUserCredentials.mail || !newUserCredentials.password) {
      var popupOptions = UtilService.getSimplePopupOptObj("You need to fill in both e-mail and password", "Signup error");
      $ionicPopup.alert(popupOptions);
    } else {
    
    var details = {'email': newUserCredentials.mail, 'password': newUserCredentials.password};
    var popupOptions;

    $ionicAuth.signup(details).then(function() {
      popupOptions = UtilService.getSimplePopupOptObj("You can now login using your credentials.", "Signup successful");
      $ionicPopup.alert(popupOptions).then(function() {
        $state.go('auth.signin');
      });
    }, function(err) {
      
      for (var e of err.details) {
          if (e === 'conflict_email') {
            popupOptions = UtilService.getSimplePopupOptObj("Email already exists.", "Signup error");
          } else if (e === 'invalid_email') {
            popupOptions = UtilService.getSimplePopupOptObj("Invalid e-mail.", "Signup error");
          } else {
            // TODO: add cases for other error messages
            // https://docs.ionic.io/services/auth/
            popupOptions = UtilService.getSimplePopupOptObj(e, "Signup error");
          }
          $ionicPopup.alert(popupOptions);
      }
    });
   };
  };
})

.controller('DashCtrl', ['$scope', 'RecentActivity', function($scope, RecentActivity) {
  $scope.dummyData = RecentActivity.getDummyRecentActivity();
}])

.controller('CheckInCtrl', ['$rootScope', '$scope', 'UtilService', '$ionicPopup', function($rootScope, $scope, UtilService, $ionicPopup) {

  $scope.searchParams = {};

  $scope.searchTitle = function() {
      $scope.lastSearchAt = new Date().getTime();

      UtilService.displayLoading();
    
      imdb.getReq({ name: $scope.searchParams.searchText }).then(function(data) {
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
    $scope.searchParams.searchText = "";
  };

}])

.controller('CheckInDetailCtrl', ['$scope', '$rootScope', '$stateParams', '$ionicPopup', 'UtilService', 'DataService', '$state', '$ionicHistory',
  function($scope, $rootScope, $stateParams, $ionicPopup, UtilService, DataService, $state, $ionicHistory) {
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
    });

    // .then(function () {
      var msg = `You gave title ${$scope.titleInfo.title} a score of ${userScore}`;
      var popupOptions = UtilService.getSimplePopupOptObj(msg, "Check-in complete!");
      $rootScope.searchResults = [];
      $rootScope.searchResultDetails = [];
      $ionicHistory.goBack();
      $ionicPopup.alert(popupOptions).then(function() {
        $state.go('tab.myCheckIns');
      });
    //});

  };

}])

.controller('MyCheckInsCtrl', ['$scope', '$window', 'DataService', function($scope, $window, DataService) {
  $scope.myCheckedInItems = DataService.getCheckedInItems();

  $scope.showPlaceHolder = function() {
    return Object.keys($scope.myCheckedInItems).length < 1 ? true : false
  };

  $scope.openLink = function(url) {
    cordova.InAppBrowser.open(url, '_system', 'location=yes');
  };

}])

.controller('MyBadgesCtrl', ['$scope', function($scope) {
 

}])

.controller('AccountCtrl', function($state, $scope, $ionicAuth) {
  $scope.logout = function() {
    $ionicAuth.logout();
    $state.go('auth.signin');
  };
});
