angular.module('SMA.factories', [])
  .factory('MaskFactory', ['$ionicLoading', function ($ionicLoading) {
    var maskTypes = {
      success: {
        icon: '',
        dur: 1000,
        color: ''
      },
      warning: {
        icon: 'ion-alert ',
        dur: 1000,
        color: ''
      },
      error: {
        icon: 'ion-alert assertive',
        dur: 1500,
        color: 'assertive'
      }
    };

    return {
      showMask: function (type, msg) {
        $ionicLoading.show({
          template: '<label class="' + type.color + '">' + msg + '</label>' + ' <i class="' + type.icon + '"/>',
          noBackdrop: true,
          duration: type.dur
        });
      },
      loadingMask: function (show, msg) {
        if (show) {
          $ionicLoading.show({
            template: '<img src="img/ajax-loader.gif"/>' + msg,
            noBackdrop: false
          });
        } else {
          $ionicLoading.hide();
        }

      },
      warning: maskTypes.warning,
      error: maskTypes.error,
      success: maskTypes.success
    };
  }])
  .factory('FinesseFactory', ['$http', '$q', 'localStorageService', 'CONFIG',
    function ($http, $q, localStorageService, CONFIG) {

      return {
        signIn: function (domain, userID, password, extension, connectionMode, phone) {
          var defer = $q.defer();

          var authorization = btoa(userID + ':' + password);

          localStorageService.set(CONFIG.AUTH.DOMAIN, domain);
          localStorageService.set(CONFIG.AUTH.USER_ID, userID);
          localStorageService.set(CONFIG.AUTH.TOKEN, authorization);
          localStorageService.set(CONFIG.AUTH.EXTENSION, extension);

          var url = 'https://' + domain + '/finesse/api/User/' + userID;

          // To test with fake json, comment headers and transformResponse properties
          //var url = './test/userStatus.json';

          var dataXML = null;

          if (connectionMode && phone) {
            dataXML = '<User><state>LOGIN</state><extension>' + extension + '</extension><mobileAgent><mode>' + connectionMode + '</mode><dialNumber>' + phone + '</dialNumber></mobileAgent></User>';
          } else {
            dataXML = '<User><state>LOGIN</state><extension>' + extension + '</extension></User>';
          }

          var req = {
            method: 'PUT',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            data: dataXML
          };

          $http(req).then(function (data) {

            defer.resolve(data);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getUserStatus: function() {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);

          var url = 'https://' + domain + '/finesse/api/User/' + userID;

          // To test with fake json, comment headers and transformResponse properties
          //var url = './test/userStateTalking.json';
          //var url = './test/userStateHangup.json';

          var req = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
            },
            transformResponse: function (data, headersGetter, status) {

              //Transform xml to json and return
              var x2js = new X2JS();
              var xmlText = data;
              var jsonObj = x2js.xml_str2json(xmlText);

              return jsonObj;
            }
          };

          $http(req).then(function (response) {

            if(response.data && response.data.User) {
              defer.resolve(response.data.User);
            } else {
              defer.resolve(null);
            }
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getNotReadyReasonCodes: function () {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);

          var url = 'https://' + domain + '/finesse/api/User/' + userID + '/ReasonCodes?category=NOT_READY';

          // To test with fake json, comment headers and transformResponse properties
          //var url = './test/notReadyReasonCodes.json';

          var req = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
            },
            transformResponse: function (data, headersGetter, status) {

              //Transform xml to json and return
              var x2js = new X2JS();
              var xmlText = data;
              var jsonObj = x2js.xml_str2json(xmlText);

              return jsonObj;
            }
          };

          $http(req).then(function (response) {

            if(response.data && response.data.ReasonCodes && response.data.ReasonCodes.ReasonCode && response.data.ReasonCodes.ReasonCode.length !== 0) {
              defer.resolve(response.data.ReasonCodes.ReasonCode);
            } else {
              defer.resolve(null);
            }
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getLogoutReasonCodes: function () {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);

          var url = 'https://' + domain + '/finesse/api/User/' + userID + '/ReasonCodes?category=LOGOUT';

          // To test with fake json, comment headers and transformResponse properties
          //var url = './test/logoutReasonCodes.json';

          var req = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
            },
            transformResponse: function (data, headersGetter, status) {

              //Transform xml to json and return
              var x2js = new X2JS();
              var xmlText = data;
              var jsonObj = x2js.xml_str2json(xmlText);

              return jsonObj;
            }
          };

          $http(req).then(function (response) {

            if(response.data && response.data.ReasonCodes && response.data.ReasonCodes.ReasonCode && response.data.ReasonCodes.ReasonCode.length !== 0) {
              defer.resolve(response.data.ReasonCodes.ReasonCode);
            } else {
              defer.resolve(null);
            }
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        changeAgentState: function (state, reasonCodeId) {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);

          var url = 'https://' + domain + '/finesse/api/User/' + userID;
          var dataXML = null;

          if (state.indexOf('NOT_READY') !== -1 && reasonCodeId !== null) {
            dataXML = '<User><id>' + userID + '</id><state>NOT_READY</state><reasonCodeId>' + reasonCodeId + '</reasonCodeId></User>';
          } else if(state.indexOf('LOGOUT') !== -1 && reasonCodeId !== null) {
            dataXML = '<User><state>LOGOUT</state><reasonCodeId>' + reasonCodeId + '</reasonCodeId><logoutAllMedia>true</logoutAllMedia> </User>'
          } else {
            dataXML = '<User><id>' + userID + '</id><state>' + state + '</state></User>'
          }

          var req = {
            method: 'PUT',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            data: dataXML
          };

          $http(req).then(function (response, status, headers, config) {

            defer.resolve(response);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        makeACall: function (toNumber) {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);
          var extension = localStorageService.get(CONFIG.AUTH.EXTENSION);

          var url = 'https://' + domain + '/finesse/api/User/' + userID + '/Dialogs';

          var req = {
            method: 'POST',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            data: '<Dialog><requestedAction>MAKE_CALL</requestedAction><fromAddress>' + extension + '</fromAddress><toAddress>' + toNumber + '</toAddress></Dialog>'
          };

          $http(req).then(function (response) {

            defer.resolve(response);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getDialogID: function () {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);

          var url = 'https://' + domain + '/finesse/api/User/' + userID + '/Dialogs';

          // To test with fake json, comment headers and transformResponse properties
          //var url = './test/dialog.json';

          var req = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization
            },
            transformResponse: function (data, headersGetter, status) {

              //Transform xml to json and return
              var x2js = new X2JS();
              var xmlText = data;
              var jsonObj = x2js.xml_str2json(xmlText);

              return jsonObj;
            }
          };

          $http(req).then(function (response) {

            if(response.data && response.data.Dialogs && response.data.Dialogs.length !== 0) {
              defer.resolve(response.data.Dialogs.Dialog.id);
            } else {
              defer.resolve(null);
            }
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        answerCall: function (dialogID) {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);

          var url = 'https://' + domain + '/finesse/api/Dialog/' + dialogID;

          var req = {
            method: 'PUT',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            data: '<Dialog><requestedAction>ANSWER</requestedAction><targetMediaAddress>' + extension + '</targetMediaAddress></Dialog>'
          };

          $http(req).then(function (response) {

            defer.resolve(response);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        endCall: function (dialogID) {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);
          var extension = localStorageService.get(CONFIG.AUTH.EXTENSION);

          var url = 'https://' + domain + '/finesse/api/Dialog/' + dialogID;

          var req = {
            method: 'PUT',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            data: '<Dialog><requestedAction>DROP</requestedAction><targetMediaAddress>' + extension + '</targetMediaAddress></Dialog>'
          };

          $http(req).then(function (response) {

            defer.resolve(response);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getListOfQueues: function() {
          var defer = $q.defer();

          var domain = localStorageService.get(CONFIG.AUTH.DOMAIN);
          var authorization = localStorageService.get(CONFIG.AUTH.TOKEN);
          var userID = localStorageService.get(CONFIG.AUTH.USER_ID);

          var url = 'https://' + domain + '/finesse/api/User/' + userID + '/Queues';

          // To test with fake json, comment headers and transformResponse properties
          //var url = './test/queues.json';

          var req = {
            method: 'GET',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            transformResponse: function (data, headersGetter, status) {

              //Transform xml to json and return
              var x2js = new X2JS();
              var xmlText = data;
              var jsonObj = x2js.xml_str2json(xmlText);

              return jsonObj;
            }
          };

          $http(req).then(function (response) {

            if(response.data && response.data.Queues && response.data.Queues.Queue && response.data.Queues.Queue.length !== 0) {
              defer.resolve(response.data.Queues.Queue);
            } else {
              defer.resolve(null);
            }
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        }
      }
    }])

