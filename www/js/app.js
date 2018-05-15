// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'ionic-material', 'ionMdInput', 'google.places', 'ngOpenFB', 'ngCordova', 'naif.base64', 'googleplus'], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})

.directive('onFinishRender', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if (scope.$last === true) {
				$timeout(function () {
					scope.$emit('ngRepeatFinished');
				});
			}
		}
	}
})

.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name) {
        if(name === attr.focusOn) {
          elem[0].focus();
        }
      });
   };
})

.factory('$focus', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  return function(name) {
    $timeout(function (){
      $rootScope.$broadcast('focusOn', name);
    });
  }
}])

.factory('$trackMixPanel',['$localstorage', function ($localstorage) {
	var userData = $localstorage.getObject('userdata');

	return {
		tracker: function(e, data){
			var custom_data = (data) ? data : {};

			custom_data.user_id = (userData.seeker_id) ? userData.seeker_id : '';
			custom_data.first_name = (userData.first_name) ? userData.first_name : '';
			custom_data.last_name = (userData.last_name) ? userData.last_name : '';
			custom_data.profile_status = (userData.profile_status) ? userData.profile_status : '';

			mixpanel.track(e, custom_data);
		}
	}
}])

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
}])

.factory('$dataFactory', ['$http', '$endPoint', '$localstorage', '$q', function($http, $endPoint, $localstorage, $q) {

	var userData = $localstorage.getObject('userdata');
	var url = $endPoint.url+'noti_counts'+$endPoint.params;

	this.seeker_id = (userData.seeker_id) ? userData.seeker_id : '0';
	this.userData = (userData) ? userData : {};
	this.baseUrl = $endPoint.baseUrl;

	this.getCounts = function(data, ep){
		url = $endPoint.url+ep+$endPoint.params;
		return $http.post(url, data);
	};

	this.baseRequest = function(data, ep){
		url = $endPoint.baseUrl+ep+$endPoint.params;
		return $http.post(url, data);
	};

	this.postRequest = function(data, ep){
		url = $endPoint.url+ep+$endPoint.params;
		return $http.post(url, data);
	};

	return this;
}])
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
	removeItem: function(key){
      $window.localStorage.removeItem(key);
	}
  }
}])

.factory('AuthService', function($rootScope) {

  var loggedIn=false;

  return {

    checkLogin : function() {
      $rootScope.$broadcast('loggedIn', { 'loggedIn' : loggedIn });
      return loggedIn;

    },

    login : function() {
      loggedIn = true;
      $rootScope.$broadcast('loggedIn', { 'loggedIn' : loggedIn });
    }

  }

})

.factory('$endPoint', ['$localstorage', function($localstorage) {
	//'http://staging.spacelli.com/','http://192.168.254.102/nguyen/spacelli.com/staging/',
	var ulink = 'https://spacelli.com/'; //http://54.236.246.25/';//http://localhost/nguyen/spacelli.com/staging/'; //
	return {
		url: ulink+'apiv2/',
		baseUrl: ulink,
		params: '?apikey=insurance101'
	};
}])

.run(function($ionicPlatform, ngFB) {

	//disable landscape orientation
	if(window.navigator && window.navigator.splashscreen) {
		window.plugins.orientationLock.unlock();
	}
	//Initialize OpenFB
	ngFB.init({appId: '532984193504131'}); //641338992668650'});


    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

		//mixpanel.track('Device is ready to be tracked');
    });
})

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider', '$compileProvider', 'GooglePlusProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $compileProvider, GooglePlusProvider) {

	//global click
	//$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|tel|javascript):/);

  //googleplus api
  GooglePlusProvider.init({
    clientId: '732731336794-ugkqa5p9tik23sv42a6d2nesan6b3v88.apps.googleusercontent.com',
    apiKey: 'AIzaSyBHlHhgh7CAny1VtbnlQMKkiaSmDx6ZO8U'
  });

	//detect time out for each request
    $httpProvider.interceptors.push(function ($rootScope, $q) {
        return {
            request: function (config) {
                config.timeout = 120000; //2min
                return config;
            },
            responseError: function (rejection) {
                switch (rejection.status){
                    case 408 :
                        console.log('connection timed out');
                        break;
                }
                return $q.reject(rejection);
            }
        }
    });

    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(0);

    /*
    // Turn off back button text
    $ionicConfigProvider.backButton.previousTitleText(false);
    */

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.profilemenu', {
        url: '/profilemenu',
        views: {
            'menuContent': {
                templateUrl: 'templates/profilemenu.html',
                controller: 'ProfileMenuCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.dashboard', {
        url: '/dashboard',
        views: {
            'menuContent': {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.accountmenu', {
        url: '/accountmenu',
        views: {
            'menuContent': {
                templateUrl: 'templates/accountmenu.html',
                controller: 'AccountMenuCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })
    .state('app.setup', {
        url: '/setup',
        views: {
            'menuContent': {
                templateUrl: 'templates/setup.html',
                controller: 'SetupCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.gallery', {
        url: '/gallery',
        views: {
            'menuContent': {
                templateUrl: 'templates/gallery.html',
                controller: 'GalleryCtrl'
            },
            'fabContent': ''
        }
    })

    .state('app.login', {
        url: '/login',
        views: {
            'menuContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.landing', {
        url: '/landing',
        views: {
            'menuContent': {
                templateUrl: 'templates/landing.html',
                controller: 'Login2Ctrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })


    .state('app.loginpage', {
        url: '/loginpage',
        views: {
            'menuContent': {
                templateUrl: 'templates/loginpage.html',
                controller: 'LoginPageCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.landingsignup', {
        url: '/landingsignup/:login',
        views: {
            'menuContent': {
                templateUrl: 'templates/signuppage.html',
                controller: 'SignupPageCtrl'
            },
            'fabContent': {
                template: ''
            }
        }
    })

    .state('app.profile', {
        url: '/profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
            },

            'fabContent': {
                template: ''
            }
		},
		cache: false
    })

	//all other pages

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
	    controller: 'SearchCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    }
  })

  .state('app.searchconsultant', {
    url: '/searchconsultant',
    views: {
      'menuContent': {
        templateUrl: 'templates/searchconsultant.html',
	    controller: 'SearchConsultantCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html',
	  	  controller: 'BrowseCtrl'
        }
      },
	  'fabContent': {
   	  	template: ''
	  }
    })


  .state('app.messages', {
    url: '/messages',
    views: {
      'menuContent': {
        templateUrl: 'templates/messages.html',
        controller: 'MessagesCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.inbox', {
    url: '/inbox',
    views: {
      'menuContent': {
        templateUrl: 'templates/inbox.html',
        controller: 'InboxCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.outbox', {
    url: '/outbox',
    views: {
      'menuContent': {
        templateUrl: 'templates/outbox.html',
        controller: 'OutboxCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.trash', {
    url: '/trash',
    views: {
      'menuContent': {
        templateUrl: 'templates/trash.html',
        controller: 'TrashCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.notifications', {
    url: '/notifications',
    views: {
      'menuContent': {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.activity', {
    url: '/activity',
    views: {
      'menuContent': {
        templateUrl: 'templates/activity.html',
        controller: 'ActivityCtrl'
      },
	  'fabContent': {
   	  	template: ''
//		<button id="fab-profile" class="button button-fab button-fab-bottom-right button-energized-900" ng-click="openModalAdd({})"><i class="icon ion-ios-plus-empty"></i></button>',
//		controller: 'ActivityFabCtrl'
	  }
    },
	cache: false
  })

  .state('app.cactivity', {
    url: '/cactivity',
    views: {
      'menuContent': {
        templateUrl: 'templates/activitycurrent.html',
        controller: 'ActivityCurrentCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.editprofile', {
    url: '/editprofile',
    views: {
      'menuContent': {
        templateUrl: 'templates/editprofile.html',
        controller: 'EditProfileCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.verifications', {
    url: '/verifications',
    views: {
      'menuContent': {
        templateUrl: 'templates/verifications.html',
        controller: 'VerificationsCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.reviews', {
    url: '/reviews',
    views: {
      'menuContent': {
        templateUrl: 'templates/reviews.html',
        controller: 'ReviewsCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.references', {
    url: '/references',
    views: {
      'menuContent': {
        templateUrl: 'templates/references.html',
        controller: 'ReferencesCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.listings', {
    url: '/listings',
    views: {
      'menuContent': {
        templateUrl: 'templates/listings.html',
        controller: 'ListingsCtrl'
      },
	  'fabContent': {
   	  	template: '',
//		<button id="fab-profile" class="button button-fab button-fab-bottom-right button-energized-900" ng-click="openModalAdd({})"><i class="icon ion-ios-plus-empty"></i></button>',
//		controller: 'ListingsCtrl'
	  }
    },
	cache: false
  })

  .state('app.services', {
    url: '/services',
    views: {
      'menuContent': {
        templateUrl: 'templates/services.html',
        controller: 'ServicesCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.communities', {
    url: '/communities',
    views: {
      'menuContent': {
        templateUrl: 'templates/communities.html',
        controller: 'CommunitiesCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.payment', {
    url: '/payment',
    views: {
      'menuContent': {
        templateUrl: 'templates/payment.html',
        controller: 'PaymentCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.payout', {
    url: '/payout',
    views: {
      'menuContent': {
        templateUrl: 'templates/payout.html',
        controller: 'PayoutCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.transaction', {
    url: '/transaction',
    views: {
      'menuContent': {
        templateUrl: 'templates/transaction.html',
        controller: 'TransactionCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.alerts', {
    url: '/alerts',
    views: {
      'menuContent': {
        templateUrl: 'templates/alerts.html',
        controller: 'AlertsCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })

  .state('app.password', {
    url: '/password',
    views: {
      'menuContent': {
        templateUrl: 'templates/password.html',
        controller: 'PasswordCtrl'
      },
	  'fabContent': {
   	  	template: ''
	  }
    },
	cache: false
  })


  .state('app.space', {
    url: '/space',
	templateUrl: 'templates/spacesearch.html',
	controller: 'SearchCtrl',
	cache: false
  })


  ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/landing');
}]);
