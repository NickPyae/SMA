angular.module('SMARTLobby.controllers', [])

  .controller('LoginCtrl', function ($scope, $state) {

    $scope.login = function () {
      $state.go('tab.visitors');
    };
  })

  .controller('DashCtrl', function ($scope, $state, APP_CONFIG) {

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.labels = [
        APP_CONFIG.CONTACT_STATUS.UNCONTACTED,
        APP_CONFIG.CONTACT_STATUS.NO_REPLY,
        APP_CONFIG.CONTACT_STATUS.IN_BUILDING,
        APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING
      ];

      $scope.data = ['12', '10', '12', '7'];
      $scope.type = 'Pie';
      $scope.isToggled = false;

      $scope.toggle = function () {
        $scope.isToggled = !$scope.isToggled;
        $scope.type = $scope.type === 'Pie' ?
          'PolarArea' : 'Pie';
      };

      $scope.onClick = function (points, evt) {
        //console.log(points, evt);
        //console.log(points[0].label);
        //console.log(points[0].value);

        switch (points[0].label) {
          case APP_CONFIG.CONTACT_STATUS.UNCONTACTED:
            $state.go('tab.visitors', {status: points[0].label});
                break;
          case APP_CONFIG.CONTACT_STATUS.NO_REPLY:
            $state.go('tab.visitors', {status: points[0].label});
                break;
          case APP_CONFIG.CONTACT_STATUS.IN_BUILDING:
            $state.go('tab.visitors', {status: points[0].label});
                break;
          case APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING:
            $state.go('tab.visitors', {status: points[0].label});
                break;
          default:
            $state.go('tab.dash');
                break;
        }

      };
      $scope.linelabels = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm'];
      $scope.lineseries = ['Check In', 'Check Out'];
      $scope.linedata = [
        [10, 8, 3, 9, 7, 6, 10, 4, 9, 8, 5, 6, 4],
        [0, 0, 0, 0, 0, 0, 1, 3, 4, 6, 10, 3, 2]
      ];
    });

  })

  .controller('VisitorsCtrl', function ($scope, $state, $stateParams, Visitors, VisitorStatusService,
                                        $ionicFilterBar, $ionicPopover, $ionicModal,
                                        $ionicPopup, $ionicListDelegate, $window, localStorageService, APP_CONFIG) {

    console.log(APP_CONFIG);
    console.log($stateParams.status);

    $scope.contactStatuses = VisitorStatusService.getContactStatuses();

    $scope.filters = VisitorStatusService.getContactStatusFilters();

    // For updating visitor status options
    $scope.defaultContactStatus = {
      status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED
    };

    // Getting all visitors from web service
    getAllVisitors();

    // Filter visitors depending on the pie chart selected
    updateFilterOption();

    function updateFilterOption() {
        switch ($stateParams.status) {
          case APP_CONFIG.CONTACT_STATUS.UNCONTACTED:
            filterVisitorsByStatus($stateParams.status);
            break;
          case APP_CONFIG.CONTACT_STATUS.NO_REPLY:
            filterVisitorsByStatus($stateParams.status);
            break;
          case APP_CONFIG.CONTACT_STATUS.IN_BUILDING:
            filterVisitorsByStatus($stateParams.status);
            break;
          case APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING:
            filterVisitorsByStatus($stateParams.status);
            break;
          default:
            filterVisitorsByStatus($stateParams.status);
            break;
        }
    }

    function filterVisitorsByStatus(status) {
      if(status) {
        angular.forEach($scope.filters, function (filter) {
          if(filter.status.toLowerCase() === status.toLowerCase()) {
            filter.isChecked = true;
          } else {
            filter.isChecked = false;
          }
        });
      }
    }

    function getAllVisitors() {

      Visitors.getAllVisitors().then(function (visitors) {
        console.log(visitors);

        var sortedVisitors = sortVisitorsByName(visitors);

        $scope.visitors = sortedVisitors;
        $scope.allVisitors = sortedVisitors;

        // Updated visitors to be used by meeting detail
        Visitors.updateVisitors($scope.visitors);

        // Show this text when no visitor is found
        $scope.searchResult = 'No Results';
      }, function (err) {
        console.log(err);
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

        $scope.visitors = sortVisitorsByName(filterVisitors);
      }, true);
    }

    function sortVisitorsByName(visitors) {

      var sortedVisitors = visitors.sort(function(visitor_1, visitor_2) {

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

    $scope.updateStatus = function (visitor) {
      $ionicModal.fromTemplateUrl('templates/visitor-status-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.visitor = visitor;
        modal.show();
      });

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
            text: '',
            type: 'button-assertive icon ion-close-round',
            onTap: function (event) {
              return null;
            }
          },
          {
            text: '',
            type: 'button-positive icon ion-checkmark-round',
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

    $scope.updateVisitorStatus = function () {
      angular.forEach($scope.visitors, function (visitor) {

        // Current selected visitor is $scope.visitor
        if (visitor.id === $scope.visitor.id) {
          // $scope.defaultContactStatus.value is value from selected radio item
          visitor.contactStatus = $scope.defaultContactStatus.status;

          // Update the visitor list
          watchFilterChanges();
        }
      });

      // Updated visitors to be used by meeting detail
      Visitors.updateVisitors($scope.visitors);

      $scope.modal.remove()
        .then(function () {
          $scope.modal = null;
        });

      $ionicListDelegate.closeOptionButtons();
    };

    $scope.showFilterBar = function () {
      $ionicFilterBar.show({
        items: $scope.visitors,
        update: function (filteredItems) {
          $scope.visitors = sortVisitorsByName(filteredItems);
        }
      });
    };

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function (popover) {
      $scope.popover = popover;
    });


    $scope.call = function (visitor) {
      $window.open('tel:' + visitor.contact_1, '_system', 'location=no');
    };

    $scope.getVisitorStatus = function (visitor) {
      return VisitorStatusService.getVisitorStatusColour(visitor);
    };
  })

  .controller('MeetingDetailCtrl', function ($scope, $state, $stateParams, Visitors, $ionicActionSheet,
                                             $ionicPopup, $ionicModal, VisitorStatusService, $window, APP_CONFIG) {

    $scope.meetingDetail = Visitors.getMeetingDetail($stateParams.meetingID);

    console.log($scope.meetingDetail);

    $scope.contactStatuses = VisitorStatusService.getContactStatuses();

    $scope.defaultContactStatus = {
      status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED
    };

    $scope.getVisitorStatus = function (visitor) {
      return VisitorStatusService.getVisitorStatusColour(visitor);
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
          switch(index) {
            case 0:
              $window.open('tel:' + hostNumber, '_system', 'location=no');
                  break;
            case 1:
              var url;

              if (ionic.Platform.isIOS()) {
                url = 'sms:' + hostNumber + '&body=' + encodeURIComponent('Message');

              } else {
                url = 'sms:' + hostNumber + '?body=' + encodeURIComponent('Message');
              }

              $window.open(url, '_system', 'location=no');
                  break;
            default:
                  break;
          };
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

    $scope.updateStatus = function (visitor) {
      $ionicActionSheet.show({
        buttons: [
          {text: 'Call ' + visitor.name},
          {text: 'VoIP ' + visitor.name},
          {text: 'Update Status'}
        ],
        titleText: '',
        cancelText: 'Cancel',
        cancel: function () {

        },
        buttonClicked: function (index) {

          if(index === 0) {
              console.log('Calling visitor');
          }

          if(index === 1) {
              console.log('VoIPing visitor');
          }

          if (index === 2) {

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
          }

          return true;
        }
      });
    };

  })

  .controller('SettingsCtrl', function ($scope, $state, $ionicHistory, localStorageService) {

    $scope.logOut = function () {
      // Clear all navigation stack history
      $ionicHistory.clearHistory();

      localStorageService.clearAll();

      $state.go('login');
    };
  })

  .controller('AppSettingsCtrl', function ($scope, $state, APP_CONFIG) {

    $scope.saveSettings = function() {

    };

    $scope.items = [{
      id: 1,
      label: APP_CONFIG.VOIP_SERVICE.SKYPE
    }, {
      id: 2,
      label: APP_CONFIG.VOIP_SERVICE.JABBER
    }];

    $scope.selectedItem = $scope.items[0].label;

    $scope.modes = [{
      id: 1,
      label: APP_CONFIG.MODE.DEFAULT
    }, {
      id: 2,
      label: APP_CONFIG.MODE.EMERGENCY
    }];

    $scope.selectedMode = $scope.modes[0].label;

  })

  .controller('AccountSettingsCtrl', function ($scope, $state) {


  });
