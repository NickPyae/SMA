// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in factories.js
// 'starter.controllers' is found in controllers.js
angular.module('SMARTLobby', ['ionic', 'chart.js', 'jett.ionic.filter.bar', 'LocalStorageModule',
  'SMARTLobby.controllers', 'SMARTLobby.factories', 'SMARTLobby.services',
  'SMARTLobby.directives', 'SMARTLobby.constants'])

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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,
                 $ionicFilterBarConfigProvider, ChartJsProvider, localStorageServiceProvider) {


  // Global local storage settings
  localStorageServiceProvider
    .setPrefix('SMARTLobby')
    .setStorageType('localStorage')
    .setNotify(true, true);

  // Enable native scrolling in android as well as removing scrollbar indicator
  $ionicConfigProvider.scrolling.jsScrolling(true);

  // Overlay visitor list
  $ionicFilterBarConfigProvider.backdrop(true);

  // Search bar transition horizontally from right to left
  $ionicFilterBarConfigProvider.transition('horizontal');

  // Configure all charts
  ChartJsProvider.setOptions({
    colours: ['#736F6E', '#FF0000', '#FFC200', '#008000'],
    responsive: true
  });

  // Configure all line charts
  ChartJsProvider.setOptions('Line', {
    colours: ['#FFC200', '#008000'],
    responsive: true
  });


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('login', {
      url: '/login',
      cache: false,
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.dash', {
    url: '/dash',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.visitors', {
      url: '/visitors/:status',
      cache: false,
      views: {
        'tab-visitors': {
          templateUrl: 'templates/tab-visitors.html',
          controller: 'VisitorsCtrl'
        }
      }
    })
    .state('tab.meeting-detail', {
      url: '/visitors/:meetingID',
      cache: false,
      views: {
        'tab-visitors': {
          templateUrl: 'templates/meeting-detail.html',
          controller: 'MeetingDetailCtrl'
        }
      }
    })

  .state('tab.settings', {
    url: '/settings',
    cache: false,
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('tab.app-settings',{
    url: '/app-settings',
    cache:false,
    views:{
      'tab-settings': {
        templateUrl: 'templates/app-settings.html',
        controller: 'AppSettingsCtrl'
      }
    }
  })

  .state('tab.account-settings', {
    url: '/account-settings',
      cache: false,
      views: {
        'tab-settings': {
          templateUrl: 'templates/account-settings.html',
          controller: 'AccountSettingsCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
