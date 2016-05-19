angular.module('SMARTLobby.services', [])

  .service('VisitorStatusService', function (APP_CONFIG) {

    this.service_1 = APP_CONFIG.VOIP_SERVICE.SKYPE;
    this.service_2 = APP_CONFIG.VOIP_SERVICE.JABBER;

    this.contactStatusFilters = [
      {
        status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED,
        isChecked: true
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.NO_REPLY,
        isChecked: false
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.IN_BUILDING,
        isChecked: false
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING,
        isChecked: false
      }
    ];

    this.contactStatuses = [
      { status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED },
      { status: APP_CONFIG.CONTACT_STATUS.NO_REPLY },
      { status: APP_CONFIG.CONTACT_STATUS.IN_BUILDING },
      { status: APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING }
    ];

    this.voipServices = [
      { type: this.service_1 },
      { type: this.service_2 }
    ];

    this.getVoIPServices = function() {
        return this.voipServices;
    }

    this.getContactStatusFilters = function () {
      return this.contactStatusFilters;
    };

    this.getContactStatuses = function() {
      return this.contactStatuses;
    };

    this.getVisitorStatusColour = function (visitor) {
      if (visitor.contactStatus.toLowerCase() === APP_CONFIG.CONTACT_STATUS.UNCONTACTED.toLowerCase()) {
        //Gray
        return '#736F6E'
      } else if (visitor.contactStatus.toLowerCase() === APP_CONFIG.CONTACT_STATUS.NO_REPLY.toLowerCase()) {
        //Red
        return '#FF0000';
      } else if (visitor.contactStatus.toLowerCase() === APP_CONFIG.CONTACT_STATUS.IN_BUILDING.toLowerCase()) {
        //Amber
        return '#FFC200';
      } else if (visitor.contactStatus.toLowerCase() === APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING.toLowerCase()) {
        //Green
        return '#008000';
      } else {
        //Gray
        return '#736F6E'
      }
    };
  })

