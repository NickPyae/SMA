angular.module('SMARTLobby.factories', [])

  .factory('Visitors', function ($q, $http) {

    function Visitor(id, name, companyName, checkInDateTime, hostName, hostNumber, img, checkInStatus,
                     contactStatus, contact_1, contact_2, meetingID) {
      this.id = id;
      this.name = name;
      this.companyName = companyName;
      this.checkInDateTime = checkInDateTime;
      this.hostName = hostName;
      this.hostNumber = hostNumber;
      this.img = img || 'img/visitor.png';
      this.checkInStatus = null;
      this.contactStatus = contactStatus || 'Uncontacted';
      this.contact_1 = contact_1;
      this.contact_2 = contact_2;
      this.meetingID = meetingID;
      this.isChecked = false;
    }

    function Host(companyName, name, contact_1, contact_2, img, checkInDateTime) {
      this.companyName = companyName;
      this.name = name;
      this.contact_1 = contact_1;
      this.contact_2 = contact_2;
      this.img = img || 'img/visitor.png';
      this.checkInDateTime = checkInDateTime;
    }

    function MeetingDetail(id, location, roomImage, companyName, meetingSubject, hostName, hostNumber, meetingDate, visitors) {
      this.id = id;
      this.location = location || 'Orion @ Paya Lebar Road';
      this.roomImage = roomImage || 'img/16pax-2.jpg';
      this.companyName = companyName || 'NexLabs Pte Ltd';
      this.meetingSubject = meetingSubject || 'New project meeting. Lobby Ambassador mobile for iOS and android platforms.';
      this.meetingHost = hostName || 'Nick';
      this.hostNumber = hostNumber;
      this.meetingDate = meetingDate || new Date().toDateString();
      this.attendees = visitors;
    }


    var visitors = [];

    this.updatedVisitors = [];

    return {
      getAllVisitors: function () {
        var defer = $q.defer();

        $http.get('./test/visitors-list.json')
          .success(function (data) {
            var allVisitors = [];

            angular.forEach(data, function (item, index) {
              allVisitors.push(
                new Visitor(
                  index, item.g.n, item.g.o, item.g.ci, item.h.n, item.h.c1, item.g.img, '', '',
                  item.g.c1, item.g.c2, item.sr.id
                ));
            });

            // For testing purpose only
            visitors = allVisitors;

            defer.resolve(visitors);
          })
          .error(function (err) {
            defer.reject(err);
          })

        return defer.promise;
      },
      getMeetingDetail: function (meetingID) {
        var hostNumber = null;

        if (parseInt(meetingID) === 1) {

          angular.forEach(this.getUpdatedVisitors(), function (visitor) {
            if (parseInt(visitor.meetingID) === 1) {
              hostNumber = visitor.hostNumber;
            }
          });

          return new MeetingDetail(
            meetingID, '', '', '', '', '', hostNumber, '', this.getUpdatedVisitors()
          );
        } else {
          return null;
        }
      },
      updateVisitors: function (visitors) {
        this.updatedVisitors = visitors;
      },
      getUpdatedVisitors: function () {
        return this.updatedVisitors;
      }
    };
  })
  .factory('TimerFactory', ['$http', '$q', function ($http, $q) {
    var deferred = $q.defer();

    var timerFactory = {};

    timerFactory.getStats = function () {
      $http.get('./test/stats.json')
        .success(function (data, status) {
          deferred.resolve(data);

        })
        .error(function (data, status) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    return timerFactory;
  }])
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

          if(connectionMode && phone) {
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
        getReasonCodes: function() {
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

          console.log(req);

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

          if(state.indexOf('NOT_READY') !== -1 && reasonCodeId !== null) {
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
        makeACall: function(toNumber) {
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
        getDialogID: function() {
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
        answerCall: function(dialogID) {
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
        endCall: function(dialogID) {
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
        }
      }
    }])

