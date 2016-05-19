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
      this.checkInStatus = checkInStatus || 'Checked in';
      this.contactStatus = contactStatus || 'Uncontacted';
      this.contact_1 = contact_1;
      this.contact_2 = contact_2;
      this.meetingID = meetingID;
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

    var defer = $q.defer();

    var visitors = [];

    this.updatedVisitors = [];

    return {
      getAllVisitors: function () {
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

          angular.forEach(this.getUpdatedVisitors(), function(visitor) {
            if(parseInt(visitor.meetingID) === 1) {
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
      updateVisitors: function(visitors) {
        this.updatedVisitors = visitors;
      },
      getUpdatedVisitors: function() {
            return this.updatedVisitors;
      }
    };
  })

