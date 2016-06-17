angular.module('SMARTLobby.controllers', [])

  .controller('LoginCtrl', function ($scope, $state) {

    $scope.login = function () {
      $state.go('tab.visitors');
    };
  })

  .controller('DashCtrl', function ($rootScope, $scope, $state, APP_CONFIG,
                                    $timeout, TimerService, AppModeService,
                                    $ionicPopup, ionicToast, AppColorThemeService) {

    var flipTimer = null;

    $scope.$on('$ionicView.beforeEnter', function (event, data) {
      if (!AppModeService.getMode()) {
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
      } else {
        $scope.mode = AppModeService.getMode();
      }

      console.log($scope.mode);

      flipTimer = new FlipClock(angular.element(document.querySelector('.avgWaitTimeClock')),
        {
          clockFace: 'MinuteCounter',
          autoStart: false
        });

      if (TimerService.getStoppage()) {
        flipTimer.setTime(TimerService.getStoppage());
      }

      if (TimerService.getTimer().sec) {

        flipTimer.setTime(TimerService.getTimer().sec);
        flipTimer.start();
      }
    });

    $scope.stopTimer = function () {
      if (TimerService.getTimer().timer) {
        flipTimer.stop();
        TimerService.setStoppage(TimerService.getTimer().sec);
        clearTimer();
      }
    };

    function clearTimer() {
      $timeout.cancel(TimerService.getTimer().timer);
      $scope.sec = 0;
      $scope.timer = null;
      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});
    }

    $scope.toggleMode = function () {

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Activating ' + APP_CONFIG.MODE.EMERGENCY + ' mode',
          template: 'Are you sure you want to activate ' + APP_CONFIG.MODE.EMERGENCY + ' mode?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            // Update global timer sec
            updateTimer();

            if (TimerService.getTimer().sec) {

              flipTimer.setTime(TimerService.getTimer().sec);
              flipTimer.start();
            }

            console.log(APP_CONFIG.MODE.EMERGENCY);

            $scope.mode = APP_CONFIG.MODE.EMERGENCY
            ionicToast.show(APP_CONFIG.MODE.EMERGENCY + ' mode', 'middle', false, 1800);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme('bar-assertive', 'tabs-assertive');

          } else {
            // Clear sec and timer
            clearTimer();

            console.log('User cancels. ' + APP_CONFIG.MODE.DEFAULT);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');
          }
        });

      } else {
        // Clear sec and timer
        clearTimer();

        console.log(APP_CONFIG.MODE.DEFAULT);
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
        ionicToast.show(APP_CONFIG.MODE.DEFAULT + ' mode', 'middle', false, 1800);

        // Setting mode
        AppModeService.setMode($scope.mode);

        // Updating tabs and navbar color
        AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');
      }

    };

    // Global timer in emergency mode
    $scope.sec = 0;
    $scope.timer = null;
    var updateTimer = function () {
      $scope.sec++;
      $scope.timer = $timeout(updateTimer, 1000);

      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      console.log(TimerService.getTimer());
    };

  })

  .controller('VisitorsCtrl', function ($rootScope, $scope, $state, Visitors, VisitorStatusService,
                                        $ionicFilterBar, $ionicPopover, $ionicModal,
                                        $ionicPopup, $ionicListDelegate, $window,
                                        localStorageService, ionicToast,
                                        CallService, SMSService, APP_CONFIG,
                                        ContactStatusService, $timeout, TimerService,
                                        AppModeService, AppColorThemeService) {

    $scope.$on('$ionicView.beforeEnter', function (event, data) {
      console.log(APP_CONFIG);

      if (!AppModeService.getMode()) {
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
      } else {
        $scope.mode = AppModeService.getMode();
      }

      // Filter visitors depending on the pie chart legend selection
      var contactStatus = ContactStatusService.getContactStatus();

      if (contactStatus) {
        filterVisitorsByStatus(contactStatus);
      }

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {
        $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();

        $scope.filters = VisitorStatusService.getNormalContactStatusFilters();
      } else {
        $scope.contactStatuses = VisitorStatusService.getEmergencyContactStatuses();

        $scope.filters = VisitorStatusService.getEmergencyContactStatusFilters();
      }

    });


    $scope.groups = [];

    function prepareVisitorsGroups() {
      $scope.groups[0] = {
        name: 'Nick',
        visitors: [],
        isShown: true
      };

      $scope.groups[1] = {
        name: 'Kelvin',
        visitors: [],
        isShown: true
      };

      $scope.groups[2] = {
        name: 'Steven',
        visitors: [],
        isShown: true
      };
    }

    $scope.searchResult = '';

    $scope.toggleGroup = function (group) {
      if ($scope.groups[0].name === group.name) {
        $scope.groups[0].isShown = !$scope.groups[0].isShown;
      }

      if ($scope.groups[1].name === group.name) {
        $scope.groups[1].isShown = !$scope.groups[1].isShown;
      }

      if ($scope.groups[2].name === group.name) {
        $scope.groups[2].isShown = !$scope.groups[2].isShown;
      }
    };


    $scope.bulkMessage = function () {
      SMSService.sendSMS('+65234343434');
    };

    $scope.callHost = function () {
      CallService.callNow('+65234343434');
    };

    $scope.updateAllVisitorsStatuses = function () {
      $ionicModal.fromTemplateUrl('templates/visitor-status-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        modal.show();
      });
    };

    $scope.toggleMode = function () {

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {


        var confirmPopup = $ionicPopup.confirm({
          title: 'Activating ' + APP_CONFIG.MODE.EMERGENCY + ' mode',
          template: 'Are you sure you want to activate ' + APP_CONFIG.MODE.EMERGENCY + ' mode?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            // Update global timer sec
            updateTimer();

            console.log(APP_CONFIG.MODE.EMERGENCY);

            $scope.mode = APP_CONFIG.MODE.EMERGENCY
            ionicToast.show(APP_CONFIG.MODE.EMERGENCY + ' mode', 'middle', false, 1800);

            // Setting mode
            AppModeService.setMode($scope.mode);

            $scope.contactStatuses = VisitorStatusService.getEmergencyContactStatuses();

            $scope.filters = VisitorStatusService.getEmergencyContactStatusFilters();

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme('bar-assertive', 'tabs-assertive');

          } else {
            // Clear sec and timer
            clearTimer();

            console.log('User cancels. ' + APP_CONFIG.MODE.DEFAULT);

            // Setting mode
            AppModeService.setMode($scope.mode);

            $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();

            $scope.filters = VisitorStatusService.getNormalContactStatusFilters();

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');
          }
        });

      } else {
        // Clear sec and timer
        clearTimer();

        console.log(APP_CONFIG.MODE.DEFAULT);
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
        ionicToast.show(APP_CONFIG.MODE.DEFAULT + ' mode', 'middle', false, 1800);

        // Setting mode
        AppModeService.setMode($scope.mode);

        $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();

        $scope.filters = VisitorStatusService.getNormalContactStatusFilters();

        // Updating tabs and navbar color
        AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');
      }

    };

    // Global timer in emergency mode
    $scope.sec = 0;
    $scope.timer = null;
    var updateTimer = function () {
      $scope.sec++;
      $scope.timer = $timeout(updateTimer, 1000);

      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      console.log(TimerService.getTimer());
    };

    function clearTimer() {
      $timeout.cancel(TimerService.getTimer().timer);
      $scope.sec = 0;
      $scope.timer = null;
      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});
    }

    // For updating visitor status options
    $scope.defaultContactStatus = {
      status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED
    };

    // Getting all visitors from web service
    getAllVisitors();

    function filterVisitorsByStatus(status) {
      if (status) {
        angular.forEach($scope.filters, function (filter) {
          if (filter.status.toLowerCase() === status.toLowerCase()) {
            filter.isChecked = true;
          } else {
            filter.isChecked = false;
          }
        });
      }
    }

    function getAllVisitors() {

      Visitors.getAllVisitors().then(function (visitors) {

        //var sortedVisitors = sortVisitorsByName(visitors);

        $scope.visitors = visitors;
        $scope.allVisitors = visitors;

        if (visitors && visitors.length) {
          groupVisitors($scope.visitors);
        }

        // Updated visitors to be used by meeting detail
        Visitors.updateVisitors($scope.visitors);

      }, function (err) {
        console.log(err);
      });
    }

    // Fake static data for testing purpose
    function groupVisitors(visitors) {
      prepareVisitorsGroups();

      angular.forEach(visitors, function (visitor) {
        if (visitor.hostName === 'Nick') {
          $scope.groups[0].visitors.push(visitor);
        } else if (visitor.hostName === 'Kelvin') {
          $scope.groups[1].visitors.push(visitor);
        } else {
          $scope.groups[2].visitors.push(visitor);
        }
      });
    }

    // Filtering visitor list depending on checkbox filter options
    watchFilterChanges();

    function watchFilterChanges() {
      $scope.$watch('filters', function (filters) {
        var filterVisitors = [];

        angular.forEach(filters, function (filter) {
          if (filter.isChecked) {
            angular.forEach($scope.allVisitors, function (visitor) {
              if (filter.status.toLowerCase() === visitor.contactStatus.toLowerCase()) {
                filterVisitors.push(visitor);
              }
            });
          }
        });

        //$scope.groups[0].visitors = sortVisitorsByName(filterVisitors);
        $scope.groups = groupFilteredVisitors(filterVisitors);
      }, true);
    }

    function sortVisitorsByName(visitors) {

      var sortedVisitors = visitors.sort(function (visitor_1, visitor_2) {

        var name_1 = visitor_1.name.toLowerCase();

        var name_2 = visitor_2.name.toLowerCase();

        return (name_1 < name_2) ? -1 : (name_1 > name_2) ? 1 : 0;

      });

      return sortedVisitors;
    }

    $scope.refreshVisitors = function () {
      watchFilterChanges();
    };

    $scope.goToItem = function (meetingID) {
      if (meetingID === 1) {
        $state.go('tab.meeting-detail', {meetingID: meetingID});
      } else {
        $ionicPopup.alert({
          title: 'Meeting Detail',
          template: 'This visitor does not have any meeting detail.'
        });
      }
    };

    $scope.closeStatusModal = function () {
      $scope.modal.remove()
        .then(function () {
          $scope.modal = null;
        });
    };

    $scope.voipServices = VisitorStatusService.getVoIPServices();

    $scope.defaultVoIPService = {
      type: APP_CONFIG.VOIP_SERVICE.SKYPE
    };

    $scope.voip = function (visitor) {
      var url;

      var popup = $ionicPopup.show({
        templateUrl: 'templates/voip-popup.html',
        title: 'VoIP Services',
        subTitle: 'Please select your favorite VoIP service.',
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            type: 'button-light',
            onTap: function (event) {
              return null;
            }
          },
          {
            text: 'OK',
            type: 'button-positive',
            onTap: function (event) {
              return $scope.defaultVoIPService.type;
            }
          }
        ]
      });

      popup.then(function (service) {
        if (service) {
          if (service === APP_CONFIG.VOIP_SERVICE.SKYPE) {
            url = APP_CONFIG.VOIP_SERVICE.SKYPE_URL_SCHEME + visitor.name + '?call';
          } else {
            url = APP_CONFIG.VOIP_SERVICE.JABBER_URL_SCHEME + visitor.contact_1;
          }

          $window.open(url, '_system', 'location=no');
        } else {
          popup.close();
        }

      });

    };

    $scope.checkout = function (visitor) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Checking out Visitor',
        template: 'Are you sure you want to check out this visitor?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log('Visitor is checked out.');
        } else {
          console.log('User cancels.');
        }
      });
    };


    $scope.updateVisitorStatus = function () {

      console.log('Updating checked visitors status to ' + $scope.defaultContactStatus.status);

      angular.forEach($scope.visitors, function (visitor) {
        // $scope.defaultContactStatus.value is value from selected radio item
        if (visitor.isChecked) {
          visitor.contactStatus = $scope.defaultContactStatus.status;
        }
        // Update the visitor list
        watchFilterChanges();
      });

      $scope.modal.remove()
        .then(function () {
          $scope.modal = null;
        });

      // Updated visitors to be used by meeting detail
      Visitors.updateVisitors($scope.visitors);

      // Unchecking all previous checked visitors after updating status
      angular.forEach($scope.visitors, function (visitor) {
        if (visitor.isChecked) {
          visitor.isChecked = false;
        }
      });

      // Firing this event to directive to close left checkbox list
      $rootScope.$broadcast('visitorStatusHasUpdated');
    };

    $scope.showFilterBar = function () {
      $ionicFilterBar.show({
        items: $scope.visitors,
        update: function (filteredItems) {
          console.log(filteredItems);
          //$scope.groups[0].visitors = sortVisitorsByName(filteredItems);
          $scope.groups = groupFilteredVisitors(filteredItems);

          // Show this text when no room is found
          if(!filteredItems.length) {
            $scope.searchResult = 'No Results';
          } else {
            $scope.searchResult = '';
          }
        },
        cancel: function () {
          if($scope.visitors.length) {
            groupVisitors($scope.visitors);
          }

          $scope.searchResult = '';
        }
      });
    };

    function groupFilteredVisitors(filteredItems) {

      if(filteredItems.length !== 0) {
        prepareVisitorsGroups();

        angular.forEach(filteredItems, function (visitor) {
          if (visitor.hostName === 'Nick') {
            $scope.groups[0].visitors.push(visitor);
          } else if (visitor.hostName === 'Kelvin') {
            $scope.groups[1].visitors.push(visitor);
          } else {
            $scope.groups[2].visitors.push(visitor);
          }
        });

        for(var i = $scope.groups.length - 1; i >= 0; i--) {
          if($scope.groups[i].visitors.length === 0) {
            $scope.groups.splice(i,1);
          }
        }

        return $scope.groups;
      } else {
        $scope.searchResult = 'No Results';

        return $scope.groups = [];
      }

    }

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function (popover) {
      $scope.popover = popover;
    });


    $scope.call = function (visitor) {
      CallService.callNow(visitor.contact_1);
    };

    $scope.getVisitorStatus = function (visitor) {
      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {
        return VisitorStatusService.getNormalVisitorStatusColour(visitor);
      } else {
        return VisitorStatusService.getEmergencyVisitorStatusColour(visitor);
      }

    };

    $scope.$on('$ionicView.beforeLeave', function (event, data) {
      // Clearing contact status
      ContactStatusService.setContactStatus(null);
    });

  })

  .controller('MeetingDetailCtrl', function ($scope, $state, $stateParams, Visitors, $ionicActionSheet,
                                             $ionicPopup, $ionicModal, VisitorStatusService,
                                             $window, CallService, SMSService, APP_CONFIG, AppModeService) {

    $scope.meetingDetail = Visitors.getMeetingDetail($stateParams.meetingID);

    console.log($scope.meetingDetail);

    if (AppModeService.getMode() === APP_CONFIG.MODE.DEFAULT) {
      $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();
    } else {
      $scope.contactStatuses = VisitorStatusService.getEmergencyContactStatuses();
    }

    $scope.defaultContactStatus = {
      status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED
    };

    $scope.getVisitorStatus = function (visitor) {

      if (AppModeService.getMode() === APP_CONFIG.MODE.DEFAULT) {
        return VisitorStatusService.getNormalVisitorStatusColour(visitor);
      } else {
        return VisitorStatusService.getEmergencyVisitorStatusColour(visitor);
      }

    };

    $scope.call = function (hostNumber) {
      // Show the action sheet
      $ionicActionSheet.show({
        buttons: [
          {text: 'Call Host'},
          {text: 'Message Host'}
        ],
        destructiveText: 'Emergency Call',
        titleText: '',
        cancelText: 'Cancel',
        cancel: function () {

        },
        buttonClicked: function (index) {
          switch (index) {
            case 0:
              CallService.callNow(hostNumber);
              break;
            case 1:
              SMSService.sendSMS(hostNumber);
              break;
            default:
              break;
          }
          ;
          return true;
        }
      });
    };

    $scope.updateVisitorStatus = function () {
      $scope.modal.remove()
        .then(function () {
          $scope.modal = null;
        });
    };

    $scope.voipServices = VisitorStatusService.getVoIPServices();

    $scope.defaultVoIPService = {
      type: APP_CONFIG.VOIP_SERVICE.SKYPE
    };

    $scope.updateStatus = function (visitor) {
      $ionicActionSheet.show({
        buttons: [
          {text: 'Call ' + visitor.name},
          {text: 'VoIP ' + visitor.name},
          {text: 'Update Status'},
          {text: 'Checkout ' + visitor.name}
        ],
        titleText: '',
        cancelText: 'Cancel',
        cancel: function () {

        },
        buttonClicked: function (index) {

          switch (index) {
            case 0:
              CallService.callNow(visitor.contact_1);
              break;
            case 1:
              var url;

              var popup = $ionicPopup.show({
                templateUrl: 'templates/voip-popup.html',
                title: 'VoIP Services',
                subTitle: 'Please select your favorite VoIP service.',
                scope: $scope,
                buttons: [
                  {
                    text: 'Cancel',
                    type: 'button-light',
                    onTap: function (event) {
                      return null;
                    }
                  },
                  {
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function (event) {
                      return $scope.defaultVoIPService.type;
                    }
                  }
                ]
              });

              popup.then(function (service) {
                if (service) {
                  if (service === APP_CONFIG.VOIP_SERVICE.SKYPE) {
                    url = APP_CONFIG.VOIP_SERVICE.SKYPE_URL_SCHEME + visitor.name + '?call';
                  } else {
                    url = APP_CONFIG.VOIP_SERVICE.JABBER_URL_SCHEME + visitor.contact_1;
                  }

                  $window.open(url, '_system', 'location=no');
                } else {
                  popup.close();
                }

              });
              break;
            case 2:
              $ionicModal.fromTemplateUrl('templates/visitor-status-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
              }).then(function (modal) {
                $scope.modal = modal;
                modal.show();
              });

              $scope.closeStatusModal = function () {
                $scope.modal.remove()
                  .then(function () {
                    $scope.modal = null;
                  });
              };
              break;
            case 3:
              var confirmPopup = $ionicPopup.confirm({
                title: 'Checking out Visitor',
                template: 'Are you sure you want to check out this visitor?'
              });

              confirmPopup.then(function (res) {
                if (res) {
                  console.log('Visitor is checked out.');
                } else {
                  console.log('User cancels.');
                }
              });
              break;
            default:
              console.log('No action');
          }

          return true;
        }
      });
    };

  })

  .controller('SettingsCtrl', function ($scope, $state, $ionicHistory, localStorageService,
                                        $timeout, TimerService, AppModeService,
                                        ionicToast, $ionicPopup, APP_CONFIG,
                                        AppColorThemeService) {

    $scope.$on('$ionicView.beforeEnter', function (event, data) {

      if (!AppModeService.getMode()) {
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
      } else {
        $scope.mode = AppModeService.getMode();
      }

      console.log($scope.mode);
    });

    $scope.toggleMode = function () {

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Activating ' + APP_CONFIG.MODE.EMERGENCY + ' mode',
          template: 'Are you sure you want to activate ' + APP_CONFIG.MODE.EMERGENCY + ' mode?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            // Update global timer sec
            updateTimer();

            console.log(APP_CONFIG.MODE.EMERGENCY);

            $scope.mode = APP_CONFIG.MODE.EMERGENCY
            ionicToast.show(APP_CONFIG.MODE.EMERGENCY + ' mode', 'middle', false, 1800);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme('bar-assertive', 'tabs-assertive');

          } else {
            // Clear sec and timer
            clearTimer(false);

            console.log('User cancels. ' + APP_CONFIG.MODE.DEFAULT);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');
          }
        });

      } else {
        // Clear sec and timer
        clearTimer(false);

        console.log(APP_CONFIG.MODE.DEFAULT);
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
        ionicToast.show(APP_CONFIG.MODE.DEFAULT + ' mode', 'middle', false, 1800);

        // Setting mode
        AppModeService.setMode($scope.mode);

        // Updating tabs and navbar color
        AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');
      }

    };

    // Global timer in emergency mode
    $scope.sec = 0;
    $scope.timer = null;
    var updateTimer = function () {
      $scope.sec++;

      $scope.timer = $timeout(updateTimer, 1000);

      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      console.log(TimerService.getTimer());
    };


    $scope.logOut = function () {
      // Clear all navigation stack history
      $ionicHistory.clearHistory();

      // Clear all the cache views
      $ionicHistory.clearCache();

      // Clear all local storage
      localStorageService.clearAll();

      // Stop global timer
      clearTimer(true);

      // Reset tabs and navbar color to default
      AppColorThemeService.setAppColorTheme('bar-positive', 'tabs-positive');

      // Reset mode to default
      AppModeService.setMode(APP_CONFIG.MODE.DEFAULT);

      // Go back to login view
      $state.go('login');
    };

    function clearTimer(hasLoggedOut) {
      $timeout.cancel(TimerService.getTimer().timer);
      $scope.sec = 0;
      $scope.timer = null;
      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      if (hasLoggedOut) {
        TimerService.setStoppage(0);
      }
    }

  })

  .controller('AppSettingsCtrl', function ($scope, $state, APP_CONFIG) {

    $scope.saveSettings = function () {

    };

    $scope.items = [{
      id: 1,
      label: APP_CONFIG.VOIP_SERVICE.SKYPE
    }, {
      id: 2,
      label: APP_CONFIG.VOIP_SERVICE.JABBER
    }];

    $scope.selectedItem = $scope.items[0].label;

    // Fake sites
    $scope.sites = [{
      id: 1,
      siteName: 'Myanmar'
    }, {
      id: 2,
      siteName: 'Singapore'
    }, {
      id: 3,
      siteName: 'Malaysia'
    }, {
      id: 4,
      siteName: 'Thailand'
    }];

    $scope.selectedSite = $scope.sites[0].siteName;

  })

  .controller('AccountSettingsCtrl', function ($scope, $state) {


  });
