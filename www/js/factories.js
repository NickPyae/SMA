angular.module('SMA.factories', [])
  .factory('MaskFactory', function ($ionicLoading) {
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
  })
  .factory('FinesseFactory', ['$http', '$q', 'localStorageService',
    function ($http, $q, localStorageService) {

      return {
        login: function (domain, userID, password, extension, connectionMode, phone) {
          var defer = $q.defer();

          var authorization = btoa(userID + ':' + password);

          localStorageService.set('DOMAIN', domain);
          localStorageService.set('USER_ID', userID);
          localStorageService.set('AUTH_TOKEN', authorization);
          localStorageService.set('EXTENSION', extension);

          var url = 'http://' + domain + '/finesse/api/User/' + userID;
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
            console.log(data);

            defer.resolve(data);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        logout: function () {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var userID = localStorageService.get('USER_ID');
          var authorization = localStorageService.get('AUTH_TOKEN');

          var url = 'http://' + domain + '/finesse/api/User/' + userID;

          var req = {
            method: 'PUT',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization,
              'Content-Type': 'application/xml'
            },
            data: '<User><state>LOGOUT</state><logoutAllMedia>true</logoutAllMedia></User>'
          };

          $http(req).then(function (data) {
            console.log(data);

            defer.resolve(data);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getUser: function () {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var userID = localStorageService.get('USER_ID');
          var authorization = localStorageService.get('AUTH_TOKEN');

          var url = 'http://' + domain + '/finesse/api/User/' + userID;

          var req = {
            method: 'PUT',
            url: url,
            headers: {
              'Authorization': 'Basic ' + authorization
            }
          };

          console.log(req);

          $http(req).then(function (response) {

            console.log(response);

            defer.resolve(response.data);

          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getReasonCodes: function () {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var userID = localStorageService.get('USER_ID');
          var authorization = localStorageService.get('AUTH_TOKEN');

          //var url = 'http://' + domain + '/finesse/api/User/' + userID + '/ReasonCodes?category=NOT_READY';

          var url = './test/reasonCodes.json';

          var req = {
            method: 'GET',
            url: url,
            //headers: {
            //  'Authorization': 'Basic ' + authorization,
            //}
          };

          $http(req).then(function (response) {

            console.log(response);

            defer.resolve(response.data.ReasonCodes);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        changeAgentState: function (state, reasonCodeId) {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var userID = localStorageService.get('USER_ID');
          var authorization = localStorageService.get('AUTH_TOKEN');

          var url = 'http://' + domain + '/finesse/api/User/' + userID;
          var dataXML = null;

          if (state.indexOf('NOT_READY') !== -1 && reasonCodeId !== null) {
            dataXML = '<User><id>' + userID + '</id><state>NOT_READY</state><reasonCodeId>' + reasonCodeId + '</reasonCodeId></User>';
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
            console.log(response);

            defer.resolve(response);

          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        makeACall: function (toNumber) {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var userID = localStorageService.get('USER_ID');
          var authorization = localStorageService.get('AUTH_TOKEN');
          var extension = localStorageService.get('EXTENSION');

          var url = 'http://' + domain + '/finesse/api/User/' + userID + '/Dialogs';

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
            console.log(response);

            defer.resolve(response);

          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getDialogID: function () {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var userID = localStorageService.get('USER_ID');
          var authorization = localStorageService.get('AUTH_TOKEN');

          var url = 'http://' + domain + '/finesse/api/User/' + userID + '/Dialogs';
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

            defer.resolve(response.data.Dialogs.Dialog.id);
          }, function (error) {

            defer.reject(error);
          });

          return defer.promise;
        },
        answerCall: function (dialogID) {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var authorization = localStorageService.get('AUTH_TOKEN');
          var extension = localStorageService.get('EXTENSION');

          var url = 'http://' + domain + '/finesse/api/Dialog/' + dialogID;

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
            console.log(response);

            defer.resolve(response);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        endCall: function (dialogID) {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var authorization = localStorageService.get('AUTH_TOKEN');
          var extension = localStorageService.get('EXTENSION');

          var url = 'http://' + domain + '/finesse/api/Dialog/' + dialogID;

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
            console.log(response);

            defer.resolve(response);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        },
        getListOfQueues: function() {
          var defer = $q.defer();

          var domain = localStorageService.get('DOMAIN');
          var authorization = localStorageService.get('AUTH_TOKEN');
          var userID = localStorageService.get('USER_ID');

          var url = 'http://' + domain + '/finesse/api/User/' + userID + '/Queues';

          // Test with local json file
          var req = {
            method: 'GET',
            url: './test/queues.json'
          }

          //var req = {
          //  method: 'GET',
          //  url: url,
          //  headers: {
          //    'Authorization': 'Basic ' + authorization,
          //    'Content-Type': 'application/xml'
          //  },
          //  transformResponse: function (data, headersGetter, status) {
          //
          //    //Transform xml to json and return
          //    var x2js = new X2JS();
          //    var xmlText = data;
          //    var jsonObj = x2js.xml_str2json(xmlText);
          //
          //    return jsonObj;
          //  }
          //};

          $http(req).then(function (response) {
            defer.resolve(response.data.Queues.Queue);
          }, function (error) {
            console.log(error);

            defer.reject(error);
          });

          return defer.promise;
        }
      }
    }])

