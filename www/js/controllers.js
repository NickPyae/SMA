angular.module('SMA.controllers', [])

  .controller('LoginCtrl', function ($scope, $state, FinesseFactory, MaskFactory) {

    $scope.userID = '1072';
    $scope.pw = '1072';
    $scope.ip = 'finesse1.dcloud.cisco.com';
    $scope.extension = '';
    $scope.phone = '';

    $scope.signInAsAgent = {
        isTurnedOn: false
    };

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

    $scope.onSelectConnectionModeChange = function(selectedConnectionMode) {
      $scope.selectedConnectionMode = selectedConnectionMode;
    };

    $scope.login = function (userID, pw,ip, extension, connectionMode, phone) {

      $state.go('tab.agent');

      //MaskFactory.loadingMask(true, 'Loading');
      //
      //FinesseFactory.login(ip, userID, pw, extension, connectionMode.type, phone).then(function(data) {
      //  if(data.status === 202) {
      //    MaskFactory.loadingMask(false);
      //    $state.go('tab.agent');
      //  }
      //
      //}, function(error) {
      //  MaskFactory.loadingMask(false);
      //  MaskFactory.showMask(MaskFactory.error, 'Error logging in.');
      //});
    };

  })

  .controller('AgentCtrl', function ($scope, $ionicHistory, $state, FinesseFactory, localStorageService, MaskFactory) {
    $scope.userStates = [];

    FinesseFactory.getReasonCodes().then(function(data) {
        angular.forEach(data.ReasonCode, function(item) {
            $scope.userStates.push({
              category: item.category,
              reasonCodeId: item.code,
              label: item.category + ': ' + item.label,
              statusColor: '#FF4500'
            });
        });

      $scope.userStates.push({
        category: 'READY',
        reasonCodeId: null,
        label: 'READY',
        statusColor: '#33cd5f'
      });

      $scope.userStates.push({
        category: 'SIGNOUT',
        reasonCodeId: null,
        label: 'SIGNOUT',
        statusColor: '#444444'
      });

      if(localStorageService.get('REASON_CODE')) {
        angular.forEach($scope.userStates, function(item) {
            if(item.label === localStorageService.get('REASON_CODE')) {
              $scope.selectedUserState = item;
              $scope.surveyStatus = item.category  + ' SURVEY';
              $scope.statusColor = item.statusColor;
            }
        });
      } else {
        $scope.selectedUserState = $scope.userStates[0];
        $scope.surveyStatus = $scope.selectedUserState.category  + ' SURVEY';
        $scope.statusColor = $scope.selectedUserState.statusColor;
      }
    });

    $scope.onSelectUserStateChange = function(userState) {
      MaskFactory.loadingMask(true, 'Loading');

        FinesseFactory.changeAgentState(userState.category, userState.reasonCodeId).then(function(data) {

          $scope.selectedUserState = userState;
          $scope.surveyStatus = userState.category  + ' SURVEY';
          $scope.statusColor = userState.statusColor;
          localStorageService.set('REASON_CODE', userState.label);

          if(userState.category === 'SIGNOUT') {
            MaskFactory.loadingMask(false);

            // Clear all navigation stack history
            $ionicHistory.clearHistory();

            // Clear all the cache views
            $ionicHistory.clearCache();

            FinesseFactory.logout();

            // Clear all local storage
            localStorageService.clearAll();

            // Go back to login view
            $state.go('login');
          }

          MaskFactory.loadingMask(false);
        }, function(error) {
          MaskFactory.loadingMask(false);
          MaskFactory.showMask(MaskFactory.error, 'Error Updating Agent State.');
        });
    };

    $scope.answerCall = function() {
      MaskFactory.loadingMask(true, 'Answering Call');

      FinesseFactory.getDialogID().then(function(dialogID) {
        if(dialogID) {
          FinesseFactory.answerCall(dialogID).then(function(data) {
            if(data.status === 202) {
              MaskFactory.loadingMask(false);
            }
          }, function(error) {
            MaskFactory.loadingMask(false);
            MaskFactory.showMask(MaskFactory.error, 'Error Answering Call.');
          });
        }

        MaskFactory.loadingMask(false);
      }, function(error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Answering Call.');
      });
    };

    $scope.endCall = function() {
      MaskFactory.loadingMask(true, 'Ending Call');

      FinesseFactory.getDialogID().then(function(dialogID) {

        if(dialogID) {
          FinesseFactory.endCall(dialogID).then(function(data) {
            if(data.status === 202) {
              MaskFactory.loadingMask(false);
            }
          }, function(error) {
            MaskFactory.loadingMask(false);
            MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
          });
        }

        MaskFactory.loadingMask(false);
      }, function(error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
      });
    };

    $scope.queues = [];

    // Get all  the queues for logged in user
    getQueueForUser();

    function getQueueForUser() {
      MaskFactory.loadingMask(true, 'Getting Queue Numbers');

      FinesseFactory.getListOfQueues().then(function(queues) {
          angular.forEach(queues, function(queue) {
              $scope.queues.push(queue);
          });

        MaskFactory.loadingMask(false);
      }, function(error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Getting Queue Numbers.');
      });
    }

  })

  .controller('SurveyCtrl', function ($scope, $sce, MaskFactory, FinesseFactory, localStorageService) {

    $scope.phone = '';

    $scope.makeACall = function(phone) {
        MaskFactory.loadingMask(true, 'Making Call');

        FinesseFactory.changeAgentState('NOT_READY', 4).then(function() {
          FinesseFactory.makeACall(phone).then(function(data) {
            if(data.status === 202) {
              MaskFactory.loadingMask(false);
            }
          }, function(error) {
            MaskFactory.loadingMask(false);
            MaskFactory.showMask(MaskFactory.error, 'Error Making Call.');
          });
        });
    };

    $scope.endCall = function() {
      MaskFactory.loadingMask(true, 'Ending Call');

      FinesseFactory.getDialogID().then(function(dialogID) {

          if(dialogID) {
            FinesseFactory.endCall(dialogID).then(function(data) {
              if(data.status === 202) {
                MaskFactory.loadingMask(false);
              }
            }, function(error) {
              MaskFactory.loadingMask(false);
              MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
            });
          }

        MaskFactory.loadingMask(false);
      }, function(error) {
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Error Ending Call.');
      });
    };


    // Load surveymonkey content into iFrame
    if(localStorageService.get('SURVEY_URL')) {
      $scope.iFrameURL =  $sce.trustAsResourceUrl(localStorageService.get('SURVEY_URL'));
    } else {
      $scope.iFrameURL = $sce.trustAsResourceUrl('');
    }

  })


  .controller('SettingsCtrl', function ($scope, $state, $ionicHistory, localStorageService, FinesseFactory) {

    $scope.logOut = function () {
      // Clear all navigation stack history
      $ionicHistory.clearHistory();

      // Clear all the cache views
      $ionicHistory.clearCache();

      FinesseFactory.logout();

      // Clear all local storage
      localStorageService.clearAll();

      // Go back to login view
      $state.go('login');
    };

  })

  .controller('AppSettingsCtrl', function ($scope, $state, MaskFactory, localStorageService) {

    $scope.survey = {
        URL: 'https://www.surveymonkey.com/r/K8NBWGK'
    };

    $scope.saveSettings = function () {

      localStorageService.set('SURVEY_URL', $scope.survey.URL);

      MaskFactory.showMask(MaskFactory.success, 'Settings Saved.');
    };

  })

  .controller('AccountSettingsCtrl', function ($scope, $state) {


  });
