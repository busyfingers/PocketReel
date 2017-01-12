// For browserify
require('./controllers');
require('./services');

angular.module('pocketreel', ['ionic', 'ionic.cloud', 'pocketreel.controllers', 'pocketreel.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicCloudProvider) {

  $ionicCloudProvider.init({
    "core": {
      "app_id": "5ed34377"
    }
  });

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // Authentication views
  .state('auth', {
        url: "/auth",
        abstract: true,
        templateUrl: "templates/auth.html"
    })
    .state('auth.signin', {
        url: '/signin',
        views: {
            'auth-signin': {
                templateUrl: 'templates/auth-signin.html',
                controller: 'SignInCtrl'
            }
        }
    })
    .state('auth.signup', {
        url: '/signup',
        views: {
            'auth-signup': {
                templateUrl: 'templates/auth-signup.html',
                controller: 'SignUpCtrl'
            }
        }
    })

  // App views/tabs
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: './templates/tabs.html'
  })

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: './templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.checkIn', {
      url: '/checkIn',
      views: {
        'tab-checkIn': {
          templateUrl: './templates/tab-checkIn.html',
          controller: 'CheckInCtrl'
        }
      }
  }).state('tab.checkIn-detail', {
    url: '/checkIn/:checkInTitleId',
    views: {
      'tab-checkIn': {
        templateUrl: './templates/checkIn-detail.html',
        controller: 'CheckInDetailCtrl'
      }
    }
  })

  .state('tab.myCheckIns', {
    url: '/myCheckIns',
    cache: false,
    views: {
      'tab-myCheckIns': {
        templateUrl: './templates/tab-myCheckIns.html',
        controller: 'MyCheckInsCtrl'
      }
    }
  }).state('tab.myBadges', {
    url: '/myCheckIns/myBadges',
    cache: false,
    views: {
      'tab-myCheckIns': {
        templateUrl: './templates/tab-myBadges.html',
        controller: 'MyBadgesCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });


  // starter biolerplate
  /*
  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });
  */
  // started biolerplate

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth/signin');

});
