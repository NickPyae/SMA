angular.module('SMA.controllers', [])

  .controller('LoginCtrl', ['$scope', '$state', 'FinesseFactory', 'MaskFactory',
    function ($scope, $state, FinesseFactory, MaskFactory) {

    // User credentials to be used for sign in
    $scope.userID = '';
    $scope.pw = '';
    $scope.ip = 'finesse1.dcloud.cisco.com';
    $scope.extension = '';
    $scope.phone = '';

    $scope.signInAsAgent = {
      isTurnedOn: false
    };

    // Connection modes to be used when signing in as agent
    $scope.connectionModes = [
      {
        type: 'NAILED_CONNECTION',
        label: 'Always Connected'
      },
      {
        type: 'CALL_BY_CALL',
        label: 'Call by Call'
      }
    ];

    $scope.selectedConnectionMode = $scope.connectionModes[0];

    $scope.onSelectConnectionModeChange = function (selectedConnectionMode) {
      $scope.selectedConnectionMode = selectedConnectionMode;
    };

    // Sign in
    $scope.signIn = function (userID, pw, ip, extension, connectionMode, phone) {

      // Uncomment this line to test with local json file
      //$state.go('tab.agent');

      MaskFactory.loadingMask(true, 'Loading');

      FinesseFactory.signIn(ip, userID, pw, extension, connectionMode.type, phone).then(function (data) {
        if (data.status === 202) {
          MaskFactory.loadingMask(false);
          $state.go('tab.agent');
        }

      }, function (error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error logging in.');
      });
    };

  }])

  .controller('AgentCtrl', ['$scope', '$q', '$ionicHistory', '$state', 'FinesseFactory', 'localStorageService', 'MaskFactory',
    function ($scope, $q, $ionicHistory, $state, FinesseFactory, localStorageService, MaskFactory) {

    // Init user states
    initUserStates();

    function initUserStates() {
      // Get all NOT_READY and LOGOUT reason codes
      var promise1 = FinesseFactory.getNotReadyReasonCodes().then();
      var promise2 = FinesseFactory.getLogoutReasonCodes().then();

      // Get signed in user state
      var promise3 = FinesseFactory.getUserStatus().then();

      // Combines multiple promises into a single promise and resolve
      $q.all([promise1, promise2, promise3]).then(function (data) {

        var notReadyReasonCodes = data[0];
        var logoutReasonCodes = data[1];
        var currentUserState = data[2];

        if (notReadyReasonCodes.length !== 0 && logoutReasonCodes.length !== 0) {

          // Array defaultUserStates to keep all the reason codes
          $scope.defaultUserStates = [];

          // Array allStates to keep all the reason codes as backup
          $scope.allStates = [];

          // NOT_READY by default
          $scope.defaultUserStates.push({
            category: 'NOT_READY',
            reasonCodeId: null,
            label: 'NOT_READY',
            statusColor: '#FF4500'
          });

          angular.forEach(notReadyReasonCodes, function (item) {
            var splitUri = item.uri.split('/');
            var notReadyCode = splitUri[splitUri.length - 1];
            $scope.defaultUserStates.push({
              category: item.category,
              reasonCodeId: notReadyCode,
              label: item.category + ': ' + item.label,
              statusColor: '#FF4500'
            });
          });

          $scope.defaultUserStates.push({
            category: 'READY',
            reasonCodeId: null,
            label: 'READY',
            statusColor: '#33cd5f'
          });

          angular.forEach(logoutReasonCodes, function (item) {
            var splitUri = item.uri.split('/');
            var logoutCode = splitUri[splitUri.length - 1];
            $scope.defaultUserStates.push({
              category: item.category,
              reasonCodeId: logoutCode,
              label: item.category + ': ' + item.label,
              statusColor: '#FF4500'
            });
          });

          $scope.allStates = $scope.defaultUserStates;
        }

        updateUserState(currentUserState);
      });
    }

    function updateUserState(currentUserState) {
      if (localStorageService.get('CALL') === 'MAKE_CALL') {
        setUserState(currentUserState);

      } else if (localStorageService.get('CALL') === 'END_CALL') {
        setUserState(currentUserState);

        localStorageService.remove('CALL');
      } else if (localStorageService.get('USER_STATE')) {
        // Get user state from localStorage
        var userState = JSON.parse(localStorageService.get('USER_STATE'));

        angular.forEach($scope.defaultUserStates, function (item) {
          if (item.label === userState.label) {
            $scope.selectedUserState = item;
            $scope.surveyStatus = item.category + ' SURVEY';
            $scope.statusColor = item.statusColor;
          }
        });

        // Filter user states
        filterUserStates(userState);
      } else {
        $scope.selectedUserState = $scope.defaultUserStates[0];
        $scope.surveyStatus = $scope.selectedUserState.category + ' SURVEY';
        $scope.statusColor = $scope.selectedUserState.statusColor;
      }
    }

    $scope.isUserInTalkingState = function() {
      return localStorageService.get('CALL') === 'MAKE_CALL';
    };

    $scope.onSelectUserStateChange = function (userState) {

      // Uncomment to test with local json file
      //if(userState) {
      //
      //  filterUserStates(userState);
      //
      //  $scope.selectedUserState = userState;
      //  $scope.surveyStatus = userState.category + ' SURVEY';
      //  $scope.statusColor = userState.statusColor;
      //  localStorageService.set('USER_STATE', JSON.stringify(userState));
      //}


      MaskFactory.loadingMask(true, 'Loading');

      FinesseFactory.changeAgentState(userState.category, userState.reasonCodeId).then(function (data) {

        if(userState) {
          // Filter user states
          filterUserStates(userState);

          $scope.selectedUserState = userState;
          $scope.surveyStatus = userState.category + ' SURVEY';
          $scope.statusColor = userState.statusColor;
          localStorageService.set('USER_STATE', JSON.stringify(userState));

          if (userState.category === 'LOGOUT') {
            MaskFactory.loadingMask(false);

            // Clear all navigation stack history
            $ionicHistory.clearHistory();

            // Clear all the cache views
            $ionicHistory.clearCache();

            // Clear all local storage
            localStorageService.clearAll();

            // Go back to login view
            $state.go('login');
          }
        }

        MaskFactory.loadingMask(false);
      }, function (error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Updating Agent State.');
      });
    };

    function setUserState(currentUserState) {
      if (currentUserState) {
        if (currentUserState.hasOwnProperty('reasonCode')) {
          var splitUri = currentUserState.reasonCode.uri.split('/');
          var hangupCode = splitUri[splitUri.length - 1];
          angular.forEach($scope.defaultUserStates, function (item) {

            if (item.reasonCodeId === hangupCode) {

              $scope.selectedUserState = item;
              $scope.surveyStatus = item.category + ' SURVEY';
              $scope.statusColor = item.statusColor;
            }
          });
        } else {
          var newState = {
            category: currentUserState.state,
            reasonCodeId: null,
            label: currentUserState.state,
            statusColor: '#F0F065'
          };

          $scope.defaultUserStates.push(newState);

          var index = $scope.defaultUserStates.indexOf(newState);

          $scope.selectedUserState = $scope.defaultUserStates[index];
          $scope.surveyStatus = $scope.defaultUserStates[index].category + ' SURVEY';
          $scope.statusColor = $scope.defaultUserStates[index].statusColor;
        }
      }
    }

    function filterUserStates(userState) {

      var filteredReasonCodes = [];

      // When in NOT_READY state, all categories have to be displayed.
      if (userState.category === 'NOT_READY' && userState.reasonCodeId) {

        // Remove default NOT_READY when one of the categories is selected.
        angular.forEach($scope.allStates, function (state) {
          if (state.category === 'NOT_READY' && state.reasonCodeId === null) {
            $scope.allStates.shift();
          }
        });

        $scope.defaultUserStates = $scope.allStates;
      } else if (userState.category === 'READY') {

        angular.forEach($scope.defaultUserStates, function (state) {
          // When in READY state, all LOGOUT categories have to be hidden.
          if (state.category !== 'LOGOUT') {
            filteredReasonCodes.push(state);
          }

          // Remove default NOT_READY when one of the categories is selected.
          if (state.category === 'NOT_READY' && state.reasonCodeId === null) {
            filteredReasonCodes.shift();
          }
        });

        $scope.defaultUserStates = filteredReasonCodes;
      }
    }

    $scope.answerCall = function () {
      MaskFactory.loadingMask(true, 'Answering Call');

      FinesseFactory.getDialogID().then(function (dialogID) {
        if (dialogID) {
          FinesseFactory.answerCall(dialogID).then(function (data) {
            if (data.status === 202) {

              MaskFactory.loadingMask(false);
            }
          }, function (error) {
            MaskFactory.loadingMask(false);
            MaskFactory.showMask(MaskFactory.error, 'Error Answering Call.');
          });
        }

        MaskFactory.loadingMask(false);
      }, function (error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Answering Call.');
      });
    };

    $scope.endCall = function () {
      // Uncomment these 2 lines to test with local json file
      //localStorageService.set('CALL', 'END_CALL');
      //initUserStates();

      MaskFactory.loadingMask(true, 'Ending Call');

      FinesseFactory.getDialogID().then(function (dialogID) {

        if (dialogID) {
          FinesseFactory.endCall(dialogID).then(function (data) {
            if (data.status === 202) {
              localStorageService.set('CALL', 'END_CALL');

              initUserStates();

              MaskFactory.loadingMask(false);
            }
          }, function (error) {
            MaskFactory.loadingMask(false);
            MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
          });
        }

        MaskFactory.loadingMask(false);
      }, function (error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
      });
    };

    // Array queues to keep all the queues for signed in user
    $scope.queues = [];

    // Get all  the queues for signed in user
    getQueueForUser();

    function getQueueForUser() {
      MaskFactory.loadingMask(true, 'Getting Queue Numbers');

      FinesseFactory.getListOfQueues().then(function (queues) {
        angular.forEach(queues, function (queue) {
          $scope.queues.push(queue);
        });

        MaskFactory.loadingMask(false);
      }, function (error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Getting Queue Numbers.');
      });
    }

  }])

  .controller('SurveyCtrl', ['$scope', '$sce', 'MaskFactory', 'FinesseFactory', 'localStorageService',
    function ($scope, $sce, MaskFactory, FinesseFactory, localStorageService) {

    $scope.phone = '';

    $scope.isUserInTalkingState = function() {
      return localStorageService.get('CALL') === 'MAKE_CALL';
    };

    $scope.makeACall = function (phone) {
      // Uncomment this line to test with local json file
      //localStorageService.set('CALL', 'MAKE_CALL');

      MaskFactory.loadingMask(true, 'Making Call');

      FinesseFactory.changeAgentState('NOT_READY', 4).then(function () {
        FinesseFactory.makeACall(phone).then(function (data) {
          if (data.status === 202) {
            localStorageService.set('CALL', 'MAKE_CALL');

            MaskFactory.loadingMask(false);
          }
        }, function (error) {
          MaskFactory.loadingMask(false);
          MaskFactory.showMask(MaskFactory.error, 'Error Making Call.');
        });
      });
    };

    $scope.endCall = function () {
      // Uncomment this line to test with local json file
      //localStorageService.set('CALL', 'END_CALL');

      MaskFactory.loadingMask(true, 'Ending Call');

      FinesseFactory.getDialogID().then(function (dialogID) {
        if (dialogID) {
          FinesseFactory.endCall(dialogID).then(function (data) {
            if (data.status === 202) {
              localStorageService.set('CALL', 'END_CALL');

              MaskFactory.loadingMask(false);
            }
          }, function (error) {
            MaskFactory.loadingMask(false);
            MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
          });
        }

        MaskFactory.loadingMask(false);
      }, function (error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
      });
    };


    // Load surveymonkey content into iFrame
    if (localStorageService.get('SURVEY_URL')) {
      $scope.iFrameURL = $sce.trustAsResourceUrl(localStorageService.get('SURVEY_URL'));
    } else {
      $scope.iFrameURL = $sce.trustAsResourceUrl('');
    }

  }])


  .controller('SettingsCtrl',['$scope', '$state', '$ionicHistory', 'localStorageService',
    function ($scope, $state, $ionicHistory, localStorageService) {

    $scope.logOut = function () {
      // Clear all navigation stack history
      $ionicHistory.clearHistory();

      // Clear all the cache views
      $ionicHistory.clearCache();

      // Clear all local storage
      localStorageService.clearAll();

      // Go back to login view
      $state.go('login');
    };

  }])

  .controller('AppSettingsCtrl', ['$scope', '$state', 'MaskFactory', 'localStorageService',
    function ($scope, $state, MaskFactory, localStorageService) {

    $scope.survey = {
      URL: 'https://www.surveymonkey.com/mp/hospital-patient-safety-culture-survey-template-ahrq/'
    };

    $scope.saveSettings = function () {

      localStorageService.set('SURVEY_URL', $scope.survey.URL);

      MaskFactory.showMask(MaskFactory.success, 'Settings Saved.');
    };

  }])

  .controller('AccountSettingsCtrl', ['$scope', '$state', function ($scope, $state) {


  }]);
