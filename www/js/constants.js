// Global app configuration
var APP_CONFIG =
{
  CONTACT_STATUS: {
    UNCONTACTED: 'Uncontacted',
    NO_REPLY: 'No Reply',
    VACATING: 'Vacating',
    EVACUATED: ' Evacuated',
    IN_BUILDING: 'In Building',
    LEFT_BUILDING: 'Left Building'
  },
  MODE: {
    DEFAULT: 'Normal',
    EMERGENCY: 'Emergency'
  },
  THEME: {
    BAR_DEFAULT: 'bar-dark',
    TABS_DEFAULT: 'tabs-dark',
    BAR_EMERGENCY: 'bar-assertive',
    TABS_EMERGENCY: 'tabs-assertive'
  },
  VOIP_SERVICE: {
    SKYPE: 'Skype',
    JABBER: 'Cisco Jabber',
    SKYPE_URL_SCHEME: 'skype:live:skype.',
    JABBER_URL_SCHEME: 'ciscotel://'
  },
  SERVICE: {
    GET_VISITORS: 'getAllVisitors'
  },
  BASE_URL: 'http://192.168.1.121/smartlobby/mobile/'
};

angular.module('SMARTLobby.constants', []).
constant('APP_CONFIG', APP_CONFIG);
