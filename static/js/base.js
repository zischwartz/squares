var test, // DOM NodeList caches
	home = 'http://127.0.0.1:8000/',
	// home = 'http://squares.fredtruman.com/',
	introduction = 'Hey there. Welcome to the wonderfully impulsive world of Squares, where code-based organisms with agency get you to drag them around all over town in the endless pursuit of their own cryptic and selfish goals.',
	CLIENTID = 'GJBRSVE1RHFMVCU0U24NLCU2RFR4QGT0UH1MORG1IYYA5Q2G',
	CLIENTSECRET = 'KFVN4K3Y42SHR411SIVGQCSVHLZTFMY4FDU5G42RJQOG2CXZ',
	validateAddress = 'https://foursquare.com/oauth2/authenticate?client_id=' + CLIENTID + '&response_type=token&redirect_uri=' + home,
	token = document.location.href, // grabs the current address and looks for access tokens
	checkedIn = false,
	userName = 'userName',
	userId ='',
	checkinId ='',
	userPhoto='',
	lastCheckInName = 'a TEST location',
	nearbyVenues = [],
	speed = 300,
	previousBeta,
	previousGamma,

	danceScore,

	checkInDuration = 1; // how long check-ins last, in minutes
	
	$.fn.pause = function(duration) { //calling pause on jquery events 
		$(this).animate({ dummy: 1 }, duration);
		return this;
	};

	$("p#more-options").live("click", function(){
		$('#content').children().fadeOut(speed);
		getMoreVenueOptions();
	});
	$("a.checkin").live("click", function(){
		checkIN($(this).attr('title'));
	});
	$(".back a").live("click", function(){ // this is a general interface function for back buttons. the ID of the <a> element should correspond to the ID of the <div> you want to fade back in
		$('#content').children().fadeOut(speed);
		$('div#' + this.id).pause(speed).fadeIn(speed);
	});
	$("#stop-dancing a").live("click", function(){ //this is the <p> id to stop the eventLstener. the interface functionality is handled by the '.back a' click function above
		stopDancing();
	});

	$("#checkout a#requested").live("click", function(){ //this is the <p> id to stop the eventLstener. the interface functionality is handled by the '.back a' click function above
		//();
		checkOut();
		
	});

	$('a#makeHappy').live('click', function(){logActivity(5)});//I called this 'logActivity' cuz there's probably a function for doing the activity before the score is sent to the server
	$('a#makeSad').live('click', function(){logActivity(-5)});
	$('a#dance').live('click', function(){dance()});
	

	function init() { // start everything up and check if you've validated squares with foursquare
		if( token.indexOf('=') != -1 ) { // does the current address have an equals sign in it?
			token = token.split('='); // grab the OAuth access token from the current address
			addSquare();
			getUserInfo();
			areYouCheckedIn();
			getLocation();
		} else { // if not then show a link to validate
			validate();
		}
	}// end init()


	function validate() { // this sticks a button with an API validation link in it
		console.log("You don\'t seem to have an access token");
		$('#content').append('<p id="introduction">' + introduction + '</p>'); // add an introductory paragraph
		$('#content').append('<p class="button"><a href="' + validateAddress + '">Ok, let\'s get my Square and do some stuff!</a></p>'); // add a link to log in to foursquare
	}// end vailidate()
	
	function addSquare() {
		console.log(" adding sq");
		$('<div id="square"></div><div id="shadow"></div>').hide().prependTo('body').pause(speed).fadeIn(speed); // add an introductory paragraph
	}//end addSquare
	
	function getLocation() { // look at the GPS of the device and then call the API
		$('#content').children().fadeOut(speed); //clear the interface if we just checked in through the app
		//console.log('getLocation()');
		navigator.geolocation.getCurrentPosition(function(loc){
			var lat = loc.coords.latitude;
			var lon = loc.coords.longitude;
			var doStuff = "<div id='act'><p>Well, here we are at <strong>" + lastCheckInName + "</strong>, " + userName + ". Awesome!</p> <p>Now let's do some stuff.</p></div>";
			if ( checkedIn == false) {
				// console.log("checkedin false ");

				findNearby(lat,lon); // take the lat lon values and look for nearby venues in the foursquare API
			} else {
				// console.log("checkedin true ");

				$(doStuff).hide().appendTo('#content').pause(speed).fadeIn(speed);
				initActivities();
			}
		});
	}// end getLocation()

	function findNearby(lat,lon) { //take the lat lon values and look for nearby venues in the foursquare API
		var getVenues = "https://api.foursquare.com/v2/venues/explore?ll=" + lat + "," + lon + "&access_token=" + token[1] + "&client_id=" + CLIENTID + "&client_secret=" + CLIENTSECRET;
		var desiredVenueName;
		var desiredVenueAddress;
		$.ajax({
			url: getVenues,
			async: false,
			dataType: 'json',
			success: function(json) {
				// just random for now
				
				var desiredVenueNumber = json.response.groups[0].items[getDesiredVenue(json.response)]; 
				// calls a function that crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
				desiredVenueID = desiredVenueNumber.venue.id;
				desiredVenueName = desiredVenueNumber.venue.name; 
				desiredVenueAddress = desiredVenueNumber.venue.location.address;
				if (desiredVenueAddress!=undefined) {desiredVenueAddress= ', at ' + desiredVenueAddress;}else{desiredVenueAddress=' ';}
				//console.log(json.response.groups[0].items);
				$.each(json.response.groups[0].items, function() {
					var venueAddress = this.venue.location.address;
					if (venueAddress!=undefined) {venueAddress='<h3>' + venueAddress + '</h3>';}else{venueAddress='';}
					nearbyVenues.push('<a class="checkin nearby" title="' + this.venue.id + '"><h2>' + this.venue.name + '</h2>' + venueAddress + '</a>'); 
				});
				console.log('desiredVenueName = ' + desiredVenueName);
				$('#content').append('<div id="requested"><p>Hey, I\'m your Square! Great to see you, ' + userName + ' - let\'s hang out!<br /> But just so you know you gotta take me someplace first.</p><p>OO! OO! I know! I really want to go to <strong>' + desiredVenueName + desiredVenueAddress + '<strong></p><p class="button"><a class="checkin" title="' + desiredVenueID + '">Ok, we\'re here at ' + desiredVenueName + '</a></p><p id="more-options" class="button"><a>Nah, let\'s look for other options.</a></p></div>'); //
			}
		});		
				
	}// end findNearby()

	function getDesiredVenue(json) { // this should be received from server: it crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
	test=json;
	// console.log('jssson', json);
	venues=[];
	
	$.each(json.groups[0].items, function(){
		// venues.push(json.groups[0].items[v].venue);
		// console.log(json.groups[0].items);
		// console.log(this.venue);
		venues.push(this.venue)
		});
	

	
	// console.log(venues);
	console.log('get desired venue called'); 
	$.ajax({
		url: "/learn/choose/"+userId,
		// async: false,
		type: 'POST',
		dataType: 'json',
		data: $.toJSON(venues),
		success: function(data){
			console.log('data returned from sending venues!');
			console.log(data);
			}
		});
		
		var desiredVenueNumber = Math.floor(Math.random()*30); // for now it just calls a random from the array
		return desiredVenueNumber;
	}
	
	function checkIN(venueID) {
		$.post('https://api.foursquare.com/v2/checkins/add?oauth_token=' + token[1] + '&broadcast=public&venueId=' + venueID , function(Cdata) {
			console.log('checkin', Cdata);
			$.get('https://api.foursquare.com/v2/venues/'+ venueID+ "?access_token=" + token[1] + "&client_id=" + CLIENTID + "&client_secret=" + CLIENTSECRET, function(Vdata){
				console.log('CHECKING IN');
				// alert('Venue Data Loaded');	
				sendToServer({type: 'checkin', 'userName': userName, 'userId':userId, 'checkinData': Cdata.response.checkin, 'venueData': Vdata.response.venue });
				checkinId = Cdata.response.checkin.id;
				lastCheckInName = Cdata.response.checkin.venue.name;
				checkedIn= true; //AHA!
				// alert(checkinId)
				getLocation();
				}			
			);
			// window.location.reload();
		});
	}
	
	function checkOut() {
		//send stuff to zach's url
		alert('you checked out!');
		$.ajax({
			type: 'GET',
			url: "/learn/train/"+checkinId,
		});
		checkedIn = false;
		getLocation();
	}

	function getMoreVenueOptions() {
		$('<div id="nearby"><p class="back nav"><a id="requested">Nevermind.</a></p><p>Ok, so where would you rather go, Mr. Smartypants?</p></div>').hide().appendTo('#content').pause(speed).fadeIn(speed); //				
		$('<div/>', {
			'class': 'nearby-venues',
			html: nearbyVenues.join('')
		}).hide().appendTo('#content').pause(speed).fadeIn(speed);
	}

	function getUserInfo() {
		var getInfo = "https://api.foursquare.com/v2/users/self?oauth_token=" + token[1];
		$.ajax({
			url: getInfo,
			async: false,
			dataType: 'json',
			success: function(json) {
				userName = json.response.user.firstName;
				userId = json.response.user.id;
				userPhoto = json.response.user.photo; 
				sendToServer({type: 'user', 'userName': userName, 'userId':userId});
			}
		});
	}

	function areYouCheckedIn() { // pretty straight forward - returns false if your last check in was over 2 hours ago, or true if it was less than 2 hours ago
		var getCheckins = "https://api.foursquare.com/v2/users/self/checkins?oauth_token=" + token[1];
		var currentTime = Math.round(new Date().getTime() / 1000);
		var elapsedTime = 0; // time between now and your last check-in			
		var lastCheckInTime = 0; // time of your last check-in
		$.ajax({
			url: getCheckins,
			async: false,
			dataType: 'json',
			success: function(json) {
				try{ // what's this? Fred would like to know more about 'try' and catch(err)
					lastCheckInName = json.response.checkins.items[0].venue.name;
					lastCheckInTime = json.response.checkins.items[0].createdAt; // 
					elapsedTime = (currentTime - lastCheckInTime) / 60; // in minutes	
					checkinId = json.response.checkins.items[0].id;
					}
				catch(err)
				{
					console.log(err);
					elapsedTime = 10000;
				}
			}
		});

		if(elapsedTime < checkInDuration) {
			checkedIn = true;
		} else {
			checkedIn = false;
		}
	} // end areYouCheckedIn()
	
	function initActivities() {
		var activities = "<p id='checkout' class='back nav'><a id='requested'>Ok, let\'s leave " + lastCheckInName + ".</a></p><a id='makeHappy' class='activity'> Make me happy</a><a id='makeSad' class='activity'>Make me sad</a><a id='dance' class='activity'>Let\'s dance!</a>";
		$(activities).appendTo("#act").pause(speed).fadeIn(speed);
	}
	
	function exitActivity() {
		$(this).parent().fadeOut(speed);
	}
		
	function dance() {
		var nav = '<p id="stop-dancing" class="back nav"><a id="act">Ok, we\'re done dancing.</a></p>';
		danceScore = 0;
		$('#content').children().fadeOut(speed);
		$(nav).hide().appendTo("#content").pause().fadeIn(speed);
		console.log('we\'re dancing');
		if (window.DeviceOrientationEvent) {
		  console.log("DeviceOrientation is supported");
		  window.addEventListener('deviceorientation', bustamove, false);
		} else {
			alert("Not supported on your device or browser. Sorry.");
		}
		
	}
	
	bustamove = function(eventData) { // this is the event handler for the device orientation in dance()
        var LR = eventData.gamma;
        var FB = eventData.beta;
        var DIR = eventData.alpha;
		var overThreshold = Math.abs(LR) > 4 || Math.abs(FB) > 4;
        var gamma = overThreshold ? LR : 0;
        var beta = overThreshold ? FB : 0;
		if (previousGamma != gamma || previousBeta != beta) {
			var x = Math.round(4 * gamma);
			var y = Math.round(4 * beta);			
			$('#square').css('margin-left', -30 + x);
			$('#shadow').css('margin-left', -60 + x);
			$('#square').css('top', 60 + y);
			$('#shadow').css('top', 140 + y);
		}
		danceScore += (Math.abs(gamma) + Math.abs(beta))/10000;
		console.log(danceScore);
		previousGamma = gamma;
		previousBeta = beta;
	}
	
	function stopDancing() { // remove the handler and log the score for the activity
		window.removeEventListener('deviceorientation', bustamove, false);
		logActivity(danceScore);
		danceScore = 0;
		//store the points someplace temporarily until it's time to log everything?
		//or send the score now and store it in the DB?
	}

	//for our server	
	function sendToServer(data){
		$.ajax({
			url:'/data/',
			data: $.toJSON(data),
			type: 'POST',
			dataType: 'json'
		});
	} //end sendToServer

	function logActivity(points){
		sendToServer({'type':'activity', 'points':points, 'id':checkinId});	
	}

			
$(document).ready(function() {
	init();
});