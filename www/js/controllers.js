/* global angular, document, window */
'use strict';

// Triggered on a button click, or some other target
var globalPopup;
var closeExPopup = function(){
	console.log('aw');
	globalPopup.close();
};

angular.module('starter.controllers', ['ngOpenFB'])

.controller('AppCtrl',['$scope', '$ionicModal', '$ionicPopover', '$timeout', '$ionicPopup', '$localstorage', '$dataFactory', '$ionicLoading', '$state', '$ionicHistory', 'ngFB', '$cordovaOauth', '$http', 'ionicMaterialMotion', '$location', '$ionicSideMenuDelegate', '$trackMixPanel', 'GooglePlus', function($scope, $ionicModal, $ionicPopover, $timeout, $ionicPopup,  $localstorage, $dataFactory, $ionicLoading, $state, $ionicHistory, ngFB, $cordovaOauth, $http, ionicMaterialMotion, $location, $ionicSideMenuDelegate, $trackMixPanel, GooglePlus) {
	//localstorage
	$scope.userData = $localstorage.getObject('userdata');
	$scope.user_id = ($scope.userData.seeker_id) ? $scope.userData.seeker_id : '';
	$scope.vmessages = $localstorage.getObject('messages');
	$scope.activities = {};
	console.log($scope.user_id);

	$scope.uripath = $location.path();
	console.log($location.path());
	$timeout( function() {
		if($scope.userData.seeker_id && $scope.uripath == '/app/landing'){
			$state.go("app.profile");
			$ionicHistory.nextViewOptions({
				disableAnimate: true,
				disableBack: true
			});
		}
	}, 0);


	$scope.backHome = function(){
		$state.go("app.profile");
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true
		});
	};

	$scope.goSignup = function(){
		$state.go("app.landingsignup");
	};

	$scope.goLogin = function(){
		$state.go("app.loginpage");
	};

	$scope.goLanding = function(){
		$state.go("app.landing");
	};


	$scope.goSearchspace = function(){
		$state.go("app.search");
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true
		});
	};

	$scope.goInbox = function(){
		$state.go("app.inbox");
	};

	$scope.toggleRightSideMenu = function(){
		$ionicSideMenuDelegate.toggleLeft();
	};

	$scope.goHome = function(){
		$state.go("app.profile");
		$ionicHistory.nextViewOptions({
			disableAnimate: true,
			disableBack: true
		});
	};


	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		console.log(ngRepeatFinishedEvent);
		ionicMaterialMotion.blinds();
	});
	ionicMaterialMotion.blinds();

	//mixpanel tracker
 	$scope.tracker = function(event, data){
		$trackMixPanel.tracker(event, data);
	};

	// Form data for the login
	$scope.loginData = {
		seeker: false,
		trader: true
	};

	//dash alert counts
	$scope.resetLoading = function(err){
		$scope.popUp('Opps!', 'Something went wrong. Please try again.');
		$scope.loadingHide();
		if(err){
			console.log(err);
		}
	};


	//dash alert counts
	$scope.notiCounts = {};
	$scope.setUpAlertCount = 0;

	$scope.updateCounts = function(){
		$dataFactory.getCounts({seeker_id: $scope.userData.seeker_id}, 'noti_counts').then(function(res){
			console.log(res.data);
			$scope.notiCounts = res.data;
			console.log($scope.setUpAlertCount, 'setUpAlertCount');
			console.log($scope.uripath, 'uripath,');

			if(res.data.profile_status > 0 && $scope.setUpAlertCount == 0){ // && $scope.uripath == '/app/profile'

			   $timeout(function(){
					 // A confirm dialog
					   var confirmPopup = $ionicPopup.confirm({
						 title: 'Hi ' + $scope.userData.first_name + '!',
						 template: $scope.vmessages.error.completing_profile_setup,
					   });
					   confirmPopup.then(function(res) {
						 if(res) {
							$state.go("app.setup");
							$scope.tracker('Go to profile setup');
						 } else {
						    console.log('You are not sure');
							//$scope.tracker('Go to profile setup');

						 }
					   });
						$scope.setUpAlertCount = 1;
						console.log($scope.setUpAlertCount, 'setUpAlertCount');
			   }, 3000);

			}

		}, function(err){
			//$scope.resetLoading(err);
		});
	};
	//$scope.updateCounts();


    $scope.googleLogin = function() {
			GooglePlus.login().then(function (authResult) {
					console.log(authResult);

					GooglePlus.getUser().then(function (result) {
						$scope.loadingShow();

						console.log(result, 'GooglePlus.getUser');
						if(result.result.id){
							var profileData = {
								"email": '',//result.result.email,
								"id": result.result.id,
								"host_id": '',
								"gp_profile": result.result.picture,
								"gp_data": JSON.stringify(result.result),
							};

							//get userData
							$dataFactory.baseRequest(profileData, 'account/check_g_plus_user').then(function(res){

								$scope.loadingHide();
								//$scope.popUp('checkg', JSON.stringify(res.data));

								if(res.data.action == 'login'){
									$localstorage.setObject('userdata', res.data.user);

									//update userData
									$scope.userData = res.data.user;
									$scope.user_id = res.data.user.seeker_id;
									$scope.avatarStyle.background = 'url('+$scope.userData.avatar+')';
									$scope.tracker('Google plus login');

									$timeout(function(){
										// $scope.closeLogin();
										$scope.closeSign();
										$scope.closeForgot();
									}, 300);

									$state.go("app.profile");
									$ionicHistory.nextViewOptions({
										disableAnimate: true,
										disableBack: true
									});

								}
								else if(res.data.action == 'signup'){
									$timeout(function(){
										$scope.loginData.id = res.data.id;
										$scope.loginData.first = result.result.given_name;
										$scope.loginData.last = result.result.family_name;
										$scope.loginData.signe = result.result.email;
										$scope.openSignComp();
										$scope.tracker('Google plus signup');
									}, 300);
								}
							},
							function(err){
								$scope.resetLoading(err);
							});

						}
					},
					function(error) {
						$scope.loadingHide();
						$scope.popUp("Opps!", JSON.stringify(error));
						//console.log(JSON.stringify(error));
					});

			}, function (err) {
					console.log(err);
			});

	    // $cordovaOauth.google("732731336794-ugkqa5p9tik23sv42a6d2nesan6b3v88.apps.googleusercontent.com", ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]).then(function(result) {
			//
			//       console.log(JSON.stringify(result));
			// 			//$scope.popUp('Token!', JSON.stringify(result));
			// 			$scope.access_token = result.access_token;
			// 			$scope.loadingShow();
			// 			$scope.initGooglePlus();
			//
      // }, function(error) {
			// 		//$scope.popUp('Opps!', error);
      //     console.log(error);
      // });

    };

	$scope.initGooglePlus = function(){


		if($scope.access_token) {

			var params = {
				access_token: $scope.access_token,
				key: 'AIzaSyBHlHhgh7CAny1VtbnlQMKkiaSmDx6ZO8U'
			};

			$http.get("https://www.googleapis.com/oauth2/v1/userinfo", {params: params}).then(function(result){
				//$scope.popUp("Nice!", JSON.stringify(result.data));
				if(result.data.email){
					var profileData = {
						"email": result.data.email,
						"id": result.data.id,
						"host_id": '',
						"gp_profile": result.data.picture,
						"gp_data": JSON.stringify(result.data),
					};

					//get userData
					$dataFactory.baseRequest(profileData, 'account/check_g_plus_user').then(function(res){

						$scope.loadingHide();
						//$scope.popUp('checkg', JSON.stringify(res.data));

						if(res.data.action == 'login'){
							$localstorage.setObject('userdata', res.data.user);

							//update userData
							$scope.userData = res.data.user;
							$scope.avatarStyle.background = 'url('+$scope.userData.avatar+')';
							$scope.tracker('Google plus login');

							$timeout(function(){
								// $scope.closeLogin();
								$scope.closeSign();
								$scope.closeForgot();
							}, 300);

							$state.go("app.profile");
							$ionicHistory.nextViewOptions({
								disableAnimate: true,
								disableBack: true
							});

						}
						else if(res.data.action == 'signup'){
							$timeout(function(){
								$scope.loginData.id = res.data.id;
								$scope.loginData.first = result.data.given_name;
								$scope.loginData.last = result.data.family_name;
								$scope.loginData.signe = result.data.email;
								$scope.openSignComp();
								$scope.tracker('Google plus signup');
							}, 300);
						}
					},
					function(err){
						$scope.resetLoading(err);
					});

				}
			},
			function(error) {
				$scope.loadingHide();
				$scope.popUp("Opps!", JSON.stringify(error));
				//console.log(JSON.stringify(error));
			});
		}
		else {
			$scope.loadingHide();
			$scope.popUp("Opps!", 'No access token.');
		}

	};


	$scope.fbLogin = function () {
		ngFB.login({scope: 'email'}).then( //,read_stream,publish_actions
			function (response) {
				console.log(response);
				$scope.loadingShow();
				if (response.status === 'connected') {
					console.log('Facebook login succeeded');
					// $scope.closeLogin();
					$scope.getFbUser();
				} else if (response.status === 'not_authorized') {
					// The person is logged into Facebook, but not your app.
					$scope.loadingHide();
					$scope.popUp('Error!', 'Application not authorized.');
					console.log(response.authResponse.accessToken);
				}
			    else {
					// The person is not logged into Facebook, so we're not sure if
					// they are logged into this app or not.
					$scope.loadingHide();
					$scope.popUp('Error!', 'Facebook login failed.');
					console.log('Facebook login failed');
				}
			});
	};

  	$scope.user = $localstorage.getObject('fbUser');
  	$scope.getFbUser = function(){
		ngFB.api({
			path: '/me',
			//params: {fields: 'id,name'}
		}).then(
			function (user) {
				$scope.user = user;
				$localstorage.setObject('fbUser', user);

				var fbData = {
					u_email:user.email,
					fb_data: JSON.stringify(user),
					id: user.id
				};
				console.log(fbData);

				//get userData
				$dataFactory.baseRequest(fbData, 'account/check_fb_user').then(function(res){
					console.log(res.data);
					$scope.loadingHide();
					if(res.data.action == 'login'){
						//update userData
						$scope.userData = res.data.user;
						$scope.user_id = $scope.userData.seeker_id;
						$scope.avatarStyle.background = 'url('+$scope.userData.avatar+')';
						$scope.tracker('Facebook login');

						$timeout(function(){
							// $scope.closeLogin();
							$scope.closeSign();
							$scope.closeForgot();
							$localstorage.setObject('userdata', res.data.user);
						}, 300);
						$state.go("app.profile");
						$ionicHistory.nextViewOptions({
							disableAnimate: true,
							disableBack: true
						});

					}
					else if(res.data.action == 'signup'){
						$timeout(function(){
							$scope.loginData.id = res.data.id;
							$scope.loginData.first = user.first_name;
							$scope.loginData.last = user.last_name;
							$scope.loginData.signe = user.email;
							$scope.openSignComp();
							$scope.tracker('Facebook signup');
						}, 300);
					}

				}, function(err){
					$scope.resetLoading(err);
				});


				console.log(user);
			},
			function (error) {
				$scope.loadingHide();
				$scope.popUp('Opps!', error); //'Something went wrong. Please try again.');
				console.log('Facebook error: ', error);
			}
		);

	};



  	$scope.avatarStyle = {background: 'url(img/default.jpg)', 'background-size': 'cover'};

	if($scope.userData.seeker_id){
		$scope.avatarStyle.background = 'url('+$scope.userData.avatar+')';
	}

	$scope.logout = function(){
		$scope.loadingShow();
		$localstorage.removeItem('userdata');
		$scope.avatarStyle.background = 'url(img/default.jpg)';
		$scope.userData = $localstorage.getObject('userdata');
		$scope.user_id = '';
		console.log($scope.userData);
		$timeout(function() {
			$scope.loadingHide();
			$state.go("app.landing");
			$scope.tracker('Logout');
			//$scope.openLogin();
		}, 2500);
	};

	$scope.country_arr = $localstorage.getObject('countries');

	if(!$scope.country_arr.length){
		$dataFactory.postRequest({}, 'constants').then(function(res){
			console.log('constants ok');//res.data);
			$scope.country_arr = res.data.countries;
			$localstorage.setObject('countries', res.data.countries);
			$localstorage.setObject('messages', res.data.messages);

		}, function(err){
			//$scope.popUp('Opps!', 'Something went wrong. Please try again.');
		});
	}


	//modal video modal
	$ionicModal.fromTemplateUrl('templates/intro-video.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalIntroVideo = modal;
	});

	$scope.openIntroVideo = function(listing) {
		$scope.tracker('Open more insurance');
		$scope.listing = listing;
		console.log($scope.listing);
		$scope.modalIntroVideo.show();
		// $timeout(function(){
		// 	$('#modalVideo').play();
		// }, 1000);

		return false;
	};
	$scope.closeIntroVideo = function() {
		$scope.modalIntroVideo.hide();
	};

	//modal insurance more
	$ionicModal.fromTemplateUrl('templates/insurance-more.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalInsuranceMore = modal;
	});

	$scope.openInsuranceMore = function(listing) {
		$scope.tracker('Open more insurance');
		$scope.listing = listing;
		console.log($scope.listing);
		$scope.modalInsuranceMore.show();
		return false;
	};
	$scope.closeInsuranceMore = function() {
		$scope.modalInsuranceMore.hide();
	};

	//modal terms
	$ionicModal.fromTemplateUrl('templates/terms-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalTerms = modal;
	});

	$scope.openTerms = function(listing) {
		$scope.tracker('Open more terms');
		$scope.listing = listing;
		console.log($scope.listing);
		$scope.modalTerms.show();
		return false;
	};
	$scope.closeTerms = function() {
		$scope.modalTerms.hide();
	};

	
	//modal privacy
	$ionicModal.fromTemplateUrl('templates/privacy-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalPrivacy = modal;
	});

	$scope.openPrivacy = function(listing) {
		$scope.tracker('Open more insurance');
		$scope.listing = listing;
		console.log($scope.listing);
		$scope.modalPrivacy.show();
		return false;
	};
	$scope.closePrivacy = function() {
		$scope.modalPrivacy.hide();
	};
	//modal add space listing
	$ionicModal.fromTemplateUrl('templates/listingsadd-global.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalNewSpaceListing = modal;
	});

	$scope.openNewSpaceListing = function(listing) {
		$scope.tracker('Open listing form');
		$scope.listing = listing;
		console.log($scope.listing);
		$scope.modalNewSpaceListing.show();
		return false;
	};
	$scope.closeNewSpaceListing = function() {
		$scope.modalNewSpaceListing.hide();
	};

	$scope.listingUnit = function(u){
		// $scope.listing.unit = u;
		$('#'+u+'-btn').removeClass('button-outline').siblings().addClass('button-outline');
	};

	$scope.submitSpace = function(){
		console.log('Doing request', $scope.listing);
		$scope.closeNewSpaceListing();
		$scope.popUp('Opps!', 'Please login/signup to continue.', 'app.landingsignup');

	}



	//extend storage modal
	$ionicModal.fromTemplateUrl('templates/activityextend.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalExt = modal;
	});

	$scope.closeExtend = function() {
		$scope.modalExt.hide();
	};

	$scope.extend = {};
	$scope.openExtend = function(m) {
		console.log(m);
		if(m.seeker_id == $scope.userData.seeker_id){
			$scope.extend.seeker_id = m.seeker_id;
			$scope.extend.id = m.id;
			$scope.extend.provider_id = m.provider_id;
			$scope.extend.extra_month = '';

			$scope.modalExt.show();
		}
	};

	$scope.submitExtend = function(r){
		console.log(r);
		if(r.extra_month){
			$scope.loadingShow();
			$dataFactory.baseRequest(r, 'mytasks/extend_period').then(function(res){
				console.log(res);
				$scope.loadingHide();
				$scope.closeExtend();
				$scope.tracker('Extend storage request');
				$scope.popUp('Success!', 'Request successfully sent.');
			}, function(err){
				$scope.resetLoading(err);
			});
		}
		else{
			$scope.popUp('Opps!', 'Number of month is required.');
		}
	};

	//compose message modal
	$ionicModal.fromTemplateUrl('templates/messagesend.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalPm = modal;
	});

	$scope.closePm = function() {
		$scope.modalPm.hide();
	};

	$scope.recepient = {};
	// Open the login modal
	$scope.openPm = function(m, to) {
		$scope.recepient.subject = '';
		$scope.recepient.message = '';
		if(to == 'seeker'){
			$scope.recepient.name = m.seeker_name;
			$scope.recepient.to_id = m.seeker_id;
			$scope.recepient.from = m.provider_id;
		}
		else if(to == 'provider'){
			$scope.recepient.name = m.provider_name;
			$scope.recepient.to_id = m.provider_id;
			$scope.closePm();
			$scope.recepient.from = m.seeker_id;
		}
		else if(to == 'login'){
			$scope.recepient.name = m.sender_name;
			$scope.recepient.to_id = m.sender_id;
			$scope.recepient.from = m.receiver_id;
		}
		console.log(m);
		$scope.modalPm.show();
	};


	$scope.submitMessage = function(r){
		console.log(r);
		if(r.message || r.subject){
			$scope.loadingShow();
			$dataFactory.postRequest(r, 'compose').then(function(res){
				console.log(res);
				$scope.loadingHide();
				$scope.tracker('Send personal message');
				$scope.closePm();
				$scope.popUp('Success!', 'Message sent.');
			}, function(err){
				$scope.resetLoading(err);
			});

		}
		else{
			$scope.popUp('Opps!', 'Subject and message body cannot be empty');
		}
	};

  	//login modal
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	// Triggered in the login
	$scope.closeLogin = function() {
		$scope.modal.hide();
	};

	// Open the login modal
	$scope.openLogin = function() {
		$scope.modal.show();
		$scope.closeSign();
		$scope.closeForgot();
	};


	// Create the signup modal
	$ionicModal.fromTemplateUrl('templates/signup.html', {
		scope: $scope,
	}).then(function(modal) {
		$scope.signModal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeSign = function() {
		$scope.signModal.hide();
	};

	// Open the login modal
	$scope.openSign = function() {
		$scope.signModal.show();
		// $scope.closeLogin();
		$scope.closeForgot();
	};

	// Create the complete signup modal
	$ionicModal.fromTemplateUrl('templates/signupcomplete.html', {
		scope: $scope,
	}).then(function(modal) {
		$scope.signCompModal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeSignComp = function() {
		$scope.signCompModal.hide();
	};

	// Open the login modal
	$scope.openSignComp = function() {
		$scope.signCompModal.show();
		$scope.closeSign();
		// $scope.closeLogin();
		$scope.closeForgot();
	};

	// Create the forgot modal
	$ionicModal.fromTemplateUrl('templates/forgot.html', {
		scope: $scope,
	}).then(function(modal) {
		$scope.forgotModal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeForgot = function() {
		$scope.forgotModal.hide();
	};

	// Open the login modal
	$scope.openForgot = function() {
		$scope.forgotModal.show();
		// $scope.closeLogin();
		$scope.closeSign();
	};



	$scope.doForgot = function(){
		if($scope.loginData.forgot){
			$scope.loadingShow();
			var forgot_data = {
				email: $scope.loginData.forgot,
				formobile: 'yes'
			};
			$dataFactory.baseRequest(forgot_data, 'login/forgotpass').then(function(res){
				console.log(res.data);
				if(res.data.result != 'success'){
					$scope.popUp('Opps!', 'Email not found on our database.');
					$scope.loginData.forgot = '';
				}
				else{
					$scope.tracker('Forgot password');
					$scope.popUp('Success!', 'Please check email for details.');
				}
				$scope.loadingHide();
			}, function(err){
				$scope.resetLoading(err);
			});
		}
		else{
			$scope.popUp('Opps!', 'Valid email is required.');
		}

	};


	$scope.doSignup = function(){
		console.log('Doing login', $scope.loginData);
		if($scope.loginData.signe && $scope.loginData.signp){
			$scope.loadingShow();


			$dataFactory.postRequest($scope.loginData, 'signup').then(function(res){
				console.log(res.data);
				$scope.loadingHide();
				if(res.data.count == 0){
					$scope.tracker('Spacelli signup');
					$scope.openSignComp();
				}
				else{
					$scope.tracker('Spacelli signup email exist');
					$scope.popUp('Opps!', 'Email already exist.');
				}

			}, function(err){
				$scope.resetLoading(err);
			});
		}
		else{
			$scope.popUp('Opps!', 'Valid email and password are required.');
		}
	};

	$scope.doSignupComp = function(){
		console.log('Doing login', $scope.loginData);
		if($scope.loginData.first && $scope.loginData.last && $scope.loginData.signe && $scope.loginData.countryid && $scope.loginData.mobile && ($scope.loginData.seeker || $scope.loginData.trader)){
			$scope.loadingShow();

			$dataFactory.postRequest($scope.loginData, 'signup').then(function(res){
				console.log(res.data);
				$scope.loadingHide();
				// $scope.closeLogin();
				$scope.closeSign();
				$scope.closeForgot();
				$scope.closeSignComp();
				$localstorage.setObject('userdata', res.data.user);
				$scope.userData = res.data.user;
				$scope.tracker('Signup complete');
				$state.go("app.profile");
				$ionicHistory.nextViewOptions({
					disableAnimate: true,
					disableBack: true
				});

			}, function(err){
				$scope.resetLoading(err);
			});

		}
		else{
			$scope.popUp('Opps!', 'Please complete all fields.');
		}

	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		console.log('Doing login', $scope.loginData);

		if($scope.loginData.username && $scope.loginData.password){
			$scope.loadingShow();

			$dataFactory.postRequest($scope.loginData, 'login').then(function(res){
				console.log(res.data);
				$scope.loadingHide();
				if(res.data.count == 0){
					$scope.popUp('Opps!', 'Email or password didn\'t match.');
					$scope.tracker('Login failed');
				}
				else{
					// $scope.closeLogin();
					$scope.closeSign();
					$scope.closeForgot();
					$localstorage.setObject('userdata', res.data.user);
					$scope.tracker('Login success');
					//update userData
					$scope.userData = res.data.user;
					$scope.user_id = res.data.user.seeker_id;
					console.log($scope.user_id, '$scope.user_id');

					$scope.avatarStyle.background = 'url('+$scope.userData.avatar+')';

					$state.go("app.profile");
					$ionicHistory.nextViewOptions({
						disableAnimate: true,
						disableBack: true
					});
				}
			}, function(err){
				$scope.resetLoading(err);
			});

		}
		else{
			$scope.popUp('Opps!', 'Valid email and password are required.');
		}
	};

	//popUps
	$scope.popUp = function(atitle, amessage, callback){
		var alert_settings = {
			title: (atitle) ? atitle : 'Alert',
			template: (amessage) ? amessage : 'Some alert here!'
		};
		var alertPopup = $ionicPopup.alert(alert_settings);
		alertPopup.then(function(res) {
			if(callback){
				$state.go(callback);
			}
			console.log('alert callback');
		});

	};


	$scope.loadingShow = function(txt){
		$ionicLoading.show({
			template: (txt) ? txt : '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>' //<ion-spinner icon="spiral"></ion-spinner><br>Loading'
		});
	};
	$scope.loadingHide = function(){
		$ionicLoading.hide();
	};



    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };

}])

.controller('LoginCtrl', function($scope, $timeout, $stateParams, ionicMaterialInk) {

	$scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();
})

.controller('Login2Ctrl', ['$scope', '$timeout', '$stateParams', 'ionicMaterialInk', '$localstorage', '$state', '$ionicModal', '$dataFactory', '$location', function($scope, $timeout, $stateParams, ionicMaterialInk, $localstorage, $state, $ionicModal, $dataFactory, $location) {

	$scope.$parent.uripath = $location.path();
	console.log($stateParams);

	if($stateParams.login == 'login'){
		$timeout(function () {
			$scope.openLogin();
		}, 10);
	}

	$scope.$parent.clearFabs();
    $timeout(function() {
        // $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();

}])

.controller('SignupPageCtrl', ['$scope', '$timeout', '$stateParams', 'ionicMaterialInk', '$localstorage', '$state', '$ionicModal', '$dataFactory', '$location', function($scope, $timeout, $stateParams, ionicMaterialInk, $localstorage, $state, $ionicModal, $dataFactory, $location) {

	$scope.$parent.uripath = $location.path();
	console.log($stateParams);

	if($stateParams.login == 'login'){
		$timeout(function () {
			$scope.openLogin();
		}, 10);
	}

	$scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();

}])

.controller('LoginPageCtrl', ['$scope', '$timeout', '$stateParams', 'ionicMaterialInk', '$localstorage', '$state', '$ionicModal', '$dataFactory', '$location', function($scope, $timeout, $stateParams, ionicMaterialInk, $localstorage, $state, $ionicModal, $dataFactory, $location) {

	$scope.$parent.uripath = $location.path();
	console.log($stateParams);

	if($stateParams.login == 'login'){
		$timeout(function () {
			$scope.openLogin();
		}, 10);
	}

	$scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();

}])

.controller('SetupCtrl', ['$scope', '$stateParams', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', '$ionicPopup', '$localstorage', '$ionicActionSheet', '$ionicModal', '$http', '$endPoint', '$state', '$ionicLoading', '$dataFactory', '$location', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, $ionicPopup, $localstorage, $ionicActionSheet, $ionicModal, $http, $endPoint, $state, $ionicLoading, $dataFactory, $location) {

    $scope.$parent.showHeader();
    $scope.$parent.loadingShow();
	$scope.baseUrl = $endPoint.baseUrl;
	$scope.$parent.uripath = $location.path();

	//localstorage
	$scope.userData = $localstorage.getObject('userdata');
	var data = {seeker_id : $scope.userData.seeker_id};


	//dash alert counts
	$scope.setup = {};
	$scope.emailtype = {
		plain: false
	};

	var updateCounts = function(){
		$dataFactory.getCounts(data, 'setup').then(function(res){
			console.log(res.data);
			$scope.setup = res.data.account_setup;
			$scope.userData.account_setup = res.data.account_setup;
			$scope.userData.profile_status = res.data.profile_status;
			$localstorage.setObject('userdata', $scope.userData);
			$scope.$parent.loadingHide();
		}, function(err){
			$scope.resetLoading(err);
		});
	};
	updateCounts();

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		//you also get the actual event object
		//do stuff, execute functions -- whatever...
		ionicMaterialMotion.blinds();
	});

	//data for current activity modal
	$scope.activity = {};

	$scope.checkSetup = function($event, type, status){
	  if(type == 'Account'){
		  if(status == 'assertive'){
			  $scope.showSheet();
		  }
		  else{
			$scope.popUp('Verified', 'Your email is verified!');
		  }
		  $event.preventDefault();
	  }
	};


	//popUps
	$scope.popUp = function(atitle, amessage){
		var alert_settings = {
			title: (atitle) ? atitle : 'Alert',
			template: (amessage) ? amessage : 'Some alert here!'
		};
		var alertPopup = $ionicPopup.alert(alert_settings);
		alertPopup;
	};


	$scope.eTypeChange = function(d){
		console.log(d);
	};


	 // Triggered on a button click, or some other target
	 $scope.showSheet = function() {


		   var confirmPopup = $ionicPopup.confirm({
			 title: 'Send email verification to '+$scope.userData.email+'?',
			 template: '<ion-list><ion-checkbox ng-model="emailtype.plain" ng-change="eTypeChange(emailtype)">Plain text email only.</ion-checkbox></ion-list>',
			 scope: $scope
		   });

		   confirmPopup.then(function(res) {
			 if(res) {
			   $scope.sendVerify();
			   console.log('You are sure');
			 } else {
			   console.log('You are not sure');
			 }
		   });


	 };

	 //send verification
	 $scope.sendVerify = function(){
		var data = {
			seeker_id: $scope.userData.seeker_id,
			plaintext: ($scope.emailtype.plain) ? '1' : '0'
		};

		$scope.loadingShow();

		$dataFactory.getCounts(data, 'send_email_verification').then(function(res){
		   $scope.tracker('Send email verification');
		   $scope.loadingHide();
		   $scope.popUp('Success', 'Email sent!');
		   console.log(res.data);
		}, function(err){
			$scope.resetLoading(err);
		});
	 };

	  //modal
//	  $ionicModal.fromTemplateUrl('templates/activitydetails.html', {
//		scope: $scope,
//		animation: 'slide-in-up'
//	  }).then(function(modal) {
//		$scope.modal = modal;
//	  });
//
//	  $scope.openModal = function(activity) {
//		$scope.activity = activity;
//		console.log($scope.activity);
//		$scope.modal.show();
//		return false;
//	  };
//	  $scope.closeModal = function() {
//		$scope.modal.hide();
//	  };
//	  //Cleanup the modal when we're done with it!
//	  $scope.$on('$destroy', function() {
//		$scope.modal.remove();
//	  });
//	  // Execute action on hide modal
//	  $scope.$on('modal.hidden', function() {
//		// Execute action
//	  });
//	  // Execute action on remove modal
//	  $scope.$on('modal.removed', function() {
//		// Execute action
//	  });


}])

.controller('AccountMenuCtrl', ['$scope', '$stateParams', '$timeout', '$state', '$ionicLoading', '$dataFactory', 'ionicMaterialInk', 'ionicMaterialMotion', '$location', function($scope, $stateParams, $timeout, $state, $ionicLoading, $dataFactory, ionicMaterialInk, ionicMaterialMotion, $location) {

    $scope.$parent.showHeader();
	ionicMaterialMotion.blinds();
	$scope.$parent.uripath = $location.path();
}])

.controller('ProfileMenuCtrl', ['$scope', '$stateParams', '$timeout', '$state', '$ionicLoading', '$dataFactory', 'ionicMaterialInk', 'ionicMaterialMotion', '$location', function($scope, $stateParams, $timeout, $state, $ionicLoading, $dataFactory, ionicMaterialInk, ionicMaterialMotion, $location) {

    // Set Header
    $scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();
    // Set Motion
	ionicMaterialMotion.blinds();

}])

.controller('DashboardCtrl', ['$scope', '$stateParams', '$timeout', '$state', '$ionicLoading', '$dataFactory', 'ionicMaterialInk', 'ionicMaterialMotion', '$location', '$localstorage', '$ionicSlideBoxDelegate', function($scope, $stateParams, $timeout, $state, $ionicLoading, $dataFactory, ionicMaterialInk, ionicMaterialMotion, $location, $localstorage, $ionicSlideBoxDelegate) {
	$scope.$parent.loadingShow();
    // Set Header
    $scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();
    // Set Motion
	ionicMaterialMotion.blinds();

	var data = {seeker_id : $scope.$parent.userData.seeker_id};

	$scope.notifications = {};

	$dataFactory.postRequest(data, 'notifications').then(function(res){
		console.log(res.data);
		$scope.notifications = res.data;
		$scope.$parent.loadingHide();
		$scope.$parent.updateCounts();
	}, function(err){
		$scope.resetLoading(err);
	});

	$scope.current = 0;
	$scope.slide = function(to) {
		$scope.current = to;
		$ionicSlideBoxDelegate.slide(to);
	};

	$scope.slideHasChanged = function(i){
		console.log(i);
		$timeout(function(){
			$('.tabs-summary').children(':eq('+i+')').removeClass('button-outline').siblings().addClass('button-outline');
		}, 100);

		if(i == 0){
			$scope.tracker('View summary as seeker');
		}
		else{
			$scope.tracker('View summary as trader');
		}

	};

	$scope.notiAction = function(d){
		console.log(d);
		d.read = 'no';
		$localstorage.setObject('notification', d);

		if(d.link == 'myeachtask'){
			$state.go("app.activity");
		}
		else{
			$state.go("app.search");
		}
	};



}])

.controller('ProfileCtrl', ['$scope', '$stateParams', '$timeout', 'ionicMaterialMotion', 'ionicMaterialInk', '$ionicPopup', '$localstorage', '$ionicActionSheet', '$ionicModal', '$http', '$endPoint', '$state', '$ionicLoading', '$dataFactory', '$cordovaDevice', '$cordovaImagePicker', '$cordovaCamera', 'Camera', '$location', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, $ionicPopup, $localstorage, $ionicActionSheet, $ionicModal, $http, $endPoint, $state, $ionicLoading, $dataFactory, $cordovaDevice, $cordovaImagePicker, $cordovaCamera, Camera, $location) {

	//localstorage
	//$scope.userData = $localstorage.getObject('userdata');
	$scope.vmessages = $localstorage.getObject('messages');
	var data = {seeker_id : $scope.userData.seeker_id};
	$scope.$parent.uripath = $location.path();

	$scope.file = {};

    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

    $timeout(function() {
		$scope.$parent.updateCounts();
        ionicMaterialMotion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionicMaterialInk.displayEffect();

	$scope.request = {};
	$scope.geolocation = {};


	//search full pop up
	$ionicModal.fromTemplateUrl('templates/profilesearch.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalSearchFunc = modal;
	});

	// Triggered in the Declutter
	$scope.closeSearchFunc = function() {
		$scope.modalSearchFunc.hide();
	};

	// Open the Declutter modal
	$scope.openSearchFunc = function() {
		$scope.modalSearchFunc.show();
	};


	$scope.searchTitle = 'Suburb';
	$scope.showLocPop = function(btn_txt) {
		var btn_txt = (btn_txt) ? btn_txt : 'Suburb';
		$scope.searchTitle = btn_txt;
		console.log(btn_txt);
		$scope.openSearchFunc();

	};


	$scope.search = {
		string: '',
		placeholder: 'nospace'
	};

	//get user location from space added
	//var space_search = $localstorage.getObject('search_space');
	var myspace = {}; //($scope.userData.spaces.length) ? $scope.userData.spaces[0] : {};
	//if(space_search.lat){
		//myspace = space_search;
		myspace.city = $scope.userData.suburb; //space_search.searchKey;
		myspace.lat = $scope.userData.lat; //space_search.lng;
		myspace.lang = $scope.userData.lng; //space_search.lng;

	//}

	console.log(myspace);

	if(myspace.lat){
		var my = myspace;
		$scope.search.string = {
			formatted_address: my.city,
			geometry: {
				location: {
					lat: function(){
						return my.lat
					},
					lng: function(){
						return my.lang
					}
				}
			}
		};

		var spaces_data = {};
		spaces_data.space_type = 'search';
		spaces_data.searchKey = my.city;
		spaces_data.lat = my.lat;
		spaces_data.lng = my.lang;
		console.log(spaces_data);
		$localstorage.setObject('search_space', spaces_data);
	}


	$scope.getSpaces = function(geo){
		if(geo){
			//var geo = $scope.search.string;
			$scope.request.geolocation = geo;
			$scope.request.home_location = geo.formatted_address;;
			$scope.request.lat = geo.geometry.location.lat();
			$scope.request.lng = geo.geometry.location.lng();

			var spaces_data = {};
			spaces_data.space_type = 'search';
			spaces_data.searchKey = geo.formatted_address;
			spaces_data.lat = geo.geometry.location.lat();
			spaces_data.lng = geo.geometry.location.lng();
			console.log(spaces_data);
			$localstorage.setObject('search_space', spaces_data);

			console.log($scope.request);
			console.log('spaces_data', spaces_data);

		}

	};

	$scope.submitDeclutter = function(request){
		if(request.first && request.last && request.countryid && request.mobile){
			var home_location = $scope.request.geolocation.formatted_address;
			var lat = $scope.request.geolocation.geometry.location.lat();
			var lng = $scope.request.geolocation.geometry.location.lng();
			var formData =  {
				home_location: home_location,
				lat: lat,
				lng: lng,
				first_name: request.first,
				last_name: request.last,
				calling: request.countryid,
				contact: request.mobile

			};

			console.log(formData);
			$scope.loadingShow();
			$dataFactory.baseRequest(formData, 'frontpage/clutter').then(function(res){
				console.log(res);
				$scope.closeDeclutter();
				$scope.loadingHide();
				$scope.tracker('Declutter Consultation booking');
				$scope.popUp('Success!', 'Declutter Consultation booking successfully submitted.');
			}, function(err){
				$scope.resetLoading(err);
			});
		}
		else{
			$scope.popUp('Error!', 'All fields are required.');
		}
		console.log($scope.request);
	};


	$ionicModal.fromTemplateUrl('templates/logindeclutter.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalDeclutter = modal;
	});

	// Triggered in the Declutter
	$scope.closeDeclutter = function() {
		$scope.modalDeclutter.hide();
	};

	// Open the Declutter modal
	$scope.openDeclutter = function() {

		if(!$scope.search.string.geometry){
			$scope.showLocPop('Search for Space');
			//$scope.popUp('Error!', 'Select location dropdown.');
		}
		else if(!$scope.userData.seeker_id){
			$scope.popUp('Alert', 'Please login to continue.');
			$scope.closeModalAdd();
			$scope.openLogin();
		}
		else{
			$scope.tracker('Search for space');
			$state.go("app.searchconsultant");
		}



//		if($scope.search.string.geometry){
//			$scope.modalDeclutter.show();
//			$scope.closeSign();
//			$scope.closeForgot();
//		}
//		else{
//			$scope.showLocPop('Book Declutter Consultation');
//			//$scope.popUp('Error!', 'Select location dropdown.');
//		}


	};

	// Open the Declutter modal
	$scope.openBrowse = function() {
		if(!$scope.search.string.geometry){
			$scope.showLocPop('Browse Space Requests');
			//$scope.popUp('Error!', 'Select location dropdown.');
		}
		else{
			$scope.tracker('Browse space requests');
			$state.go("app.browse");
		}
	};

	$scope.searchSpace = function(){

		if(!$scope.search.string.geometry){
			$scope.showLocPop('Search for Space');
			//$scope.popUp('Error!', 'Select location dropdown.');
		}
		else if(!$scope.userData.seeker_id){
			$scope.popUp('Alert', 'Please login to continue.');
			$scope.closeModalAdd();
			$scope.openLogin();
		}
		else{
			$scope.tracker('Search for space');
			$state.go("app.search");
		}
	};

	//modal add activity
	$ionicModal.fromTemplateUrl('templates/activityadd.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalAdd = modal;
	});

	$scope.openModalAdd = function(request) {
		if($scope.search.string.geometry){
			$scope.request.geolocation = $scope.search.string;
			$scope.modalAdd.show();
		}
		else{
			$scope.showLocPop('Request Quote');
			//$scope.popUp('Error!', 'Select location dropdown.');
		}
		return false;
	};
	$scope.closeModalAdd = function() {
		$scope.modalAdd.hide();
	};


	$scope.submitRequest = function(){
		console.log('Doing request', $scope.request);
		var formData = {};
		if(!$scope.userData.seeker_id){
			$scope.popUp('Alert', 'Please login to continue.');
			$scope.closeModalAdd();
			$scope.openLogin();
		}
		else if($scope.request.hour_count && $scope.request.hour_count && $scope.request.geolocation && $scope.request.description){
			formData = {
				name: $scope.request.name,
				hour_count: $scope.request.hour_count,
				location: $scope.request.geolocation.formatted_address,
				latitude: $scope.request.geolocation.geometry.location.lat(),
				longitude: $scope.request.geolocation.geometry.location.lng(),
				description: $scope.request.description,
				services_required: ($scope.request.services) ? $scope.request.services : [],
				seeker_id: $scope.userData.seeker_id
			};

			var reqData = {seeker_id: $scope.userData.seeker_id};
			reqData.req_info = formData;
			console.log('Doing request', reqData);

			$scope.$parent.loadingShow();


			$dataFactory.postRequest(reqData, 'post_request').then(function(res){
				console.log(res.data);
				$scope.closeModalAdd();
				$scope.tracker('Post request quote');
				$state.go("app.activity");

			}, function(err){
				$scope.resetLoading(err);
			});


		}
		else{
			$scope.popUp('Alert', 'Please supply all fields required.');
		}

	};



	//upload/capture image
	var convertImgToBase64URL = function (type, url, callback, outputFormat){
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
			var canvas = document.createElement('CANVAS'),
			ctx = canvas.getContext('2d'), dataURL;
			canvas.height = 170; //this.height;
			canvas.width = 170; //this.width;
			if(this.width > this.height){
				canvas.height = this.height;
				canvas.width = this.height;
			}
			else{
				if(type == 'camera'){
					canvas.height = this.width;
					canvas.width = this.width;
				}
			}

			ctx.drawImage(this, 0, 0);
			dataURL = canvas.toDataURL(outputFormat);
			callback(dataURL);
			canvas = null;
		};
		img.src = url;
	};

	var uploadAvatar = function(base64Img){
		var imgData = {
			seeker_id: $scope.userData.seeker_id,
			image: base64Img,
			output_dir: 'uploads/user-profiles/'
		};
		//$scope.popUp('Image URI!', JSON.stringify(imgData));
		$dataFactory.postRequest(imgData, 'images').then(function(res){
			$scope.loadingHide();
			$scope.$parent.avatarStyle.background = 'url('+res.data.avatar+')';
			$scope.$parent.userData.avatar = res.data.avatar;
			$localstorage.setObject('userdata', $scope.$parent.userData);
			$scope.tracker('Upload avatar');
			// updateCurActivity();
		}, function(err){
			$scope.resetLoading(err);
		});
	};



	$scope.captureImage = function(){
		$timeout(function(){
			$('.img-upload-input').click();
		}, 0);

		// var options = {
		//   targetWidth: 226,
		//   targetHeight: 226,
		//   //allowEdit: true,
		//   correctOrientation:true
		// };
		//
		// Camera.getPicture(options).then(function(imageURI) {
		// 	console.log(imageURI);
		// 	convertImgToBase64URL('camera', imageURI, function(base64Img){
		// 		$scope.loadingShow();
		// 		uploadAvatar(base64Img);
		// 	});
		//
		// }, function(err) {
		//   console.err(err);
		// });

	};


	$scope.pickImage = function(){

		var options = {
			maximumImagesCount: 1,
			width: 170,
			height: 170,
			quality: 80
		};

		$cordovaImagePicker.getPictures(options)
		.then(function (results) {
			  for (var i = 0; i < results.length; i++) {
					$scope.loadingShow();
					convertImgToBase64URL('gallery', results[i], function(base64Img){
						uploadAvatar(base64Img);
					});
			  }
		}, function(err) {
			$scope.popUp('Opps!', err);
		  // error getting photos
		});
	};

	$scope.onLoadImgInput = function (e, reader, file, fileList, fileOjects, fileObj) {

		// console.log(fileObj.base64, fileObj);
		var gg = 'data:image/jpeg;base64,'+fileObj.base64;
		uploadAvatar(gg);

  };


	$scope.addMedia = function() {
		$timeout(function(){
			$('.img-upload-input').click();
		}, 0);

		// $scope.hideSheet = $ionicActionSheet.show({
		//   buttons: [
		// 	{ text: 'Take photo' },
		// 	{ text: 'Photo from library' }
		//   ],
		//   titleText: 'Add images',
		//   cancelText: 'Cancel',
		//   buttonClicked: function(index) {
		// 	  $scope.hideSheet();
		// 	  if(index == 0){
		// 	  	$scope.captureImage();
		// 	  }
		// 	  else{
		// 	  	$scope.pickImage();
		// 	  }
		// 	//$scope.addImage(index);
		//   }
		// });
	};


	//data for current activity modal
	$scope.activity = {};

	$scope.checkSetup = function($event, type, status){
	  if(type == 'Account'){
		  if(status == 'assertive'){
			  $scope.showSheet();
		  }
		  else{
			$scope.popUp('Verified', 'Your email is verified!');
		  }
		  $event.preventDefault();
	  }
	};

	//popUps
	$scope.popUp = function(atitle, amessage){
		var alert_settings = {
			title: (atitle) ? atitle : 'Alert',
			template: (amessage) ? amessage : 'Some alert here!'
		};
		var alertPopup = $ionicPopup.alert(alert_settings);
		alertPopup;
	};



}])

.controller('GalleryCtrl', ['$scope', '$stateParams', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', '$localstorage', '$ionicActionSheet', '$ionicModal', '$state', '$ionicLoading', '$dataFactory', '$ionicSlideBoxDelegate', '$ionicPopup', '$location', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, $localstorage, $ionicActionSheet, $ionicModal, $state, $ionicLoading, $dataFactory, $ionicSlideBoxDelegate, $ionicPopup, $location) {

    $scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();

	$scope.userData = $localstorage.getObject('userdata'); //$dataFactory.userData;
	var vmessages = $localstorage.getObject('messages');
	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.spaces = {space_type: 'search'};
	$scope.favorites = {};
	$scope.favChunk = [];
	var getFavs = function(){
		$dataFactory.getCounts(data, 'favorites').then(function(res){
			console.log(res.data);
			$scope.favorites = res.data.favorites;
			var half = (res.data.count == 1) ? 1 : res.data.count/2;
			$scope.favChunk = chunk(res.data.favorites, half);
			console.log($scope.favChunk);
			$scope.$parent.loadingHide();
		}, function(err){
			$scope.resetLoading(err);
		});
	};
	getFavs();

	function chunk(arr, size) {
	  var newArr = [];
	  for (var i=0; i<arr.length; i+=size) {
		newArr.push(arr.slice(i, i+size));
	  }
	  return newArr;
	}

	//modal details
	$ionicModal.fromTemplateUrl('templates/listingsdetails-search.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	});


	$scope.addFav = function(activity, i, chunk) {
		console.log(activity);
	   var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (activity.myfav == 'active') ? 'Remove from favorites?' : 'Add to favorites?'
	   });
	   confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');
			$scope.loadingShow();
			var formData = {
				space_id: activity.id,
				fav_stat: activity.myfav,
				user_id: $scope.userData.seeker_id
			};
			console.log(formData);
			//return false;
			$dataFactory.baseRequest(formData, 'login/myfav').then(function(res){
				$scope.tracker('Remove favorite', formData);
				console.log(res.data);
				getFavs();

			}, function(err){
				$scope.resetLoading(err);
			});

		 } else {
		   console.log('You are not sure');
		 }
	   });

	};

	$scope.activity = {};

	$scope.openModal = function(activity) {
		$scope.activity = activity;
		$scope.tracker('View listing details', {space_id: $scope.activity.id});
		console.log($scope.activity);

		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
		$ionicSlideBoxDelegate.update();
	};

	//modal booking request
	$ionicModal.fromTemplateUrl('templates/listingsbooking.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalBook = modal;
	});

	$scope.openModalBook = function() {
		$scope.tracker('Open booking form', {space_id: $scope.activity.id});
		$scope.modalBook.show();
		return false;
	};
	$scope.closeModalBook = function() {
		$scope.modalBook.hide();
	};


	$scope.submitBooking = function(){
		if(!$scope.userData.seeker_id){
			$scope.popUp('Opps!', 'Please login to continue.');
		}
		else if($scope.userData.profile_status != 'ok'){
			$scope.closeModal();
			$scope.closeModalBook();
			$scope.popUp('Info!', vmessages.error.request_post_validate, 'app.setup');
		}
		else if($scope.activity.months && $scope.activity.message){
			var m = ($scope.activity.months > 1) ? 'months' : 'month';
			var total = $scope.activity.months * $scope.activity.price;
			var text = 'You are booking space for '+ $scope.activity.months + ' '+m+' at $'+$scope.activity.price+'/month. Total of $'+total+'.';
			$scope.showConfirm(text);
		}
		else{
			$scope.popUp('Opps!', 'Please fill all required fields.');
		}

	};

	// A confirm dialog
	$scope.showConfirm = function(text) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (text) ? text : 'Confirm action.'
		});
		confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');

			console.log($scope.activity);
			var formData = {
				storage_days: $scope.activity.months,
				seeker_id: $scope.userData.seeker_id,
				space_id: $scope.activity.id,
				mess_trader_id: $scope.activity.seeker_id,
				message: $scope.activity.message
			};

			$scope.loadingShow();

			$dataFactory.postRequest(formData, 'book_request').then(function(res){
				console.log(res.data);
				$scope.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.tracker('Booking request submitted', {space_id: $scope.activity.id});
				//$state.go("app.activity");
				$scope.popUp('Success!', 'Booking request successfully submitted.', 'app.activity');
			}, function(err){
				$scope.resetLoading(err);
			});


		 } else {
		   console.log('You are not sure');
		 }
		});
	};

	//popUps
//	$scope.popUp = function(atitle, amessage){
//		var alert_settings = {
//			title: (atitle) ? atitle : 'Alert',
//			template: (amessage) ? amessage : 'Some alert here!'
//		};
//		var alertPopup = $ionicPopup.alert(alert_settings);
//		alertPopup;
//	};

	$scope.$parent.loadingShow();

}])

//all other pages
.controller('MessagesCtrl', ['$scope', '$stateParams', '$localstorage', '$dataFactory', '$location', function($scope, $stateParams, $localstorage, $dataFactory, $location) {

    $scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();

	$scope.userData = $localstorage.getObject('userdata');
	var data = {seeker_id : $scope.userData.seeker_id};

}])

.controller('InboxCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', '$location', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal, $location) {

	$scope.$parent.loadingShow();
	$scope.$parent.uripath = $location.path();

	//localstorage
	$scope.userData = $localstorage.getObject('userdata');

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.data = {
		showDelete: false
	};

	$scope.onItemDelete = function(message){
		$scope.messages.splice($scope.messages.indexOf(message), 1);

		console.log(message);
		var data = {
			seeker_id: $scope.userData.seeker_id,
			message_id: message.message_id,
			sender_id: message.sender_id,
			receiver_id: message.receiver_id
		};
		$dataFactory.postRequest(data, 'inbox_delete').then(function(res){
			console.log(res);
			$scope.tracker('Delete inbox', data);
			$scope.notiCounts = res.data.noti_counts;
		}, function(err){
			$scope.resetLoading(err);
		});
	};


	$scope.messages = {};

	$dataFactory.postRequest(data, 'inbox').then(function(res){
		console.log(res.data);
		$scope.messages = res.data;
		$scope.$parent.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});

	$scope.eachMessage = [];
	//modal
	$ionicModal.fromTemplateUrl('templates/messagedetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.showMessage = function(message, i) {
		console.log(message);
		$scope.eachMessage = message;
		if(message.inbstat != 'read'){
			message.inbstat = 'read';
			$scope.eachMessage = message;
			$scope.messages[i] = message;

//			$dataFactory.postRequest({id: message.message_id}, 'inbox_read').then(function(res){
//				console.log(res.data);
//				$scope.$parent.updateCounts();
//			}, function(err){
//				//$scope.resetLoading(err);
//			});
		}
		//$scope.tracker('Read inbox', message);
		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

}])

.controller('OutboxCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal) {

	$scope.$parent.loadingShow();
	//localstorage
	$scope.userData = $localstorage.getObject('userdata');

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.data = {
		showDelete: false
	};

	$scope.onItemDelete = function(message){
		$scope.messages.splice($scope.messages.indexOf(message), 1);
		console.log(message);
		var data = {
			seeker_id: $scope.userData.seeker_id,
			message_id: message.message_id,
			sender_id: message.sender_id,
			receiver_id: message.receiver_id
		};
		$dataFactory.postRequest(data, 'inbox_delete').then(function(res){
			console.log(res);
			$scope.notiCounts = res.data.noti_counts;
		}, function(err){
			$scope.resetLoading(err);
		});
	};


	$scope.messages = {};

	$dataFactory.postRequest(data, 'outbox').then(function(res){
		console.log(res.data);
		$scope.messages = res.data;
		$scope.$parent.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});

	$scope.eachMessage = [];

	//modal
	$ionicModal.fromTemplateUrl('templates/messagedetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.showMessage = function(message) {
		$scope.eachMessage = message;
		$scope.modal.show();
		return false;
	};

	$scope.closeModal = function() {
		$scope.modal.hide();
	};

}])

.controller('TrashCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal) {

	$scope.$parent.loadingShow();
	//localstorage
	$scope.userData = $localstorage.getObject('userdata');

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.data = {
		showDelete: false
	};

	$scope.onItemDelete = function(message){
		$scope.messages.splice($scope.messages.indexOf(message), 1);
		console.log(message);
		var data = {
			seeker_id: $scope.userData.seeker_id,
			message_id: message.message_id,
			sender_id: message.sender_id,
			receiver_id: message.receiver_id
		};
		$dataFactory.postRequest(data, 'inbox_delete').then(function(res){
			console.log(res);
			$scope.notiCounts = res.data.noti_counts;
		}, function(err){
			$scope.resetLoading(err);
		});
	};


	$scope.messages = {};

	$dataFactory.postRequest(data, 'trash').then(function(res){
		console.log(res.data);
		$scope.messages = res.data;
		$scope.$parent.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});

	$scope.eachMessage = [];
	//modal
	$ionicModal.fromTemplateUrl('templates/messagedetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.showMessage = function(message) {
		$scope.eachMessage = message;
		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

}])

.controller('NotificationsCtrl', ['$scope', '$stateParams', '$dataFactory', '$localstorage', '$location', '$state', function($scope, $stateParams, $dataFactory, $localstorage, $location, $state) {

    $scope.$parent.showHeader();
	$scope.$parent.loadingShow();
	$scope.$parent.uripath = $location.path();

	var data = {seeker_id : $scope.$parent.userData.seeker_id};

	$scope.notifications = {};

	$dataFactory.postRequest(data, 'notifications').then(function(res){
		console.log(res.data);
		$scope.notifications = res.data;
		$scope.$parent.loadingHide();
		$scope.$parent.updateCounts();
	}, function(err){
		$scope.resetLoading(err);
	});


	$scope.notiAction = function(d){
		console.log(d);
		d.read = 'no';
		$localstorage.setObject('notification', d);

		$scope.tracker('Tap notification', d);
		if(d.link == 'myeachtask'){
			if(d.provider_id == '0'){
				$state.go("app.activity");
			}
			else{
				$state.go("app.cactivity");
			}
		}
		else{
			$state.go("app.search");
		}
	};
}])



.controller('ActivityCurrentCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$location', '$timeout', '$ionicSlideBoxDelegate', '$filter', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $location, $timeout, $ionicSlideBoxDelegate, $filter) {

    $scope.$parent.showHeader();
	$scope.$parent.loadingShow();
	$scope.$parent.uripath = $location.path();

	$scope.curractivity = [];
	var data = {seeker_id : $scope.userData.seeker_id};

	var updateCurActivity = function(){
		$dataFactory.getCounts(data, 'current_activity').then(function(res){
			console.log(res.data);
			$scope.curractivity = res.data;
			var noti = $localstorage.getObject('notification');
			if (noti.read == 'no'){
				$scope.curractivity.data.forEach(function(i){
					var tsk_id = (noti.task_id != '' && noti.task_id != '0') ? noti.task_id : noti.field_id;
					if(i.id == tsk_id){
						noti.read = 'yes';
						$localstorage.setObject('notification', noti);
						$timeout(function(){
							$scope.openModal(i);
						}, 5);
					}
				});
			}

			$scope.$parent.loadingHide();
		}, function(err){
			$scope.resetLoading(err);
		});

	};
	updateCurActivity();

	//modal
	$ionicModal.fromTemplateUrl('templates/activitydetails.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.openModal = function(activity) {
		$scope.tracker('Open activity details', activity);
		$scope.activity = activity;
		if(activity.date_returned != '0000-00-00 00:00:00'){
			$scope.the_return = {
				date: new Date(activity.date_returned)
			};
			console.log($scope.the_return);
		}
		console.log($scope.activity);
		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	var tomorrow = new Date();
	$scope.the_return = {
		date: new Date()
	};
	tomorrow.setDate(tomorrow.getDate() + 1);
	$scope.the_returnmax = tomorrow.toJSON().slice(0,10);
	// Triggered on a button click, or some other target
	$scope.showPopupReturn = function(task_id, status_text) {
		var themessage = (status_text == 'Returned') ? 'Confirm return date and mark completed' : 'Confirm goods are returned';
		var submessage = (status_text == 'Returned') ? 'Update if incorrect' : 'Add return date';
	  // An elaborate, custom popup
	  var myPopup = $ionicPopup.show({
		template: '<input type="date" id="returndate_input" ng-model="the_return.date" max="{{the_returnmax}}">',
		title: themessage,
		subTitle: submessage,
		scope: $scope,
		buttons: [
		  { text: 'Cancel' },
		  {
			text: '<b>OK</b>',
			type: 'button-positive',
			onTap: function(e) {
			  if (!$scope.the_return.date) {
				//don't allow the user to close unless he enters wifi password
				e.preventDefault();
			  } else {
				   //loading state
				   $scope.$parent.loadingShow();

					var data = {
						returndate: $filter('date')($scope.the_return.date, 'yyyy-MM-dd'),
						seeker_id: $scope.userData.seeker_id,
						id: task_id,
						stat: status_text
				   };

				   $dataFactory.getCounts(data, 'activity_status').then(function(res){
					   console.log(res.data);
					   $scope.tracker('Update storage activity status', res.data);
					   $scope.$parent.loadingHide();
					   updateCurActivity();
					   $scope.closeModal();
					   $scope.popUp('Success!', res.data.return_data.message);
					   //$state.go($state.current, {}, {reload: true});
				   }, function(err){
						$scope.resetLoading(err);
				   });


				   return data; //$scope.the_return.date;
			  }
			}
		  }
		]
	  });

	  myPopup.then(function(res) {
		console.log('Tapped!', res);
	  });

	 };

	 // A confirm dialog
	 $scope.confirmChangeStat = function(status_text, task_id) {
		 console.log(status_text, task_id);
		 var amessage = 'You are changing status to "In Storage"';
		 if(status_text == 'In Storage'){
			 if($scope.activity.seeker_id != $scope.userData.seeker_id){
			 	$scope.showPopupReturn(task_id, status_text);
				return false;
			 }
			 else{
				amessage = 'Confirm goods are in storage.';
			 }
		 }
		 else if(status_text == 'Awaiting'){
		 	amessage = 'Pay '+$scope.activity.provider_name+' $'+$scope.activity.theprorate+' now.';
		 }
		 else if(status_text == 'Returned'){
		 	$scope.showPopupReturn(task_id, status_text);
			return false;

			//amessage = 'Confirm request is completed.';
		 }
		 else if(status_text == 'Pending'){
		 	amessage = 'Confirm booking for $'+$scope.activity.rental_fee_full+'/month.';
		 }

	   var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (amessage) ? amessage : 'Confirm action.'
	   });
	   confirmPopup.then(function(res){
		 if(res){
		   console.log('You are sure');

		   //loading state
		   $scope.$parent.loadingShow();

		   var data = {
		   		seeker_id: $scope.userData.seeker_id,
				id: task_id,
				stat: status_text
		   };

		   $dataFactory.getCounts(data, 'activity_status').then(function(res){
			   console.log(res.data);
			   $scope.tracker('Update storage activity status', res.data);
			   //$scope.$parent.loadingHide();
			   updateCurActivity();
			   $scope.closeModal();
			   $scope.popUp('Success!', 'Action completed.');
			   //$state.go($state.current, {}, {reload: true});
		   }, function(err){
				$scope.resetLoading(err);
		   });
		 } else {
		   console.log('You are not sure');
		 }
	   });
	 };


}])

.controller('ActivityCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$location', '$timeout', '$ionicSlideBoxDelegate', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $location, $timeout, $ionicSlideBoxDelegate) {

    $scope.$parent.showHeader();
	$scope.$parent.loadingShow();
	$scope.$parent.uripath = $location.path();

	//localstorage
	$scope.userData = $localstorage.getObject('userdata');
	$scope.vmessages = $localstorage.getObject('messages');

	var data = {seeker_id : $scope.userData.seeker_id, activity_type: 'open'};

	$scope.$parent.activities = [];

	$scope.completeCount = $scope.userData.seeker_paid;
	$scope.current = 0;
	$scope.slide = function(to) {
		$scope.current = to;
		$ionicSlideBoxDelegate.slide(to);
	};

	$scope.slideHasChanged = function(i){
		console.log(i);
		$scope.completeCount = $scope.userData.seeker_paid;

		if(i == 0){
			$scope.tracker('View summary as seeker');
		}
		else{
			$scope.completeCount = $scope.userData.running_paid;
			$scope.tracker('View summary as trader');
		}


		$timeout(function(){
			$('.tabs-summary').children(':eq('+i+')').removeClass('button-outline').siblings().addClass('button-outline');
		}, 100);
	};

	var updateCurActivity = function(){

		$dataFactory.postRequest(data, 'current_activity').then(function(res){
			console.log(res.data);
			$scope.$parent.loadingHide();
			$scope.$parent.activities = res.data.activity;
			$scope.$parent.userData = res.data.user;
			$localstorage.setObject('userdata', res.data.user);

			var noti = $localstorage.getObject('notification');
			if (noti.read == 'no'){
				$scope.activities.data.forEach(function(i){
					var tsk_id = (noti.task_id != '' && noti.task_id != '0') ? noti.task_id : noti.field_id;
					if(i.id == tsk_id){
						noti.read = 'yes';
						$localstorage.setObject('notification', noti);
						$timeout(function(){
							$scope.openModal(i);
						}, 5);
					}
				});
			}

		}, function(err){
			$scope.resetLoading(err);
		});
	};

	updateCurActivity();

	//modal add
	$scope.request = {};
	$scope.geolocation = {};

	$ionicModal.fromTemplateUrl('templates/activityadd.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalAdd = modal;
	});

	$scope.openModalAdd = function(request) {
		$scope.tracker('Open add request space form');
		$scope.request = request;
		console.log($scope.request);
		$scope.modalAdd.show();

		return false;
	};



	$scope.closeModalAdd = function() {
		$scope.modalAdd.hide();
	};


	$scope.submitRequest = function(){
		console.log('Doing request', $scope.request);
		var formData = {};
		if($scope.request.hour_count && $scope.request.hour_count && $scope.request.geolocation && $scope.request.description){
			formData = {
				name: $scope.request.name,
				hour_count: $scope.request.hour_count,
				location: $scope.request.geolocation.formatted_address,
				latitude: $scope.request.geolocation.geometry.location.lat(),
				longitude: $scope.request.geolocation.geometry.location.lng(),
				description: $scope.request.description,
				services_required: ($scope.request.services) ? $scope.request.services : [],
				seeker_id: $scope.userData.seeker_id
			};

			var reqData = data;
			reqData.req_info = formData;
			console.log('Doing request', reqData);

			$scope.$parent.loadingShow();
//			$scope.closeModalAdd();
//			updateCurActivity();

			$dataFactory.postRequest(reqData, 'post_request').then(function(res){
				console.log(res.data);
				$scope.closeModalAdd();
				$scope.tracker('Space request submitted', formData);
				updateCurActivity();

			}, function(err){
				$scope.resetLoading(err);
			});


		}
		else{
			$scope.popUp('Alert', 'Please supply all fields required.');
		}

	};

	//modal details
	$ionicModal.fromTemplateUrl('templates/activitydetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.openModal = function(activity) {
		$scope.tracker('Open activity details', {activity_id: activity.id});
		$scope.activity = activity;
		console.log($scope.activity);
		if($scope.activity.my_offer.length){
			$scope.activity.my_offer[0].offer = parseInt($scope.activity.my_offer[0].offer);
		}

		$scope.modal.show();
		return false;
	};

	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	// A confirm dialog
	$scope.confirmChangeStat = function(status_text, task_id) {
		 console.log(status_text, task_id);
		 var amessage = 'You are changing status to "In Storage"';
		 if(status_text == 'In Storage'){
		 	amessage = 'Confirm goods are returned.';
		 }
		 else if(status_text == 'Awaiting'){
		 	amessage = 'Confirm payment received.';
		 }
		 else if(status_text == 'Returned'){
		 	amessage = 'Confirm request is completed.';
		 }
		 else if(status_text == 'Pending'){
		 	amessage = 'Confirm booking for $'+$scope.activity.rental_fee_full+'/month.';
		 }

	   var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (amessage) ? amessage : 'Confirm action.'
	   });
	   confirmPopup.then(function(res){
		 if(res){
		   console.log('You are sure');

		   //loading state
		   $scope.$parent.loadingShow();

		   //var url = $endPoint.url+'activity_status'+$endPoint.params;
		   var data = {
		   		seeker_id: $scope.userData.seeker_id,
				id: task_id,
				stat: status_text
		   };
		   $dataFactory.postRequest(data, 'activity_status').then(function(res){
		   //$http.post(url, data).then(function(res){
			   console.log(res.data);
			   $scope.tracker('Update storage activity status', res.data);
			   $scope.closeModal();
			   updateCurActivity();
		   }, function(err){
				$scope.resetLoading(err);
		   });
		 } else {
		   console.log('You are not sure');
		 }
	   });
	};


	//modal offer/comments
	$scope.reqMess = [];
	$scope.reqMessTitle = '';
	$scope.reqMessFormTitle = '';
	$ionicModal.fromTemplateUrl('templates/requestoffers.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalOffers = modal;
	});

	$scope.openModalOffers = function(type) {
		console.log(type);
		$scope.reqMess = (type == 'offers') ? $scope.activity.offers : $scope.activity.comments;
		$scope.reqMessTitle = (type == 'offers') ? 'Offers' : 'Comments';
	    $scope.tracker('View '+type, {activity_id: $scope.activity.id});

		if(type == 'offers'){
			if($scope.activity.my_offer.length == 0){
				$scope.reqMessFormTitle = 'Offers';
			}
			else{
				$scope.reqMessFormTitle = 'Update Offer';
			}
		}
		else{
			$scope.reqMessFormTitle = 'Add Comment';
		}


		console.log($scope.reqMess);
		$scope.modalOffers.show();
		return false;
	};
	$scope.closeModalOffers = function() {
		$scope.modalOffers.hide();
	};



	//modal booking request
	$ionicModal.fromTemplateUrl('templates/requestbooking.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalBook = modal;
	});


	$scope.openModalBook = function() {
	    $scope.tracker('Open '+$scope.reqMessTitle+' form', {activity_id: $scope.activity.id});
		$scope.modalBook.show();
		return false;
	};
	$scope.closeModalBook = function() {
		$scope.modalBook.hide();
	};


	$scope.submitComment = function(){
		var comment = $scope.activity.my_comment;

		if(comment && comment.details){
			comment['an_offer'] = '1';
			comment['provider_id'] = $scope.userData.seeker_id;
			comment['task_id'] = $scope.activity.id;
			console.log(comment);

			$scope.$parent.loadingShow();

			$dataFactory.postRequest({data: comment}, 'request_offer').then(function(res){
				console.log(res.data);
				//$scope.activity.my_offer[0] = formData;
				$scope.$parent.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.closeModalOffers();
				$scope.popUp('Success!', 'Comment successfully added.');
				$scope.tracker('Comment submitted', {activity_id: $scope.activity.id});
				updateCurActivity();
				//$state.go("app.activity");

			}, function(err){
				$scope.resetLoading(err);
			});


		}
		else{
			$scope.popUp('Opps!', 'Comment field cannot be blank.');
		}
	};

	$scope.submitBooking = function(){
		if($scope.activity.my_offer.length > 0){
			if($scope.activity.my_offer[0].offer && $scope.activity.my_offer[0].details && $scope.activity.my_offer[0].paymenttype){
				var offer = $scope.activity.my_offer[0];
				offer['an_offer'] = '0';
				offer['provider_id'] = $scope.userData.seeker_id;
				offer['task_id'] = $scope.activity.id;
				$scope.activity.my_offer[0] = offer;

				console.log(offer);
				var m = ($scope.activity.hour_count > 1) ? 'months' : 'month';
				var hour_count = $scope.activity.hour_count;
				var text = '$'+ $scope.activity.my_offer[0].offer + '/month for '+hour_count+' '+m+'.';
				if($scope.activity.my_offer[0].paymenttype == 'fixed'){
					text = '$'+ $scope.activity.my_offer[0].offer + ' for '+hour_count+' '+m+'.';
				}
				$scope.showConfirm(text);
				//$scope.popUp('Success!', text);
			}
			else{
				$scope.popUp('Opps!', 'Please fill all required fields.');
			}
		}
		else{
			$scope.popUp('Opps!', 'Please fill all required fields.');
		}

	};

	// A confirm dialog
	$scope.showConfirm = function(text) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (text) ? text : 'Confirm action.'
		});
		confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');

			var offer = $scope.activity.my_offer[0];

			var formData = $scope.activity.my_offer[0];
		    console.log(formData);

			$scope.loadingShow();

			$dataFactory.postRequest({data: formData}, 'request_offer').then(function(res){
				console.log(res.data);
				$scope.activity.my_offer[0] = formData;
				$scope.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.closeModalOffers();
				updateCurActivity();
				$scope.tracker('Offer submitted', {activity_id: $scope.activity.id});
				$scope.popUp('Success!', 'Offer successfully posted.');
			}, function(err){
				$scope.resetLoading(err);
			});


		 } else {
		   console.log('You are not sure');
		 }
		});
	};

	// A confirm dialog
	$scope.confirmAccept = function(m) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: 'Please confirm you accept the offer made by '+m.provider_name+'?'
		});
		confirmPopup.then(function(res) {
		 if(res) {
				$scope.loadingShow();
			    console.log('You are sure');

				var formData = {
					provider_id: m.provider_id,
					task_id: m.task_id,
					seeker_id: $scope.user_id
				};

//				console.log(formData);
//				return false;

				$dataFactory.baseRequest(formData, 'mytasks/accept_provider').then(function(res){
					$scope.tracker('Offer accepted', formData);
					console.log(res.data);
					$scope.loadingHide();
					$scope.closeModalBook();
					$scope.closeModal();
					$scope.closeModalOffers();

					$scope.popUp('Success!', 'Offer successfully accepted.');
					updateCurActivity();
				}, function(err){
					//$scope.loadingHide();
					$scope.closeModalBook();
					$scope.closeModal();
					$scope.closeModalOffers();

					//$scope.popUp('Success!', 'Offer successfully accepted.');
					updateCurActivity();
					//$scope.resetLoading(err);
				});

		 } else {
			   console.log('You are not sure');
		 }
		});
	};

}])

.controller('EditProfileCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$cordovaDevice', '$cordovaImagePicker', '$cordovaCamera', 'Camera', '$ionicActionSheet', '$location', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $cordovaDevice, $cordovaImagePicker, $cordovaCamera, Camera, $ionicActionSheet, $location) {

    $scope.$parent.showHeader();
//	$scope.$parent.loadingShow();
	$scope.profile = {};
	$scope.info = {};
	$scope.$parent.uripath = $location.path();
	$scope.search = {};

	var ulocation = ($scope.userData.lat) ? {
		formatted_address: $scope.userData.suburb,
		geometry: {
			location: {
				lat: function(){
					return $scope.userData.lat;
				},
				lng: function(){
					return $scope.userData.lng;
				}
			}
		}
	} : {};
	$scope.search.string = ulocation;


	//upload/capture image
	var convertImgToBase64URL = function (type, url, callback, outputFormat){
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
			var canvas = document.createElement('CANVAS'),
			ctx = canvas.getContext('2d'), dataURL;
			canvas.height = 170; //this.height;
			canvas.width = 170; //this.width;
			if(this.width > this.height){
				canvas.height = this.height;
				canvas.width = this.height;
			}
			else{
				if(type == 'camera'){
					canvas.height = this.width;
					canvas.width = this.width;
				}
			}

			ctx.drawImage(this, 0, 0);
			dataURL = canvas.toDataURL(outputFormat);
			callback(dataURL);
			canvas = null;
		};
		img.src = url;
	};

	var uploadAvatar = function(base64Img){
		var imgData = {
			seeker_id: $scope.userData.seeker_id,
			image: base64Img,
			output_dir: 'uploads/user-profiles/'
		};
		//$scope.popUp('Image URI!', JSON.stringify(imgData));
		$dataFactory.postRequest(imgData, 'images').then(function(res){
			$scope.loadingHide();
			$scope.$parent.avatarStyle.background = 'url('+res.data.avatar+')';
			$scope.$parent.userData.avatar = res.data.avatar;
			$localstorage.setObject('userdata', $scope.$parent.userData);
			$scope.tracker('Upload avatar');
			// updateCurActivity();
		}, function(err){
			console.log(err);
			$scope.resetLoading(err);
		});
	};

	$scope.captureImage = function(){

		var options = {
		  targetWidth: 226,
		  targetHeight: 226,
		  //allowEdit: true,
		  correctOrientation:true
		};

		Camera.getPicture(options).then(function(imageURI) {
			console.log(imageURI);
			convertImgToBase64URL('camera', imageURI, function(base64Img){
				$scope.loadingShow();
				uploadAvatar(base64Img);
			});

		}, function(err) {
		  console.err(err);
		});

	};


	$scope.pickImage = function(){

		var options = {
			maximumImagesCount: 1,
			width: 170,
			height: 170,
			quality: 80
		};

		$cordovaImagePicker.getPictures(options)
		.then(function (results) {
			  for (var i = 0; i < results.length; i++) {
					$scope.loadingShow();
					convertImgToBase64URL('gallery', results[i], function(base64Img){
						uploadAvatar(base64Img);
					});
			  }
		}, function(err) {
			$scope.popUp('Opps!', err);
		  // error getting photos
		});
	};


	$scope.onLoadImgInput = function (e, reader, file, fileList, fileOjects, fileObj) {

		// console.log(fileObj.base64, fileObj);
		var gg = 'data:image/jpeg;base64,'+fileObj.base64;
		uploadAvatar(gg);

  };


	$scope.addMedia = function() {
		$('.img-upload-input').click();


		// $scope.hideSheet = $ionicActionSheet.show({
		//   buttons: [
		// 	{ text: 'Take photo' },
		// 	{ text: 'Photo from library' }
		//   ],
		//   titleText: 'Add images',
		//   cancelText: 'Cancel',
		//   buttonClicked: function(index) {
		// 	  $scope.hideSheet();
		// 	  if(index == 0){
		// 	  	$scope.captureImage();
		// 	  }
		// 	  else{
		// 	  	$scope.pickImage();
		// 	  }
		// 	//$scope.addImage(index);
		//   }
		// });
	};



	$scope.profile = $scope.$parent.userData;
	var uData = $scope.profile;
	$scope.info.seeker_id = uData.seeker_id;
	$scope.info.trade_space = (uData.trade_space == '1') ? true : false;
	$scope.info.require_space = (uData.require_space == '1') ? true : false;
	$scope.info.description = uData.description;

	var data = {seeker_id : $scope.userData.seeker_id};

//	$dataFactory.postRequest(data, 'user_info').then(function(res){
//		console.log(res.data);
//		$scope.$parent.loadingHide();
//		var uData = res.data.user;
//		$scope.profile = uData;
//	   $scope.$parent.userData = res.data.user;
//	   $localstorage.setObject('userdata', res.data.user);
//
//		$scope.info.seeker_id = uData.seeker_id;
//		$scope.info.trade_space = (uData.trade_space == '1') ? true : false;
//		$scope.info.require_space = (uData.require_space == '1') ? true : false;
//		$scope.info.description = uData.description;
//
//	}, function(err){
//		$scope.resetLoading(err);
//	});

	$scope.submitProfile = function(info){
		console.log(info);
		if(!info.description || (!info.trade_space && !info.require_space) || !$scope.search.string.geometry){
			$scope.popUp('Opps!','Please fill required fields.');
			return false;
		}
		if(!$scope.userData.seeker_id){
			$scope.popUp('Opps!','Please login.');
			return false;
		}
		else{
			$scope.$parent.loadingShow();

			var geo = $scope.search.string;
			info.suburb = geo.formatted_address;
			info.lat = geo.geometry.location.lat();
			info.lng = geo.geometry.location.lng();

			console.log(info);

			$dataFactory.postRequest(info, 'user_info').then(function(res){
				$scope.$parent.loadingHide();
				$scope.tracker('Update user profile');
				$scope.popUp('Success', 'Profile successfully updated!');
				$scope.$parent.userData = res.data.user;
				$localstorage.setObject('userdata', res.data.user);
				console.log(res.data);
			}, function(err){
				$scope.resetLoading(err);
			});

		}
	};


}])

.controller('VerificationsCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicActionSheet', 'ngFB', '$cordovaOauth', 'GooglePlus', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicActionSheet, ngFB, $cordovaOauth, GooglePlus) {

  $scope.$parent.showHeader();
	$scope.loadingShow();

	$scope.userData = $localstorage.getObject('userdata');
	console.log($scope.userData);
	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.verifications = {};

	var theVerifications = function(){
		$dataFactory.postRequest(data, 'verifications').then(function(res){
			$scope.loadingHide();
			$scope.verifications = res.data.data;
			console.log($scope.verifications);

		}, function(err){
			$scope.resetLoading(err);
		});
	};
	theVerifications();

	$scope.verifyLinkedIn = function(){
		$cordovaOauth.linkedin('75tpfodcr9xyfr', 'r1pTf90Tyz7BgMFh', ['r_basicprofile', 'r_emailaddress'], 'Q5W965rQP0').then(
			function(result) {
				//$scope.popUp('yeah!', JSON.stringify(result));
				console.log(JSON.stringify(result));
				$scope.linked_token = result.access_token;
				$scope.loadingShow();
				initLinkedIn();

			},
			function(error) {
				console.log(error);
				$scope.popUp('Opps!', error);
			}
		);
	};


	var initLinkedIn = function(){
		if($scope.linked_token) {
			var params = {
				oauth2_access_token: $scope.linked_token,
				format: 'json'
			};

			//$scope.popUp("linked_token!", JSON.stringify(params));

			$http.get("https://api.linkedin.com/v1/people/~:(email-address,first-name,last-name,id)", {params: params}).then(function(result){
				var profileData = {
					user_id: $scope.userData.seeker_id,
					lin_data: JSON.stringify(result.data)
				};

				//store LinkedIn data
				$dataFactory.baseRequest(profileData, 'settings/connect_linkedin').then(function(res){
					$scope.popUp('Success!', 'LinkedIn successfully connected.');
					$scope.loadingHide();
					theVerifications();
					$scope.tracker('LinkedIn verified');
				},
				function(err){
					$scope.resetLoading(err);
				});



				$scope.popUp("api.linked!", JSON.stringify(result.data));
			},
			function(error) {
				$scope.popUp("api.linked err!", JSON.stringify(error));
				console.log(JSON.stringify(error));
			});
		}

	};


  $scope.googleLogin = function() {
		GooglePlus.login().then(function (authResult) {
				console.log(authResult);

				GooglePlus.getUser().then(function (result) {
					$scope.loadingShow();

					console.log(result, 'GooglePlus.getUser');
					if(result.result.id){
						var profileData = {
							user_id: $scope.userData.seeker_id,
							email: '', //result.data.email,
							gp_data: JSON.stringify(result.result),
							id: result.result.id
						};

						//store google data
						$dataFactory.baseRequest(profileData, 'settings/connect_gplus').then(function(res){
							$scope.popUp('Success!', 'Google+ successfully connected.');
							$scope.loadingHide();
							theVerifications();
							$scope.tracker('Google+ verified');
						},
						function(err){
							$scope.resetLoading(err);
						});

					}
				},
				function(error) {
					$scope.loadingHide();
					$scope.popUp("Opps!", JSON.stringify(error));
					//console.log(JSON.stringify(error));
				});
		});




  //   $cordovaOauth.google("732731336794-ugkqa5p9tik23sv42a6d2nesan6b3v88.apps.googleusercontent.com", ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]).then(function(result) {
	//       console.log(JSON.stringify(result));
	// 			//$scope.popUp('Token!', JSON.stringify(result));
	// 			$scope.access_token = result.access_token;
	// 			$scope.loadingShow();
	// 			initGooglePlus();
  //   }, function(error) {
	// $scope.popUp('Opps!', error);
  //       console.log(error);
  //   });
  };

	var initGooglePlus = function(){
		if($scope.access_token) {
			var params = {
				access_token: $scope.access_token,
				key: 'AIzaSyBHlHhgh7CAny1VtbnlQMKkiaSmDx6ZO8U',
				//fields: "id,name,picture,email",
				//format: "json"
			};
			$http.get("https://www.googleapis.com/oauth2/v1/userinfo", {params: params}).then(function(result){
				if(result.data.email){
					var profileData = {
						user_id: $scope.userData.seeker_id,
						email: result.data.email,
						gp_data: JSON.stringify(result.data),
						id: result.data.id
					};

					//store google data
					$dataFactory.baseRequest(profileData, 'settings/connect_gplus').then(function(res){
						$scope.popUp('Success!', 'Google+ successfully connected.');
						$scope.loadingHide();
						theVerifications();
						$scope.tracker('Google+ verified');
					},
					function(err){
						$scope.resetLoading(err);
					});

				}
				//$scope.popUp("Nice!", JSON.stringify(result.data));
			},
			function(error) {
				$scope.popUp("Opps!", JSON.stringify(error));
				console.log(JSON.stringify(error));
			});
		}
		else {
			$scope.popUp("Opps!", 'No access token.');

		}

	};


	$scope.fbLogin = function () {
		ngFB.login({scope: 'email'}).then( //,read_stream,publish_actions
			function (response) {
				$scope.loadingShow();
				console.log(response);
				if (response.status === 'connected') {
					console.log('Facebook login succeeded');
					$scope.getFbUser();
				} else if (response.status === 'not_authorized') {
					// The person is logged into Facebook, but not your app.
					$scope.loadingHide();
					$scope.popUp('Error!', 'Application not authorized.');
					console.log(response.authResponse.accessToken);
				}
			    else {
					// The person is not logged into Facebook, so we're not sure if
					// they are logged into this app or not.
					$scope.loadingHide();
					$scope.popUp('Error!', 'Facebook login failed.');
					console.log('Facebook login failed');
				}
			});
	};

  	$scope.user = $localstorage.getObject('fbUser');
  	$scope.getFbUser = function(){
		ngFB.api({
			path: '/me',
			//params: {fields: 'id,name'}
		}).then(
			function (user) {
				$scope.user = user;
				$localstorage.setObject('fbUser', user);
				// $scope.user_id = $scope.userData.seeker_id;
				// console.log('getFbUser', $scope.userData.seeker_id);

				var fbData = {
					user_id: $scope.userData.seeker_id,
					u_email: user.email,
					fb_data: JSON.stringify(user),
					id: user.id
				};
				console.log(fbData);

				//get userData
				$dataFactory.baseRequest(fbData, 'settings/connect_fb').then(function(res){
					console.log(res.data);
					$scope.popUp('Success!', 'Facebook successfully connected.');
					$scope.loadingHide();
					theVerifications();
					$scope.tracker('Facebook verified');
				}, function(err){
					$scope.resetLoading(err);
				});

				console.log(user);
			},
			function (error) {
				$scope.loadingHide();
				$scope.popUp('Opps!', 'Something went wrong. Please try again.');
				console.log('Facebook error: ', error);
			}
		);

	};


	$scope.actionVerify = function(v){
		console.log(v.mess);
		if(v.mess == 'Email'){
			if(v.status != 'ok'){
				$scope.showSheet();
			}
			else{
				var email = $scope.userData.email;
				$scope.popUp('Email Verified', email + ' is verified.');
			}

		}
		else if(v.mess == 'Mobile'){
			if(v.status != 'ok'){
				$scope.openModalMob();
			}
			else{
				var mobile = $scope.userData.country_code +''+$scope.userData.mobile;
				$scope.popUp('Mobile Verified', mobile + ' is verified.');
			}
		}
		else if(v.mess == 'Facebook'){
			if(v.status != 'ok'){
				$scope.fbLogin();
			}
			else{
				$scope.popUp('Verified','Facebook is connected.');
			}
		}
		else if(v.mess == 'Google+'){
			if(v.status != 'ok'){
				$scope.googleLogin();
			}
			else{
				$scope.popUp('Verified', 'Google+ is connected.');
			}
		}
		else if(v.mess == 'LinkedIn'){

			if(v.status != 'ok'){
				$scope.verifyLinkedIn();
			}
			else{
				$scope.popUp('Verified', 'LinkedIn is connected.');
			}
		}

		else if(v.mess == 'AirBnb'){
			if(v.status != 'ok'){
				$scope.airBnb();
			}
			else{
				var airbnb = $scope.userData.airbnb;
				$scope.popUp('AirBnb Verified', 'AirBnb Profile is verified.');
			}
		}
	};


	// Triggered on a button click, or some other target
	$scope.showSheet = function() {

	   // Show the action sheet
	   var hideSheet = $ionicActionSheet.show({
		 buttons: [
		   { text: '<b>Send</b>' }
		 ],
		 titleText: 'Send email verification',
		 cancelText: 'Cancel',
		 cancel: function() {
			  // add cancel code..
			},
		 buttonClicked: function(index) {
			 $scope.sendVerify();
			 return true;
		 }
	   });

	   // For example's sake, hide the sheet after two seconds
	   // hideSheet();

	 };

	 //send verification
	 $scope.sendVerify = function(){
		var data = {seeker_id: $scope.userData.seeker_id};

		$dataFactory.getCounts(data, 'send_email_verification').then(function(res){
		   $scope.tracker('Send email verification');
		   $scope.popUp('Success', 'Email sent!');
		   console.log(res.data);
		}, function(err){
			$scope.resetLoading(err);
		});
	 };


	//modal booking request
	$ionicModal.fromTemplateUrl('templates/verificationmobile.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalMob = modal;
	});


	$scope.openModalMob = function() {
	    $scope.tracker('Open add mobile form');
		$scope.modalMob.show();
		return false;
	};
	$scope.closeModalMob = function() {
		$scope.modalMob.hide();
	};

	$scope.mymob = {
		country_id: $scope.userData.country_id,
		sms_key: $scope.userData.sms_key,
		mobile: parseInt($scope.userData.mobile)
	};
	console.log($scope.mymob);

	$scope.submitMobile = function(mob){
		if(mob.country_id == '0' || !mob.mobile){
			$scope.popUp('Opps!', 'All fields are required.');
		}
		else{
			$scope.loadingShow();
			mob.seeker_id = $scope.userData.seeker_id;
			mob.type = 'mobile';
			$dataFactory.postRequest(mob, 'verifications').then(function(res){
				console.log(res.data);
				$scope.loadingHide();

				$scope.mymob.sms_key = res.data.sms_key;
				//update userData and localstorage
				$scope.userData.sms_key = $scope.mymob.sms_key;
				$scope.userData.country_id = $scope.mymob.country_id;
				$scope.userData.mobile = $scope.mymob.mobile;
				$localstorage.setObject('userdata', $scope.userData);
				console.log($scope.userData);

				$scope.haveCode();
				$scope.tracker('Send mobile verification');
			}, function(err){
				$scope.resetLoading(err);
			});
		}
		console.log(mob);
	};


	// An elaborate, custom popup
	$scope.airBnb = function(){
		$scope.ablink = {};
		var myPopup = $ionicPopup.show({
			template: '<input type="text" ng-model="ablink.profile">',
			title: 'Enter AirBnb Profile Permalink',
			subTitle: 'You can also paste it here.',
			scope: $scope,
			buttons: [
			  { text: 'Cancel' },
			  {
				text: '<b>Submit</b>',
				type: 'button-positive',
				onTap: function(e) {
				  if (!$scope.ablink.profile) {
					//don't allow the user to close unless he enters wifi password
					e.preventDefault();
				  } else {
					verifyCode($scope.ablink.profile, 'airbnb');
					console.log($scope.ablink.profile);
				  }

				}
			  }
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});

	};

	// An elaborate, custom popup
	$scope.haveCode = function(){
		$scope.smsCode = {};
		var myPopup = $ionicPopup.show({
			template: '<input type="text" ng-model="smsCode.code">',
			title: 'Enter SMS Verification Code',
			//subTitle: 'The alphanumeric code we sent you.',
			scope: $scope,
			buttons: [
			  { text: 'Cancel' },
			  {
				text: '<b>Submit</b>',
				type: 'button-positive',
				onTap: function(e) {
				  if (!$scope.smsCode.code) {
					//don't allow the user to close unless he enters wifi password
					e.preventDefault();
				  } else {
					verifyCode($scope.smsCode.code, 'code');
					console.log($scope.smsCode.code);
				  }

				}
			  }
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});
	};

	var verifyCode = function(key, type){
		$scope.loadingShow();

		var the_code = data;
		the_code.code = key;
		the_code.airb_link = key;
		the_code.type = type;

		$dataFactory.postRequest(the_code, 'verifications').then(function(res){
			console.log(res.data);
			$scope.loadingHide();

			if(type == 'code'){
				if(res.data.result == 'success'){
					$scope.closeModalMob();
					theVerifications();
					$scope.tracker('Mobile verified');
					$scope.popUp('Success!', 'Mobile number confirmed!');
				}
				else{
					$scope.popUp('Opps!', 'SMS Key didn\'t match.');
				}
			}
			else{
				theVerifications();
				$scope.popUp('Success!', 'AirBnb successfully added!');
				$scope.tracker('AirBnb verified');
			}

		}, function(err){
			$scope.resetLoading(err);
		});


	};

}])

.controller('ReviewsCtrl', ['$scope', '$http', '$endPoint', '$localstorage', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$ionicActionSheet', function($scope, $http, $endPoint, $localstorage, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $ionicActionSheet) {

    $scope.$parent.showHeader();
    $scope.$parent.loadingShow();

	$scope.userData = $localstorage.getObject('userdata');
	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.reviews = {};

	var theReviews = function(){
		$dataFactory.postRequest(data, 'reviews').then(function(res){
			$scope.loadingHide();
			$scope.reviews = res.data;
			console.log($scope.reviews);

		}, function(err){
			$scope.resetLoading(err);
		});
	};
	theReviews();

	$scope.reviewDetails = function(details){
		$scope.tracker('View review details');
		var myPopup = $ionicPopup.show({
			template: details.star_details + '' + '<br><strong class="positive">Overall Rating: '+ details.average_star + '</strong>',
			title: 'Review Details',
			//subTitle: '' ,
			scope: $scope,
			buttons: [
			  { text: 'OK', type: 'button-positive' }
			]
		});
	};

}])

.controller('ReferencesCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$localstorage', function($scope, $state, $dataFactory, $ionicModal, $localstorage) {

    $scope.$parent.showHeader();

	$scope.userData = $localstorage.getObject('userdata');

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.ref = {};
	$scope.submitReference = function(ref){
		if(!ref.email){
			$scope.popUp('Opps!', 'Valid email is required.');
		}
		else{
			$scope.loadingShow();
			ref.seeker_id = $scope.userData.seeker_id;
			$dataFactory.postRequest(data, 'send_reference').then(function(res){
				$scope.loadingHide();
				$scope.popUp('Success!', 'Reference email is sent to '+ref.email+' successfully.');
				console.log(data);
				$scope.ref.email = '';
				$scope.tracker('Send reference email');

			}, function(err){
				$scope.resetLoading(err);
			});
		}
		console.log(ref);
	};


}])

.controller('ListingsCtrl', ['$scope', '$stateParams', '$dataFactory', '$ionicModal', '$ionicSlideBoxDelegate', '$localstorage', '$ionicActionSheet', '$timeout', '$cordovaDevice', '$cordovaImagePicker', '$cordovaCamera', 'Camera', 'ionicMaterialMotion', '$cordovaGeolocation', '$focus', '$location', function($scope, $stateParams, $dataFactory, $ionicModal, $ionicSlideBoxDelegate, $localstorage, $ionicActionSheet, $timeout, $cordovaDevice, $cordovaImagePicker, $cordovaCamera, Camera, ionicMaterialMotion, $cordovaGeolocation, $focus, $location) {

    $scope.$parent.showHeader();
	$scope.$parent.loadingShow();
	$scope.$parent.uripath = $location.path();


	$scope.listing = {};

	//upload/capture image
	var convertImgToBase64URL = function (type, url, callback, outputFormat){
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
			var canvas = document.createElement('CANVAS'),
			ctx = canvas.getContext('2d'), dataURL;
			canvas.height = 254; //this.height;
			canvas.width = 360; //this.width;
			if(this.width > this.height){
				canvas.height = this.height*0.7055555555555556;
				canvas.width = this.height;
			}
			else{
				if(type == 'camera'){
					canvas.height = this.width*0.7055555555555556;
					canvas.width = this.width;
				}
			}

			ctx.drawImage(this, 0, 0);
			dataURL = canvas.toDataURL(outputFormat);
			callback(dataURL);
			canvas = null;
		};
		img.src = url;
	};

	var uploadAvatar = function(base64Img){
		var count_img = ($scope.listing.images) ? $scope.listing.images.length : 0;
		//$scope.popUp('count_img!', count_img);

		if(count_img >= 3){
			$scope.popUp('Opps!', 'Max image upload exceeded.');
			$scope.loadingHide();
		}
		else{
			var imgData = {
				seeker_id: $scope.userData.seeker_id,
				image: base64Img,
				output_dir: 'uploads/space-uploads/'
			};
			//$scope.popUp('Image URI!', JSON.stringify(imgData));
			$dataFactory.postRequest(imgData, 'images').then(function(res){
				$scope.loadingHide();
				if(count_img > 0){
					$scope.listing.images.push(res.data.image);
				}
				else{
					$scope.listing.images = [res.data.image];
				}
				$scope.tracker('Upload space image');
				// updateCurActivity();
			}, function(err){
				$scope.resetLoading(err);
			});
		}
	};

	$scope.captureImage = function(){

		var options = {
		  targetWidth: 360,
		  targetHeight: 254,
		  //allowEdit: true,
		  correctOrientation:true
		};

		Camera.getPicture(options).then(function(imageURI) {
			console.log(imageURI);
			convertImgToBase64URL('camera', imageURI, function(base64Img){
				$scope.loadingShow();
				uploadAvatar(base64Img);
			});

		}, function(err) {
		  console.err(err);
		});

	};


	$scope.pickImage = function(){

		var options = {
			maximumImagesCount: 1,
			width: 360,
			height: 254,
			quality: 80
		};

		$cordovaImagePicker.getPictures(options)
		.then(function (results) {
			  for (var i = 0; i < results.length; i++) {
					$scope.loadingShow();
					convertImgToBase64URL('gallery', results[i], function(base64Img){
						uploadAvatar(base64Img);
					});
			  }
		}, function(err) {
			$scope.popUp('Opps!', err);
		  // error getting photos
		});
	};


	$scope.onLoadImgInput = function (e, reader, file, fileList, fileOjects, fileObj) {
		// console.log(fileObj.base64, fileObj);
		var gg = 'data:image/jpeg;base64,'+fileObj.base64;
		uploadAvatar(gg);
  };

	$scope.addMedia = function() {
		$timeout(function(){
			$('.img-upload-input').click();
		}, 0);


		// $scope.hideSheet = $ionicActionSheet.show({
		//   buttons: [
		// 	{ text: 'Take photo' },
		// 	{ text: 'Photo from library' }
		//   ],
		//   titleText: 'Add images',
		//   cancelText: 'Cancel',
		//   buttonClicked: function(index) {
		// 	  $scope.hideSheet();
		// 	  if(index == 0){
		// 	  	$scope.captureImage();
		// 	  }
		// 	  else{
		// 	  	$scope.pickImage();
		// 	  }
		// 	//$scope.addImage(index);
		//   }
		// });
		// return false;
	};


	$scope.imgAction = function(i, img) {
		$scope.hideImgSheet = $ionicActionSheet.show({
		  buttons: [
			{ text: 'Make featured image' }
		  ],
		  destructiveText: 'Delete',
		  titleText: 'Action',
		  cancelText: 'Cancel',
		  buttonClicked: function(index) {
			console.log(index, i);
			var newset = [];
			for(var imgcount = 0; imgcount < $scope.listing.images.length; imgcount++){
				var theimg = $scope.listing.images[imgcount];
				theimg.featured = 'N';
				if(i == imgcount){
					theimg.featured = 'Y';
				}
				newset.push(theimg);
			}

			$scope.listing.images = newset;

			$dataFactory.postRequest({file_upload_id: img.file_upload_id}, 'feature_img_name').then(function(res){
				console.log(res.data);
				//$scope.popUp('Wow!', JSON.stringify(res.data));
			}, function(err){
				$scope.resetLoading(err);
			});

			$scope.hideImgSheet();
		  },
		  destructiveButtonClicked: function() {
			console.log('DESTRUCT');
			$scope.listing.images.splice(i, 1);

			$dataFactory.postRequest({file_upload_id: img.file_upload_id}, 'delete_space_file').then(function(res){
				console.log(res.data);
				$scope.popUp('Wow!', JSON.stringify(res.data));
			}, function(err){
				$scope.resetLoading(err);
			});

			$scope.hideImgSheet();
		  }
		});
		return false;
	};

	var data = {seeker_id : $scope.userData.seeker_id};
	var spaces_data = data;
	spaces_data.space_type = 'mine';
	$scope.spaces = [];

	$scope.boxes = {};

	var getSpaces = function(){
		$dataFactory.postRequest(spaces_data, 'spaces').then(function(res){
			console.log(res.data);
			$scope.loadingHide();
			$scope.spaces = res.data;

			$scope.boxes = {
				smallbox: res.data.endpoint+'assets/user/img/box-small.png',
				bigbox: res.data.endpoint+'assets/user/img/box-medium.png',
				xxlbox: res.data.endpoint+'assets/user/img/box-wardrobe.png'
			};

		}, function(err){
			$scope.resetLoading(err);
		});
	};
	getSpaces();


	//modal field input
	$ionicModal.fromTemplateUrl('templates/inputfield.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalInput = modal;
	});

	$scope.openModalInput = function() {
		$scope.modalInput.show();
		return false;
	};
	$scope.closeModalInput = function() {
		$scope.modalInput.hide();
	};
	$scope.inputField = {};
	$scope.openField = function(type, name, title){
		console.log(type);
		$scope.inputField = {
			type: type,
			name: name,
			title: title
		};
		$scope.openModalInput();
		$timeout(function(){
			$focus('focusMe');
		}, 55);

		return false;
	};

	//modal add
	$ionicModal.fromTemplateUrl('templates/listingsadd.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalAdd = modal;
	});

	$scope.openModalAdd = function(listing) {
		$scope.tracker('Open listing form');
		$scope.listing = listing;
		console.log($scope.listing);
		$scope.modalAdd.show();
		return false;
	};
	$scope.closeModalAdd = function() {
		$scope.modalAdd.hide();
	};

	$scope.listingUnit = function(u){
		$scope.listing.unit = u;
		$('#'+u+'-btn').removeClass('button-outline').siblings().addClass('button-outline');
	};

	$scope.submitSpace = function(){
		console.log('Doing request', $scope.listing);

		var formData = {};
		if($scope.listing.title && $scope.listing.space_type && $scope.listing.access && $scope.listing.geolocation && $scope.listing.rental_fee_full){

			//check if access is valid
			var accss = $scope.listing.access; //);
			var valid_access = 0;
			for (var key in accss) {
			  if (accss.hasOwnProperty(key)) {
				if(accss[key] !== false){
					valid_access++;
				}
			  }
			}
			console.log(accss);
			console.log(valid_access);

			if(valid_access > 0){
				formData = {
					title: $scope.listing.title,
					space_id: ($scope.listing.id) ? $scope.listing.id : '',
					space_type: $scope.listing.space_type,
					access: $scope.listing.access,
					security: ($scope.listing.security) ? $scope.listing.security : [],
					exclusive_access: ($scope.listing.exclusive_access) ? $scope.listing.exclusive_access : 'Y',
					unit: ($scope.listing.unit) ? $scope.listing.unit : 'meter',
					length: ($scope.listing.length) ? $scope.listing.length : '',
					width: ($scope.listing.width) ? $scope.listing.width : '',
					height: ($scope.listing.height) ? $scope.listing.height : '',
					smallbox: ($scope.listing.smallbox) ? $scope.listing.smallbox : '',
					bigbox: ($scope.listing.bigbox) ? $scope.listing.bigbox : '',
					xxlbox: ($scope.listing.xxlbox) ? $scope.listing.xxlbox : '',
					city: $scope.listing.geolocation.formatted_address,
					lat: $scope.listing.geolocation.geometry.location.lat(),
					lang: $scope.listing.geolocation.geometry.location.lng(),
					available: 'Y',
					rental_fee_full: $scope.listing.rental_fee_full,
					seeker_id: $scope.userData.seeker_id
				};

				var reqData = data;
				reqData.space_info = formData;

				var newset = [];
				if($scope.listing.images){
					for(var imgcount = 0; imgcount < $scope.listing.images.length; imgcount++){
						var theimg = $scope.listing.images[imgcount];
						newset.push(theimg.file_upload_id);
					}

					reqData.images = newset;
				}
				console.log('Doing request', reqData);

				$scope.loadingShow();
				$dataFactory.postRequest(reqData, 'post_space').then(function(res){
					console.log(res.data);
					$scope.closeModalAdd();
					$scope.closeModal();
					$scope.tracker('Space listing submitted');
					$timeout(function() {
						getSpaces();
					}, 500);
				}, function(err){
					$scope.resetLoading(err);
				});


			}
			else{
				$scope.popUp('Opps!', 'Please supply all required fields.');
				//$scope.tracker('Space listing input invalid');
			}

		}
		else{
			$scope.popUp('Opps!', 'Please supply all required fields.');
		}

	};

	$scope.updateListing = function(a){
		a.security = a.security_arr;
		a.space_id = a.id;
		a.access = a.access_arr;
		a.unit = a.approx_size[3];
		a.length = parseInt(a.approx_size[0]);
		a.width = parseInt(a.approx_size[1]);
		a.height = parseInt(a.approx_size[2]);
		a.smallbox = parseInt(a.rental_fee_partial[0]);
		a.bigbox = parseInt(a.rental_fee_partial[1]);
		a.geolocation = {
			formatted_address: a.completegeo,
			geometry: {
				location: {
					lat: function(){
						return a.geo[0]
					},
					lng: function(){
						return a.geo[1]
					}
				}
			}

		};
		a.rental_fee_full = parseInt(a.fee_price);


		console.log(a);
		$scope.openModalAdd(a);
	};

	//modal details
	$ionicModal.fromTemplateUrl('templates/listingsdetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.activity = {};

	$scope.openModal = function(activity) {
		$scope.tracker('View listing details');
		$scope.activity = activity;
		console.log($scope.activity);
		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
		$ionicSlideBoxDelegate.update();
	};

}])

.controller('SearchCtrl', ['$scope', '$stateParams', '$dataFactory', '$ionicLoading', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicPopup', '$state', '$localstorage', '$window', '$timeout', '$ionicListDelegate', 'ionicMaterialMotion', 'ionicMaterialInk', '$cordovaGeolocation', '$compile', '$location', '$ionicActionSheet', '$cordovaDevice', '$cordovaImagePicker', '$cordovaCamera', 'Camera', '$ionicScrollDelegate', 'AuthService', function($scope, $stateParams, $dataFactory, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate, $ionicPopup, $state, $localstorage, $window, $timeout, $ionicListDelegate, ionicMaterialMotion, ionicMaterialInk, $cordovaGeolocation, $compile, $location, $ionicActionSheet, $cordovaDevice, $cordovaImagePicker, $cordovaCamera, Camera, $ionicScrollDelegate, AuthService) {

	$scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();


	//localstorage
	$scope.userData = $localstorage.getObject('userdata');

	var vmessages = $localstorage.getObject('messages');
	var data = {seeker_id : $scope.userData.seeker_id};
	var space_search = $localstorage.getObject('search_space');

//	$scope.backBtn = function(){
//		$window.history.back();
//		console.log('wer');
//	};


	$scope.search = {
		string: '', //(space_search.searchKey) ? space_search.searchKey : '',
		placeholder: 'nospace'
	};

	$scope.openModalMap = function(i){
		console.log(i);
		var s = $scope.spaces.spaces[i];
		$scope.openModal(s);
	};


	$scope.slide = function(to) {
		$scope.current = to;
		$ionicSlideBoxDelegate.slide(to);

		if(to == 1){
			$('.map-container').css({'height' : '100%', 'width' : '100%'});
			$('#map').css({'height' : '100%', 'width' : '100%'});
			$scope.getSpaces();
			$ionicScrollDelegate.scrollTop();
		}
	};

	$scope.slideHasChanged = function(i){
		console.log(i);
		$timeout(function(){
			$('.tabs-search').children(':eq('+i+')').addClass('active').siblings().removeClass('active');
		}, 100);

		if(i == 1){
			$('#map').css({'height' : '100%', 'width' : '100%'});
			$scope.getSpaces();
			$scope.tracker('View search map');
		}
		else{
			$scope.tracker('View search listing');
		}
	};
	$scope.disableSwipe = function() {
	   $ionicSlideBoxDelegate.enableSlide(false);
	};

	//show map
	$scope.showMap = function(lat, lng, spaces){
		var apiKey = false;
		var map = null;
		var mm = [];
		var markers = [];
		var iw = [];
		var oms = null;

		function initMap(){

//			var options = {timeout: 10000, enableHighAccuracy: true};
//
//			$cordovaGeolocation.getCurrentPosition(options).then(function(position){
//			}, function(error){
//			  console.log("Could not get location");
//
//				//Load the markers
//				loadMarkers();
//			});
			  var gm = google.maps;

			  var latLng = new gm.LatLng(lat, lng);

			  var mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: gm.MapTypeId.ROADMAP
			  };

			  map = new gm.Map(document.getElementById("map"), mapOptions);

				//spiderfy
			  iw = new gm.InfoWindow();

			  var omsOps = {markersWontMove: true, markersWontHide: true, keepSpiderfied: true};

			  oms = new OverlappingMarkerSpiderfier(map, omsOps);

				var shadow = new gm.MarkerImage(
					'http://staging.spacelli.com/assets/img/cash-icon.png', //https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
					new gm.Size(50, 50), //(37, 34),  // size   - for sprite clipping
					new gm.Point(0, 0),   // origin - ditto
					new gm.Point(50, 50) //(10, 34)  // anchor - where to meet map location
				);


				oms.addListener('click', function(marker, event) {
					iw.setContent(marker.desc);
					iw.open(map, marker);
					console.log(marker, 'click');
				});

				oms.addListener('spiderfy', function(markers) {
					for(var i = 0; i < markers.length; i ++) {
					  //markers[i].setIcon(iconWithColor(spiderfiedColor));
					  markers[i].setShadow(shadow);
					}
					console.log(markers, 'spiderfy');
					iw.close();
				});


				oms.addListener('unspiderfy', function(markers) {
					for(var i = 0; i < markers.length; i ++) {
					  //markers[i].setIcon(iconWithColor(usualColor));
					  markers[i].setShadow(shadow);
					}
					console.log(markers, 'unspiderfy');
					iw.close();
				});

			  //Wait until the map is loaded
			  google.maps.event.addListenerOnce(map, 'idle', function(){

				//Load the markers
				loadMarkers();

			  });



		}

		//map bound
		var setMapBound = function(){

			//get bounds of the locations
			window.mapData = mm;

			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < window.mapData.length; i ++) {

				var datum = window.mapData[i];
				var loc = new google.maps.LatLng(datum.lat, datum.lng);

				bounds.extend(loc);

				console.log(datum.lat, datum.lng);
			}

			//single marker only
			if(window.mapData.length == 1){
				var datum = window.mapData[0];
				var lat = datum.lat;
				var lng = datum.lng;

				var myLatLng=new google.maps.LatLng(lat, lng);
				var zoom = 15;
				map.setZoom(zoom);
				map.setCenter(myLatLng);
			}
			else{
				map.fitBounds(bounds);
			}

		};


		function loadMarkers(){

			console.log("Markers: ", spaces);

			var records = spaces;
//			var dupl = {geo: ["14.6342659", "121.03427250000004"]};
//			records.push(dupl);

			for (var i = 0; i < records.length; i++) {
			    var record = records[i];
				var tmpLatLng = new google.maps.LatLng( record.geo[0], record.geo[1]);
				//get bounds
				mm.push({
					lat: record.geo[0],
					lng: record.geo[1],
					map: map,
					position: tmpLatLng,
					title : record.name + " by " + record.seeker_name,
					icon: $dataFactory.baseUrl+'assets/img/google-maps-marker.png'
				});
				setMapBound();


			  var record = records[i];
			  var markerPos = new google.maps.LatLng(record.geo[0], record.geo[1]);
				console.log("Markers: ", record.geo[0], record.geo[1], $dataFactory.baseUrl+'assets/img/google-maps-marker.png');
			  // Add the markerto the map
			  var marker = new google.maps.Marker({
				//map: map,
				animation: google.maps.Animation.DROP,
				position: markerPos,
				title : record.name + " by " + record.seeker_name,
				icon: $dataFactory.baseUrl+'assets/img/google-maps-marker.png'
			  });

			  markers.push(marker);


			  var infoWindowContent = "<h4>" + record.name + "</h4>";

				var title_sub = (record.title) ? record.title : 'Hey test';
				var title_sub = (title_sub.length > 0) ? title_sub : 'No Title Added';
				var title_sub = (title_sub.length > 36) ? title_sub.substr(0,33)+'...' : title_sub;

				record.security_icons = '';

				var contentString = '<div id="content">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<div id="bodyContent">'+
					'<div id="content"><div class="row" ng-click="openModalMap('+i+')">'+
						'<div class="col"><p class="text-left" style="margin-bottom: 0px; line-height: 18px"><strong>'+title_sub+'</strong><br><span class="">'+record.name + ' by ' + record.seeker_name+'</span><br>$' + record.price +'/month'+
						'</div>'+
					'</div>'+
				'</div>';

				var compiled = $compile(contentString)($scope);
	 			console.log(compiled);

				marker.desc = compiled[0];
			    oms.addMarker(marker);  // <-- here

			   // addInfoWindow(marker, compiled[0], record);

			}

			if(mm.length > 0){

				//marker settings
				var styles = [[{
					url: 'img/clustermarker/people35.png',
					width: 35,
					height: 35,
					textColor: '#fff',
					textSize: 12
				  }, {
					url: 'img/clustermarker/people45.png',
					width: 45,
					height: 45,
					textColor: '#fff',
					textSize: 12
				  }, {
					url: 'img/clustermarker/people55.png',
					width: 55,
					height: 55,
					textColor: '#fff',
					textSize: 12
				}]];

				var markerCluster = new MarkerClusterer(map, markers, {
				  styles: styles[0]
				});
				markerCluster.setMaxZoom(16);


			}


		}

		function addInfoWindow(marker, message, record) {

		  var infoWindow = new google.maps.InfoWindow({
			  content: message
		  });


		  google.maps.event.addListener(marker, 'click', function () {
			  infoWindow.open(map, marker);
		  });

		}
		initMap();
	};


	// $scope.modalWhere = null;
	//modal details
	$ionicModal.fromTemplateUrl('templates/search-where.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalWhere = modal;
	});
	$scope.openModalWhere = function() {
		console.log($scope.modalWhere);
		$timeout(function(){
			var refreshIntervalId = setInterval(function() {
				if($scope.modalWhere){
					$scope.modalWhere.show();
					$('.search-input-modal').click().focus();
					clearInterval(refreshIntervalId);
				}
			}, 50);
		}, 0);
  };
	$scope.closeModalWhere = function() {
    $scope.modalWhere.hide();
  };

	// $timeout(function () {
	// 	if($scope.spaces){
	// 		$scope.openModalWhere();
	// 		// $('.search-input-main').focus();
	// 	}
	// }, 500);


	// $scope.$on('loggedIn', function(event,message) {
	//
  //   if(message.loggedIn === true) {
  //     console.log('LOGGED IN!');
  //     $scope.closeModalWhere();
  //   } else{
  //     console.log('NOT LOGGED IN!');
  //     $scope.openModalWhere();
	//
  //   }
  // });
	//
  // $scope.fakeLogin = function(){
  //   AuthService.login();
  // }
	//
  // $timeout( function() {
  //   AuthService.checkLogin();
  // });


	// $('.search-input-main').on('focus', function(){
	// 	$scope.openModalWhere();
	// });


	$scope.spaces = {};

	$scope.getSpaces = function(space_name, lat, lng){
		$scope.closeModalWhere();

		$scope.spaces = {};

		//geocomplete is set
		//if($scope.search.string.formatted_address){
			var space_name = (space_name) ? space_name : $scope.search.string.formatted_address;
			var lat = (lat) ? lat : $scope.search.string.geometry.location.lat();
			var lng = (lng) ? lng : $scope.search.string.geometry.location.lng();

			$scope.search.placeholder = 'spinner';
			console.log($scope.search.string);
			var spaces_data = data;
			spaces_data.space_type = 'search';
			spaces_data.searchKey = space_name;
			spaces_data.lat = lat;
			spaces_data.lng = lng ;

			$dataFactory.postRequest(spaces_data, 'spaces').then(function(res){
				console.log(res.data);
				$scope.showMap(lat, lng, res.data.spaces);
				$scope.search.placeholder = 'nospace';
				$scope.spaces = res.data;
				console.log($scope.spaces);
				$ionicScrollDelegate.scrollTop();

			}, function(err){
				$scope.resetLoading(err);
			});
		//}

	};

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		//you also get the actual event object
		//do stuff, execute functions -- whatever...
		ionicMaterialMotion.fadeSlideIn();
	});

	// if($scope.search.string){
	// 	var space_name = space_search.searchKey;
	// 	var lat = space_search.lat;
	// 	var lng = space_search.lng;
	// 	$scope.getSpaces(space_name, lat, lng);
	// }


	$scope.clearSearch = function(){
		$scope.search.string = '';
		$scope.spaces = {};
		console.log($scope.spaces);
		$('input[type="search"]').focus();
	};

	//modal details
	$ionicModal.fromTemplateUrl('templates/listingsdetails-search.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	});

	//modal details
	$ionicModal.fromTemplateUrl('templates/search-filters.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalFilter = modal;
	});
	$scope.openModalFilter = function() {
    $scope.modalFilter.show();
  };
	$scope.closeModalFilter = function() {
    $scope.modalFilter.hide();
		$scope.getSpaces();
  };
	// Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
    console.log($scope.listing);

		if($scope.listing.access){
			// if($scope.search.string){
			// 	var space_name = space_search.searchKey;
			// 	var lat = space_search.lat;
			// 	var lng = space_search.lng;
			// 	$scope.getSpaces(space_name, lat, lng);
			// }
			// $scope.getSpaces();
		}
  });




	$scope.addFav = function(activity, i) {
		console.log(i);
	   var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (activity.myfav == 'active') ? 'Remove from favorites?' : 'Add to favorites?'
	   });
	   confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');
			var formData = {
				space_id: activity.id,
				fav_stat: activity.myfav,
				user_id: $scope.userData.seeker_id
			};
			console.log(formData);
			//return false;
			$dataFactory.baseRequest(formData, 'login/myfav').then(function(res){
				console.log(res.data);

				activity.myfav = (activity.myfav == 'active') ? 'inactive' : 'active'
				$scope.spaces[i] = activity;
				var tracker_mess = (activity.myfav == 'active') ? 'Add favorite' : 'Remove favorite';

				$scope.tracker(tracker_mess, formData);
				$scope.popUp('Success!', 'Favorites successfully updated.');
				$ionicListDelegate.closeOptionButtons();


			}, function(err){
				$scope.resetLoading(err);
				$ionicListDelegate.closeOptionButtons();
			});

		 } else {
		   console.log('You are not sure');
		 }
	   });

	};

	$scope.activity = {};

	$scope.openModal = function(activity) {
		$scope.activity = activity;
		$scope.tracker('View listing details', {space_id: $scope.activity.id});
		console.log($scope.activity);
		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
		$ionicSlideBoxDelegate.update();
	};

	$scope.promofield = true;
	$scope.validpromo = {};

	$scope.togglePromo = function(e){
		if(e){
			$scope.promofield = false;
		}
		else{
			$scope.promofield = true;
		}

	};

	$scope.validatePromo = function(i){
		console.log(i);

		var formData = {
			code: i.promo
		};

		$dataFactory.postRequest(formData, 'validatepromo').then(function(res){
			console.log(res.data);
			$scope.validpromo = res.data;
		}, function(err){
			$scope.resetLoading(err);
		});

	};

	//modal booking request
	$ionicModal.fromTemplateUrl('templates/listingsbooking.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalBook = modal;
	});

	$scope.openModalBook = function() {
	    $scope.tracker('Open '+$scope.reqMessTitle+' form', {activity_id: $scope.activity.id});
		$scope.modalBook.show();
		return false;
	};
	$scope.closeModalBook = function() {
		$scope.modalBook.hide();
	};


	$scope.submitBooking = function(){
		console.log($scope.activity, 'scope.activity2 22 ');
		if(!$scope.userData.seeker_id){
			$scope.closeModalBook();
			$scope.closeModal();

			$scope.popUp('Opps!', 'Please login/signup to continue.', 'app.landingsignup');
		}
		else if($scope.userData.profile_status != 'ok'){
			//$scope.popUp('Info!', vmessages.error.request_post_validate);
			$scope.closeModalBook();
			$scope.closeModal();
			$scope.popUp('Info!', vmessages.error.request_post_validate, 'app.setup');
		}
		else if($scope.activity.message && $scope.activity.description){ //$scope.activity.months &&
			var m = ($scope.activity.months > 1) ? 'months' : 'month';
			var total = $scope.activity.months * $scope.activity.price;
			var text = 'You are booking space at $'+$scope.activity.price+'/month.'; //for '+ $scope.activity.months + ' '+m+'  Total of $'+total+'.';
			$scope.showConfirm(text);
		}
		else{
			$scope.popUp('Opps!', 'Please fill all required fields.');
		}

	};

	// A confirm dialog
	$scope.showConfirm = function(text) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (text) ? text : 'Confirm action.'
		});
		confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');


			console.log($scope.activity);
			var formData = {
				storage_days: '1', //$scope.activity.months,
				seeker_id: $scope.userData.seeker_id,
				space_id: $scope.activity.id,
				mess_trader_id: $scope.activity.seeker_id,
				message: $scope.activity.message,
				description: $scope.activity.description
			};

			if($scope.validpromo.count){
				formData.discount = $scope.validpromo.promo.percentage_off;
				formData.discount_months = $scope.validpromo.promo.months;
			}

			$scope.loadingShow();

			$dataFactory.postRequest(formData, 'book_request').then(function(res){
				console.log(res.data);
				$scope.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.tracker('Booking request submitted', {space_id: $scope.activity.id});
				//$state.go("app.activity");
				$scope.popUp('Success!', 'Booking request successfully submitted.', 'app.activity');

			}, function(err){
				$scope.resetLoading(err);
			});


		 } else {
		   console.log('You are not sure');
		 }
		});
	};

	//upload/capture image
	var convertImgToBase64URL = function (type, url, callback, outputFormat){
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
			var canvas = document.createElement('CANVAS'),
			ctx = canvas.getContext('2d'), dataURL;
			canvas.height = 170; //this.height;
			canvas.width = 170; //this.width;
			if(this.width > this.height){
				canvas.height = this.height;
				canvas.width = this.height;
			}
			else{
				if(type == 'camera'){
					canvas.height = this.width;
					canvas.width = this.width;
				}
			}

			ctx.drawImage(this, 0, 0);
			dataURL = canvas.toDataURL(outputFormat);
			callback(dataURL);
			canvas = null;
		};
		img.src = url;
	};

	$scope.listing = {
		images: []
	};

	var uploadAvatar = function(base64Img){
		var count_img = $scope.listing.images.length;
		if(count_img >= 3){
			$scope.popUp('Opps!', 'Max image upload exceeded.');
			$scope.loadingHide();
		}
		else{
			var imgData = {
				seeker_id: $scope.userData.seeker_id,
				image: base64Img,
				output_dir: 'uploads/request-uploads/'
			};
			//$scope.popUp('Image URI!', JSON.stringify(imgData));
			$dataFactory.postRequest(imgData, 'images').then(function(res){
				$scope.loadingHide();
				if(count_img > 0){
					$scope.listing.images.push(res.data.image);
				}
				else{
					$scope.listing.images = [res.data.image];
				}

				//alert(res.data.image);
				$scope.tracker('Upload booking goods image');
			}, function(err){
				$scope.resetLoading(err);
			});
		}

	};

	$scope.captureImage = function(){

		var options = {
		  targetWidth: 226,
		  targetHeight: 226,
//		  allowEdit: true,
		  correctOrientation:true
		};

		Camera.getPicture(options).then(function(imageURI) {
			console.log(imageURI);
			convertImgToBase64URL('camera', imageURI, function(base64Img){
				$scope.loadingShow();
				uploadAvatar(base64Img);
			});

		}, function(err) {
		  console.err(err);
		});

	};


	$scope.pickImage = function(){

		var options = {
			maximumImagesCount: 1,
			width: 170,
			height: 170,
			quality: 80
		};

		$cordovaImagePicker.getPictures(options)
		.then(function (results) {
			  for (var i = 0; i < results.length; i++) {
					$scope.loadingShow();
					convertImgToBase64URL('gallery', results[i], function(base64Img){
						uploadAvatar(base64Img);
					});
			  }
		}, function(err) {
			$scope.popUp('Opps!', err);
		  // error getting photos
		});
	};


	$scope.onLoadImgInput = function (e, reader, file, fileList, fileOjects, fileObj) {

		// console.log(fileObj.base64, fileObj);
		var gg = 'data:image/jpeg;base64,'+fileObj.base64;
		uploadAvatar(gg);

  };


	$scope.addMedia = function() {
		$timeout(function(){
			$('.img-upload-input').click();
		}, 0);

		// $scope.hideSheet = $ionicActionSheet.show({
		//   buttons: [
		// 	{ text: 'Take photo' },
		// 	{ text: 'Photo from library' }
		//   ],
		//   titleText: 'Add images',
		//   cancelText: 'Cancel',
		//   buttonClicked: function(index) {
		// 	  $scope.hideSheet();
		// 	  if(index == 0){
		// 	  	$scope.captureImage();
		// 	  }
		// 	  else{
		// 	  	$scope.pickImage();
		// 	  }
		//   }
		// });
	};



}])

.controller('SearchConsultantCtrl', ['$scope', '$stateParams', '$dataFactory', '$ionicLoading', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicPopup', '$state', '$localstorage', '$window', '$timeout', '$ionicListDelegate', 'ionicMaterialMotion', 'ionicMaterialInk', '$cordovaGeolocation', '$compile', '$location', '$ionicActionSheet', '$cordovaDevice', '$cordovaImagePicker', '$cordovaCamera', 'Camera', function($scope, $stateParams, $dataFactory, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate, $ionicPopup, $state, $localstorage, $window, $timeout, $ionicListDelegate, ionicMaterialMotion, ionicMaterialInk, $cordovaGeolocation, $compile, $location, $ionicActionSheet, $cordovaDevice, $cordovaImagePicker, $cordovaCamera, Camera) {

    $scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();


	//localstorage
	$scope.userData = $localstorage.getObject('userdata');

	var vmessages = $localstorage.getObject('messages');
	var data = {seeker_id : $scope.userData.seeker_id};
	var space_search = $localstorage.getObject('search_space');

//	$scope.backBtn = function(){
//		$window.history.back();
//		console.log('wer');
//	};


	$scope.search = {
		string: (space_search.searchKey) ? space_search.searchKey : '',
		placeholder: 'nospace'
	};


	$scope.openModalMap = function(i){
		console.log(i);
		var s = $scope.spaces.spaces[i];
		$scope.openModal(s);
	};


	$scope.slide = function(to) {
		$scope.current = to;
		$ionicSlideBoxDelegate.slide(to);
	};

	$scope.slideHasChanged = function(i){
		console.log(i);
		$timeout(function(){
			$('.tabs-search').children(':eq('+i+')').addClass('active').siblings().removeClass('active');
		}, 100);

		if(i == 1){
			$scope.tracker('View search map');
		}
		else{
			$scope.tracker('View search listing');
		}
	};
	$scope.disableSwipe = function() {
	   $ionicSlideBoxDelegate.enableSlide(false);
	};

	//show map
	$scope.showMap = function(lat, lng, spaces){
		var apiKey = false;
		var map = null;
		var mm = [];
		var markers = [];
		var iw = [];
		var oms = null;

		function initMap(){

//			var options = {timeout: 10000, enableHighAccuracy: true};
//
//			$cordovaGeolocation.getCurrentPosition(options).then(function(position){
//			}, function(error){
//			  console.log("Could not get location");
//
//				//Load the markers
//				loadMarkers();
//			});
			  var gm = google.maps;

			  var latLng = new gm.LatLng(lat, lng);

			  var mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: gm.MapTypeId.ROADMAP
			  };

			  map = new gm.Map(document.getElementById("map"), mapOptions);

				//spiderfy
			  iw = new gm.InfoWindow();

			  var omsOps = {markersWontMove: true, markersWontHide: true, keepSpiderfied: true};

			  oms = new OverlappingMarkerSpiderfier(map, omsOps);

				var shadow = new gm.MarkerImage(
					'http://staging.spacelli.com/assets/img/cash-icon.png', //https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
					new gm.Size(50, 50), //(37, 34),  // size   - for sprite clipping
					new gm.Point(0, 0),   // origin - ditto
					new gm.Point(50, 50) //(10, 34)  // anchor - where to meet map location
				);


				oms.addListener('click', function(marker, event) {
					iw.setContent(marker.desc);
					iw.open(map, marker);
					console.log(marker, 'click');
				});

				oms.addListener('spiderfy', function(markers) {
					for(var i = 0; i < markers.length; i ++) {
					  //markers[i].setIcon(iconWithColor(spiderfiedColor));
					  markers[i].setShadow(shadow);
					}
					console.log(markers, 'spiderfy');
					iw.close();
				});


				oms.addListener('unspiderfy', function(markers) {
					for(var i = 0; i < markers.length; i ++) {
					  //markers[i].setIcon(iconWithColor(usualColor));
					  markers[i].setShadow(shadow);
					}
					console.log(markers, 'unspiderfy');
					iw.close();
				});

			  //Wait until the map is loaded
			  google.maps.event.addListenerOnce(map, 'idle', function(){

				//Load the markers
				loadMarkers();

			  });



		}

		//map bound
		var setMapBound = function(){

			//get bounds of the locations
			window.mapData = mm;

			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < window.mapData.length; i ++) {

				var datum = window.mapData[i];
				var loc = new google.maps.LatLng(datum.lat, datum.lng);

				bounds.extend(loc);

				console.log(datum.lat, datum.lng);
			}

			//single marker only
			if(window.mapData.length == 1){
				var datum = window.mapData[0];
				var lat = datum.lat;
				var lng = datum.lng;

				var myLatLng=new google.maps.LatLng(lat, lng);
				var zoom = 15;
				map.setZoom(zoom);
				map.setCenter(myLatLng);
			}
			else{
				map.fitBounds(bounds);
			}

		};


		function loadMarkers(){

			console.log("Markers: ", spaces);

			var records = spaces;
//			var dupl = {geo: ["14.6342659", "121.03427250000004"]};
//			records.push(dupl);

			for (var i = 0; i < records.length; i++) {
			    var record = records[i];
				var tmpLatLng = new google.maps.LatLng( record.geo[0], record.geo[1]);
				//get bounds
				mm.push({
					lat: record.geo[0],
					lng: record.geo[1],
					map: map,
					position: tmpLatLng,
					title : record.name + " by " + record.seeker_name,
					icon: $dataFactory.baseUrl+'assets/img/google-maps-marker.png'
				});
				setMapBound();


			  var record = records[i];
			  var markerPos = new google.maps.LatLng(record.geo[0], record.geo[1]);
				console.log("Markers: ", record.geo[0], record.geo[1], $dataFactory.baseUrl+'assets/img/google-maps-marker.png');
			  // Add the markerto the map
			  var marker = new google.maps.Marker({
				//map: map,
				animation: google.maps.Animation.DROP,
				position: markerPos,
				title : record.name + " by " + record.seeker_name,
				icon: $dataFactory.baseUrl+'assets/img/google-maps-marker.png'
			  });

			  markers.push(marker);


			  var infoWindowContent = "<h4>" + record.name + "</h4>";

				var title_sub = (record.title) ? record.title : 'Hey test';
				var title_sub = (title_sub.length > 0) ? title_sub : 'No Title Added';
				var title_sub = (title_sub.length > 36) ? title_sub.substr(0,33)+'...' : title_sub;

				record.security_icons = '';

				var contentString = '<div id="content">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<div id="bodyContent">'+
					'<div id="content"><div class="row" ng-click="openModalMap('+i+')">'+
						'<div class="col"><p class="text-left" style="margin-bottom: 0px; line-height: 18px"><strong>'+title_sub+'</strong><br><span class="">'+record.name + ' by ' + record.seeker_name+'</span><br>$' + record.price +'/month'+
						'</div>'+
					'</div>'+
				'</div>';

				var compiled = $compile(contentString)($scope);
	 			console.log(compiled);

				marker.desc = compiled[0];
			    oms.addMarker(marker);  // <-- here

			   // addInfoWindow(marker, compiled[0], record);

			}

			if(mm.length > 0){

				//marker settings
				var styles = [[{
					url: 'img/clustermarker/people35.png',
					width: 35,
					height: 35,
					textColor: '#fff',
					textSize: 12
				  }, {
					url: 'img/clustermarker/people45.png',
					width: 45,
					height: 45,
					textColor: '#fff',
					textSize: 12
				  }, {
					url: 'img/clustermarker/people55.png',
					width: 55,
					height: 55,
					textColor: '#fff',
					textSize: 12
				}]];

				var markerCluster = new MarkerClusterer(map, markers, {
				  styles: styles[0]
				});
				markerCluster.setMaxZoom(16);


			}


		}

		function addInfoWindow(marker, message, record) {

		  var infoWindow = new google.maps.InfoWindow({
			  content: message
		  });


		  google.maps.event.addListener(marker, 'click', function () {
			  infoWindow.open(map, marker);
		  });

		}
		initMap();
	};


	$scope.spaces = {};

	$scope.getSpaces = function(space_name, lat, lng){
		$scope.spaces = {};

		//geocomplete is set
		//if($scope.search.string.formatted_address){
			var space_name = (space_name) ? space_name : $scope.search.string.formatted_address;
			var lat = (lat) ? lat : $scope.search.string.geometry.location.lat();
			var lng = (lng) ? lng : $scope.search.string.geometry.location.lng();

			$scope.search.placeholder = 'spinner';
			console.log($scope.search.string);
			var spaces_data = data;
			spaces_data.space_type = 'search';
			spaces_data.searchKey = space_name;
			spaces_data.lat = lat;
			spaces_data.lng = lng ;

			$dataFactory.postRequest(spaces_data, 'search_consultant').then(function(res){
				console.log(res.data);
				//$scope.showMap(lat, lng, res.data.spaces);
				$scope.search.placeholder = 'nospace';
				$scope.spaces = res.data;
				console.log($scope.spaces);

			}, function(err){
				$scope.resetLoading(err);
			});
		//}

	};

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		//you also get the actual event object
		//do stuff, execute functions -- whatever...
		ionicMaterialMotion.fadeSlideIn();
	});

	if($scope.search.string){
		var space_name = space_search.searchKey;
		var lat = space_search.lat;
		var lng = space_search.lng;
//		console.log($scope.search.string, space_search);
//		return false;
		$scope.getSpaces(space_name, lat, lng);
	}


	$scope.clearSearch = function(){
		$scope.search.string = '';
		$scope.spaces = {};
		console.log($scope.spaces);
		$('input[type="search"]').focus();
	};

	//modal details
	$ionicModal.fromTemplateUrl('templates/listingsdetails-search.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.addFav = function(activity, i) {
		console.log(i);
	   var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (activity.myfav == 'active') ? 'Remove from favorites?' : 'Add to favorites?'
	   });
	   confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');
			var formData = {
				space_id: activity.id,
				fav_stat: activity.myfav,
				user_id: $scope.userData.seeker_id
			};
			console.log(formData);
			//return false;
			$dataFactory.baseRequest(formData, 'login/myfav').then(function(res){
				console.log(res.data);

				activity.myfav = (activity.myfav == 'active') ? 'inactive' : 'active'
				$scope.spaces[i] = activity;
				var tracker_mess = (activity.myfav == 'active') ? 'Add favorite' : 'Remove favorite';

				$scope.tracker(tracker_mess, formData);
				$scope.popUp('Success!', 'Favorites successfully updated.');
				$ionicListDelegate.closeOptionButtons();


			}, function(err){
				$scope.resetLoading(err);
				$ionicListDelegate.closeOptionButtons();
			});

		 } else {
		   console.log('You are not sure');
		 }
	   });

	};

	$scope.activity = {};



	$ionicModal.fromTemplateUrl('templates/logindeclutter.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalDeclutter = modal;
	});

	$scope.openModal = function(activity) {
		$scope.activity = activity;
//		$scope.tracker('View listing details', {space_id: $scope.activity.id});
		console.log($scope.activity);
//		$scope.modal.show();

		$scope.modalDeclutter.show();

		return false;
	};



	$scope.closeDeclutter = function() {
		$scope.modalDeclutter.hide();
	//	$scope.modal.hide();
		$ionicSlideBoxDelegate.update();
	};

	$scope.promofield = true;
	$scope.validpromo = {};

	$scope.togglePromo = function(e){
		if(e){
			$scope.promofield = false;
		}
		else{
			$scope.promofield = true;
		}

	};

	$scope.validatePromo = function(i){
		console.log(i);

		var formData = {
			code: i.promo
		};

		$dataFactory.postRequest(formData, 'validatepromo').then(function(res){
			console.log(res.data);
			$scope.validpromo = res.data;
		}, function(err){
			$scope.resetLoading(err);
		});

	};

	//modal booking request
	$ionicModal.fromTemplateUrl('templates/listingsbooking.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalBook = modal;
	});

	$scope.openModalBook = function() {
	    $scope.tracker('Open '+$scope.reqMessTitle+' form', {activity_id: $scope.activity.id});
		$scope.modalBook.show();
		return false;
	};
	$scope.closeModalBook = function() {
		$scope.modalBook.hide();
	};


	$scope.submitBooking = function(){
		$scope.activity.months = 1;
		console.log($scope.activity, 'scope.activity');
		if(!$scope.userData.seeker_id){
			$scope.popUp('Opps!', 'Please login to continue.');
		}
		else if($scope.userData.profile_status != 'ok'){
			//$scope.popUp('Info!', vmessages.error.request_post_validate);
			$scope.closeModalBook();
			$scope.closeModal();
			$scope.popUp('Info!', vmessages.error.request_post_validate, 'app.setup');
		}
		else if($scope.activity.message && $scope.activity.description){ //$scope.activity.months &&
			var m = ($scope.activity.months > 1) ? 'months' : 'month';
			var total = $scope.activity.months * $scope.activity.price;
			var text = 'You are booking space at $'+$scope.activity.price+'/month'; //for '+ $scope.activity.months + ' '+m+'. Total of $'+total+'.';
			$scope.showConfirm(text);
		}
		else{
			$scope.popUp('Opps!', 'Please fill all required fields.');
		}

	};

	// A confirm dialog
	$scope.showConfirm = function(text) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (text) ? text : 'Confirm action.'
		});
		confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');


			console.log($scope.activity);
			var formData = {
				storage_days: '1', //$scope.activity.months,
				seeker_id: $scope.userData.seeker_id,
				space_id: $scope.activity.id,
				mess_trader_id: $scope.activity.seeker_id,
				message: $scope.activity.message,
				description: $scope.activity.description
			};

			if($scope.validpromo.count){
				formData.discount = $scope.validpromo.promo.percentage_off;
				formData.discount_months = $scope.validpromo.promo.months;
			}

			$scope.loadingShow();

			$dataFactory.postRequest(formData, 'book_request').then(function(res){
				console.log(res.data);
				$scope.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.tracker('Booking request submitted', {space_id: $scope.activity.id});
				//$state.go("app.activity");
				$scope.popUp('Success!', 'Booking request successfully submitted.', 'app.activity');

			}, function(err){
				$scope.resetLoading(err);
			});


		 } else {
		   console.log('You are not sure');
		 }
		});
	};

	//upload/capture image
	var convertImgToBase64URL = function (type, url, callback, outputFormat){
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function(){
			var canvas = document.createElement('CANVAS'),
			ctx = canvas.getContext('2d'), dataURL;
			canvas.height = 170; //this.height;
			canvas.width = 170; //this.width;
			if(this.width > this.height){
				canvas.height = this.height;
				canvas.width = this.height;
			}
			else{
				if(type == 'camera'){
					canvas.height = this.width;
					canvas.width = this.width;
				}
			}

			ctx.drawImage(this, 0, 0);
			dataURL = canvas.toDataURL(outputFormat);
			callback(dataURL);
			canvas = null;
		};
		img.src = url;
	};

	$scope.listing = {
		images: []
	};

	var uploadAvatar = function(base64Img){
		var count_img = $scope.listing.images.length;
		if(count_img >= 3){
			$scope.popUp('Opps!', 'Max image upload exceeded.');
			$scope.loadingHide();
		}
		else{
			var imgData = {
				seeker_id: $scope.userData.seeker_id,
				image: base64Img,
				output_dir: 'uploads/request-uploads/'
			};
			//$scope.popUp('Image URI!', JSON.stringify(imgData));
			$dataFactory.postRequest(imgData, 'images').then(function(res){
				$scope.loadingHide();
				if(count_img > 0){
					$scope.listing.images.push(res.data.image);
				}
				else{
					$scope.listing.images = [res.data.image];
				}

				//alert(res.data.image);
				$scope.tracker('Upload booking goods image');
			}, function(err){
				$scope.resetLoading(err);
			});
		}

	};

	$scope.captureImage = function(){

		var options = {
		  targetWidth: 226,
		  targetHeight: 226,
//		  allowEdit: true,
		  correctOrientation:true
		};

		Camera.getPicture(options).then(function(imageURI) {
			console.log(imageURI);
			convertImgToBase64URL('camera', imageURI, function(base64Img){
				$scope.loadingShow();
				uploadAvatar(base64Img);
			});

		}, function(err) {
		  console.err(err);
		});

	};


	$scope.pickImage = function(){

		var options = {
			maximumImagesCount: 1,
			width: 170,
			height: 170,
			quality: 80
		};

		$cordovaImagePicker.getPictures(options)
		.then(function (results) {
			  for (var i = 0; i < results.length; i++) {
					$scope.loadingShow();
					convertImgToBase64URL('gallery', results[i], function(base64Img){
						uploadAvatar(base64Img);
					});
			  }
		}, function(err) {
			$scope.popUp('Opps!', err);
		  // error getting photos
		});
	};


	$scope.addMedia = function() {
		$scope.hideSheet = $ionicActionSheet.show({
		  buttons: [
			{ text: 'Take photo' },
			{ text: 'Photo from library' }
		  ],
		  titleText: 'Add images',
		  cancelText: 'Cancel',
		  buttonClicked: function(index) {
			  $scope.hideSheet();
			  if(index == 0){
			  	$scope.captureImage();
			  }
			  else{
			  	$scope.pickImage();
			  }
			//$scope.addImage(index);
		  }
		});
	};



}])

.controller('BrowseCtrl', ['$scope', '$stateParams', '$dataFactory', '$ionicLoading', '$ionicModal', '$ionicSlideBoxDelegate', '$ionicPopup', '$state', '$ionicActionSheet', '$localstorage', 'ionicMaterialMotion', '$location', function($scope, $stateParams, $dataFactory, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate, $ionicPopup, $state, $ionicActionSheet, $localstorage, ionicMaterialMotion, $location) {

    $scope.$parent.showHeader();
	$scope.$parent.uripath = $location.path();

	//localstorage
	$scope.userData = $localstorage.getObject('userdata');

	var data = {seeker_id : $scope.userData.seeker_id};

	var space_search = $localstorage.getObject('search_space');


	$scope.search = {
		string: (space_search.searchKey) ? space_search.searchKey : '',
		placeholder: 'nospace'
	};

	$scope.spaces = {};

	$scope.getSpaces = function(space_name, lat, lng){
		$scope.spaces = {};

		//geocomplete is set
		//if($scope.search.string.formatted_address){

			$scope.search.placeholder = 'spinner';
			console.log($scope.search.string);
			var spaces_data = data;
			spaces_data.searchKey = (space_name) ? space_name : $scope.search.string.formatted_address;
			spaces_data.lat = (lat) ? lat : $scope.search.string.geometry.location.lat();
			spaces_data.lng = (lng) ? lng : $scope.search.string.geometry.location.lng();


//			spaces_data.searchKey = $scope.search.string.formatted_address;
//			spaces_data.lat = $scope.search.string.geometry.location.lat();
//			spaces_data.lng = $scope.search.string.geometry.location.lng();
			console.log(spaces_data, 'spaces_data');

			$dataFactory.postRequest(spaces_data, 'requests').then(function(res){
				console.log(res.data);
				$scope.search.placeholder = 'nospace';
				$scope.spaces = res.data;
				console.log($scope.spaces);
			}, function(err){
				$scope.resetLoading(err);
			});
		//}

	};

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		//you also get the actual event object
		//do stuff, execute functions -- whatever...
		ionicMaterialMotion.blinds();
	});

	if($scope.search.string){
		var space_name = space_search.searchKey;
		var lat = space_search.lat;
		var lng = space_search.lng;
		$scope.getSpaces(space_name, lat, lng);
	}


	$scope.clearSearch = function(){
		$scope.search.string = '';
		$scope.spaces = {};
		console.log($scope.spaces);
		$('input[type="search"]').focus();
	};

	//modal details
	$ionicModal.fromTemplateUrl('templates/requestdetails.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.activity = {};

	$scope.openModal = function(activity) {
		$scope.activity = activity;
		$scope.tracker('View request details', {activity_id: $scope.activity.id});
		$scope.activity.status_text = 'Pending';
		//parse offer
		if($scope.activity.my_offer.length){
			$scope.activity.my_offer[0].offer = parseInt($scope.activity.my_offer[0].offer);
		}


		console.log($scope.activity);
		$scope.modal.show();
		return false;
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
		$ionicSlideBoxDelegate.update();
	};

	//modal offer/comments
	$scope.reqMess = [];
	$scope.reqMessTitle = '';
	$scope.reqMessFormTitle = '';
	$ionicModal.fromTemplateUrl('templates/requestoffers.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalOffers = modal;
	});

	$scope.openModalOffers = function(type) {
		$scope.reqMess = (type == 'offers') ? $scope.activity.offers : $scope.activity.comments;
		$scope.reqMessTitle = (type == 'offers') ? 'Offers' : 'Comments';
	    $scope.tracker('View '+type, {activity_id: $scope.activity.id});
		if(type == 'offers'){
			if($scope.activity.my_offer.length == 0){
				$scope.reqMessFormTitle = 'Make an Offer';
			}
			else{
				$scope.reqMessFormTitle = 'Update Offer';
			}
		}
		else{
			$scope.reqMessFormTitle = 'Add Comment';
		}


		console.log($scope.reqMess);
		$scope.modalOffers.show();
		return false;
	};
	$scope.closeModalOffers = function() {
		$scope.modalOffers.hide();
	};


	//modal booking request
	$ionicModal.fromTemplateUrl('templates/requestbooking.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modalBook = modal;
	});


	$scope.openModalBook = function() {
	    $scope.tracker('Open '+$scope.reqMessTitle+' form', {activity_id: $scope.activity.id});
		$scope.modalBook.show();
		return false;
	};
	$scope.closeModalBook = function() {
		$scope.modalBook.hide();
	};

	$scope.submitComment = function(){
		var comment = $scope.activity.my_comment;

		if(comment && comment.details){
			comment['an_offer'] = '1';
			comment['provider_id'] = $scope.userData.seeker_id;
			comment['task_id'] = $scope.activity.id;
			console.log(comment);

			$scope.loadingShow();

			$dataFactory.postRequest({data: comment}, 'request_offer').then(function(res){
				console.log(res.data);
				//$scope.activity.my_offer[0] = formData;
				$scope.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.closeModalOffers();
				$scope.popUp('Success!', 'Comment successfully added.');
				$scope.tracker('Comment submitted', {activity_id: $scope.activity.id});

				var space_name = space_search.searchKey;
				var lat = space_search.lat;
				var lng = space_search.lng;
				$scope.getSpaces(space_name, lat, lng);
				//$state.go("app.activity");

			}, function(err){
				$scope.resetLoading(err);
			});


		}
		else{
			$scope.popUp('Opps!', 'Comment field cannot be blank.');
		}
	};

	$scope.submitBooking = function(){
		if($scope.activity.my_offer.length > 0){
			if($scope.activity.my_offer[0].offer && $scope.activity.my_offer[0].details && $scope.activity.my_offer[0].paymenttype){
				var offer = $scope.activity.my_offer[0];
				offer['an_offer'] = '0';
				offer['provider_id'] = $scope.userData.seeker_id;
				offer['task_id'] = $scope.activity.id;
				$scope.activity.my_offer[0] = offer;

				console.log(offer);
				var m = ($scope.activity.hour_count > 1) ? 'months' : 'month';
				var hour_count = $scope.activity.hour_count;
				var text = '$'+ $scope.activity.my_offer[0].offer + '/month for '+hour_count+' '+m+'.';
				if($scope.activity.my_offer[0].paymenttype == 'fixed'){
					text = '$'+ $scope.activity.my_offer[0].offer + ' for '+hour_count+' '+m+'.';
				}
				$scope.showConfirm(text);
				//$scope.popUp('Success!', text);
			}
			else{
				$scope.popUp('Opps!', 'Please fill all required fields.');
			}
		}
		else{
			$scope.popUp('Opps!', 'Please fill all required fields.');
		}

	};

	// A confirm dialog
	$scope.showConfirm = function(text) {
		var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: (text) ? text : 'Confirm action.'
		});
		confirmPopup.then(function(res) {
		 if(res) {
		    console.log('You are sure');

			var offer = $scope.activity.my_offer[0];

			var formData = $scope.activity.my_offer[0];
		    console.log(formData);

			$scope.loadingShow();

			$dataFactory.postRequest({data: formData}, 'request_offer').then(function(res){
				console.log(res.data);
				$scope.activity.my_offer[0] = formData;
				$scope.loadingHide();
				$scope.closeModalBook();
				$scope.closeModal();
				$scope.closeModalOffers();
				$scope.popUp('Success!', 'Offer successfully posted.');
				$scope.tracker('Offer submitted', {activity_id: $scope.activity.id});

				var space_name = space_search.searchKey;
				var lat = space_search.lat;
				var lng = space_search.lng;
				$scope.getSpaces(space_name, lat, lng);
				//$state.go("app.activity");

			}, function(err){
				$scope.resetLoading(err);
			});


		 } else {
		   console.log('You are not sure');
		 }
		});
	};


}])

.controller('ServicesCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$localstorage', '$location', function($scope, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $localstorage, $location) {

    $scope.$parent.showHeader();
	$scope.loadingShow();
	$scope.userData = $localstorage.getObject('userdata');
	$scope.uripath = $location.path();

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.uservices = [];

	$dataFactory.postRequest(data, 'services').then(function(res){
		console.log(res.data);
		$scope.uservices = res.data;
		$scope.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});

	$scope.submitServices = function(uservices){
		$scope.loadingShow();

		$dataFactory.postRequest(uservices, 'services').then(function(res){
			console.log(res.data);
			$scope.tracker('Submitted services');
			//$scope.uservices = res.data;
			$scope.loadingHide();
			$scope.popUp('Success!', 'Services successfully saved!');
		}, function(err){
			$scope.resetLoading(err);
		});
	};



}])

.controller('CommunitiesCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$localstorage', '$location', function($scope, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $localstorage, $location) {

    $scope.$parent.showHeader();
	$scope.loadingShow();
	$scope.userData = $localstorage.getObject('userdata');
	$scope.uripath = $location.path();

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.communities = [];

	$dataFactory.postRequest(data, 'communities').then(function(res){
		console.log(res.data);
		$scope.communities = res.data.the_communities;
		$scope.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});


	$scope.saveComm = function(alerts){
		var count = 0;
		var arr = [];
		for(var a in alerts){
			if(alerts[a].active){
				arr.push(alerts[a].id);
			}
			console.log(alerts[a].active);
			count++;
		}

		console.log(arr);
		var settingsData = data;
		settingsData.my_communities = arr;
		settingsData.update_communities = 'yes';
		console.log(settingsData);

		$dataFactory.postRequest(data, 'communities').then(function(res){
			console.log(res.data);
			$scope.popUp('Success!', 'Changes successfully saved!');
			$scope.tracker('Submitted communities');
		}, function(err){
			$scope.resetLoading(err);
		});

	};


}])

.controller('PaymentCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$localstorage', function($scope, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $localstorage) {

	var pinApi = ($dataFactory.base_url == 'https://spacelli.com/') ? new Pin.Api('pk_72cCd02qhx82AtpjX27niw', 'live') : new Pin.Api('pk_qtXPf_R8LOeFPaoRiaV7ng', 'test');

	$scope.userData = $localstorage.getObject('userdata');
	$scope.$parent.loadingShow();
	//update user data
	$dataFactory.postRequest({seeker_id: $scope.$parent.userData.seeker_id}, 'user_info').then(function(res){
		$scope.$parent.loadingHide();
		$scope.$parent.userData = res.data.user;
		$localstorage.setObject('userdata', res.data.user);
		console.log(res.data);
	}, function(err){
		//$scope.resetLoading(err);
	});


	$scope.submitPayments = function(){

		var card = {
			number:           $('#cc-number').val(),
			name:             $('#cc-name').val(),
			expiry_month:     $('#cc-expiry-month').val(),
			expiry_year:      $('#cc-expiry-year').val(),
			cvc:              $('#cc-cvc').val(),
			address_line1:    $('#address-line1').val(),
			address_line2:    $('#address-line2').val(),
			address_city:     $('#address-city').val(),
			address_state:    $('#address-state').val(),
			address_postcode: $('#address-postcode').val(),
			address_country:  $('#address-country').val()
		};
		console.log(card);

		$scope.loadingShow();

		// Request a token for the card from Pin Payments
		pinApi.createCardToken(card).then(handleSuccess, handleError).done();
	};

	var handleSuccess = function(card) {
		console.log(card);

		var card_data = {
			card: card,
			email: $scope.userData.email,
			user_id: $scope.userData.seeker_id,
			user_name: $scope.userData.first_name +' '+ $scope.userData.last_name
		};

		$dataFactory.baseRequest(card_data, 'omnipaypin/paymentmethod').then(function(res){
			console.log(res.data);

			if (typeof res.data.response != "undefined") {
				var message = res.data.success_message; //act_mes.success.add_credit_card;

				//update local pin_payment
				var udata = $scope.userData;
				udata.pin_payment = {response: res.data.response};
				$localstorage.setObject('userdata', udata);
				$scope.loadingHide();
				$scope.popUp('Success!', message);
				$scope.tracker('Payment method submitted');
			}
			else{
				$scope.tracker('Payment method failed');
				if (typeof res.data.error_description != "undefined") {
					$scope.popUp('Error!', res.error_description);
				}
				else{
					$scope.popUp('Error!', 'Card not saved. Please check your card details.');
				}
			}


		}, function(err){
			$scope.resetLoading(err);
		});

	}
	var handleError = function(response) {
		console.log(response.error_description);
		var txt = response.error_description
		if (response.messages) {
		  $.each(response.messages, function(index, paramError) {
			console.log(paramError.message);
			//txt += '<br>'+paramError.message;
		  });
		}
		$scope.loadingHide();
		$scope.popUp('Opps!', txt);
	}


	if(typeof($scope.userData.pin_payment.response) === 'undefined'){
		$scope.popUp('Info', 'For your security, Spacelli does not store your banking details. Pin Payments is our secure payment provider.');
	}

}])

.controller('PayoutCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$localstorage', function($scope, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $localstorage) {

	var pinApi = ($dataFactory.base_url == 'https://spacelli.com/') ? new Pin.Api('pk_72cCd02qhx82AtpjX27niw', 'live') : new Pin.Api('pk_qtXPf_R8LOeFPaoRiaV7ng', 'test');

	//$scope.userData = $localstorage.getObject('userdata');
	$scope.$parent.loadingShow();
	//update user data
	$dataFactory.postRequest({seeker_id: $scope.$parent.userData.seeker_id}, 'user_info').then(function(res){
		$scope.$parent.loadingHide();
		$scope.$parent.userData = res.data.user;
		$localstorage.setObject('userdata', res.data.user);
		console.log(res.data);
	}, function(err){
		//$scope.resetLoading(err);
	});



	$scope.payout = {
		checked: ($scope.userData.pin_payout_settings == 'N') ? true : false,
		text: 'Enable Monthly Payout'
	};

	$scope.changePayout = function(checked){
		console.log(checked);
		var udata = $scope.userData;
		udata.pin_payout_settings = (checked) ? 'N' : 'Y';
		$localstorage.setObject('userdata', udata);
		var txt = (checked) ? 'You have successfully enabled monthly payout. We will process your monthly payout on the first day of every month.' : 'Monthly payout setting successfully updated.';

		var cdata = {
			seeker_id: 	$scope.userData.seeker_id,
			val: udata.pin_payout_settings
		};

		$dataFactory.postRequest(cdata, 'payout_monthly').then(function(res){
			console.log(res.data);
			$scope.tracker('Update payout setting', cdata);
			$scope.popUp('Success!', txt);
		}, function(err){
			$scope.resetLoading(err);
		});

	};

	$scope.submitPayments = function(){
//		var a = $('#address-line1'); //angular.element($('#address-line1'));
//		console.log(a, a.val());
		var card = {
		  bsb:     $('#ba-bsb').val(),
		  number:  $('#ba-number').val(),
		  name:    $('#ba-name').val(),
		};
		console.log(card);

		// Request a token for the card from Pin Payments
		pinApi.createBankAccountToken(card).then(handleSuccess, handleError).done();
	};

	var handleSuccess = function(card) {
		console.log(card);

		$scope.loadingShow();

		var card_data = {
			card: card,
			email: $scope.userData.email,
			user_id: $scope.userData.seeker_id,
			user_name: $scope.userData.first_name +' '+ $scope.userData.last_name
		};

		$dataFactory.baseRequest(card_data, 'omnipaypin/paymentmethod').then(function(res){
			console.log(res.data);

			if (typeof res.data.response != "undefined") {
				var message = res.data.success_message; //act_mes.success.add_credit_card;

				//update local pin_payment
				var udata = $scope.userData;
				udata.pin_bank = {response: res.data.response};
				$localstorage.setObject('userdata', udata);
				$scope.loadingHide();
				$scope.popUp('Success!', message);
				$scope.tracker('Payout submitted', cdata);
			}
			else{
				$scope.tracker('Payout failed', cdata);
				if (typeof res.data.error_description != "undefined") {
					$scope.popUp('Error!', res.error_description);
				}
				else{
					$scope.popUp('Error!', 'Card not saved. Please check your card details.');
				}
			}


		}, function(err){
			$scope.resetLoading(err);
		});

	}
	var handleError = function(response) {
		console.log(response.error_description);
		var txt = response.error_description
		if (response.messages) {
		  $.each(response.messages, function(index, paramError) {
			console.log(paramError.message);
			//txt += '<br>'+paramError.message;
		  });
		}

		$scope.popUp('Opps!', txt);
	}


	if(typeof($scope.userData.pin_bank.response) === 'undefined'){
		$scope.popUp('Info', 'For your security, Spacelli does not store your banking details. Pin Payments is our secure payment provider.');
	}

}])

.controller('TransactionCtrl', ['$scope', '$stateParams', '$dataFactory', '$localstorage', function($scope, $stateParams, $dataFactory, $localstorage) {

	$scope.loadingShow();

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.transactions = {};

	$dataFactory.postRequest(data, 'transactions').then(function(res){
		console.log(res.data);
		$scope.transactions = res.data;
		$scope.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});

}])

.controller('AlertsCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$localstorage', function($scope, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $localstorage) {

	$scope.loadingShow();

	var data = {seeker_id : $scope.userData.seeker_id};

	$scope.alerts = [];

	$dataFactory.postRequest(data, 'alerts').then(function(res){
		console.log(res.data);
		$scope.alerts = res.data.alert_settings;
		$scope.loadingHide();
	}, function(err){
		$scope.resetLoading(err);
	});


	$scope.saveAlerts = function(alerts){
		var count = 0;
		var arr = ['sendmess', 'newref', 'newpost', 'somebid'];
		for(var a in alerts){
			if(alerts[a].status){
				arr[count] = '';
			}
			console.log(alerts[a].status);
			count++;
		}

		console.log(arr);
		var settingsData = data;
		settingsData.settings = arr;
		console.log(settingsData);

		$dataFactory.postRequest(data, 'alerts').then(function(res){
			console.log(res.data);
			$scope.tracker('Alerts settings submitted');
			$scope.popUp('Success!', 'Changes successfully saved!');

		}, function(err){
			$scope.resetLoading(err);
		});

	};

	//popUps
	$scope.popUp = function(atitle, amessage){
		var alert_settings = {
			title: (atitle) ? atitle : 'Alert',
			template: (amessage) ? amessage : 'Some alert here!'
		};
		var alertPopup = $ionicPopup.alert(alert_settings);
		alertPopup;
	};

}])

.controller('PasswordCtrl', ['$scope', '$state', '$dataFactory', '$ionicModal', '$ionicPopup', '$ionicLoading', '$localstorage', function($scope, $state, $dataFactory, $ionicModal, $ionicPopup, $ionicLoading, $localstorage) {
	$scope.userData = $localstorage.getObject('userdata');

	$scope.pass = {};

	$scope.submitPass = function(pass){
		if(!pass.current || !pass.new || !pass.confirm){
			$scope.popUp('Opps!', 'All fields are required.');
		}
		else if(pass.new.length < 6){
			$scope.popUp('Opps!', 'New password must be atleast 6 characters.');
		}
		else if(pass.new != pass.confirm){
			$scope.popUp('Opps!', 'Confirm password didn\'t match.');
		}
		else{
			pass.seeker_id = $scope.userData.seeker_id;
			$dataFactory.getCounts(pass, 'save_password').then(function(res){
				console.log(res.data);
				if(res.data.result == 'success'){
					$scope.tracker('Password submitted');
					$scope.popUp('Success!', 'Password successfully updated.');
				}
				else{
					$scope.popUp('Opps!', 'Current password didn\'t match.');
				}
			}, function(err){
				$scope.resetLoading(err);
			});
		}

		console.log(pass);
	};


}])
;
