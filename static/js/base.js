var // DOM NodeList caches
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
	userPhoto='',
	lastCheckInName = 'a location',
	nearbyVenues = [],
	checkInDuration = 1; // how long check-ins last, in minutes
	


	$("p#more-options").live("click", function(){
		getMoreVenueOptions();
		$('#requested-venue').remove();
	});
	$("a.checkin").live("click", function(){
		checkIN($(this).attr('title'));
	});


	function init() { // start everything up and check if you've validated squares with foursquare
		if( token.indexOf('=') != -1 ) { // does the current address have an equals sign in it?
			token = token.split('='); // grab the OAuth access token from the current address
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
		$('#content').append('<p  class="button"><a href="' + validateAddress + '">Ok, let\'s get my Square and do some stuff!</a></p>'); // add a link to log in to foursquare
	}// end vailidate()

	function getLocation() { // look at the GPS of the device and then call the API
		navigator.geolocation.getCurrentPosition(function(loc){
			var lat = loc.coords.latitude;
			var lon = loc.coords.longitude;
			var doStuff = "<p>Well, here we are at <strong>" + lastCheckInName + "</strong>, " + userName + ". Awesome!</p> <p>Now let's do some stuff.</p>";
			if ( checkedIn == false) {
				findNearby(lat,lon); // take the lat lon values and look for nearby venues in the foursquare API
			} else {
				$('#content').append(doStuff);
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
				var desiredVenueNumber = json.response.groups[0].items[getDesiredVenue(json.response)]; // calls a function that crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
				desiredVenueID = desiredVenueNumber.venue.id;
				desiredVenueName = desiredVenueNumber.venue.name; 
				desiredVenueAddress = desiredVenueNumber.venue.location.address;
				$.each(json.response.groups[0].items, function() {
					nearbyVenues.push('<a class="checkin nearby" title="' + this.venue.id + '"><h2>' + this.venue.name + '</h2><h3>' + this.venue.location.address + '</h3></a>'); 
				});
				$('#content').append('<div id="requested-venue"><p>Hey! Great to see you, ' + userName + ' - let\'s hang out! But just so you know you gotta take me someplace first.</p><p>OO! OO! I know! I really want to go to <strong>' + desiredVenueName + ', at ' + desiredVenueAddress + '<strong></p><p class="button"><a class="checkin" title="' + desiredVenueID + '">Ok, we\'re here at ' + desiredVenueName + '</a></p><p id="more-options" class="button"><a>Nah, let\'s look for other options.</a></p></div>'); //
			}
		});		
				
	}// end findNearby()

	function getDesiredVenue(json) { // this should be received from server: it crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
		var desiredVenueNumber = Math.floor(Math.random()*30); // for now it just calls a random from the array
		return desiredVenueNumber;
	}
	
	function checkIN(venueID) {
		$.post('https://api.foursquare.com/v2/checkins/add?oauth_token=' + token[1] + '&broadcast=public&venueId=' + venueID , function(data) {
			console.log('checkin',data);
			$.get('https://api.foursquare.com/v2/venues/'+ venueID+ "?access_token=" + token[1] + "&client_id=" + CLIENTID + "&client_secret=" + CLIENTSECRET, function(data){
				console.log('venue', data);
				alert('Venue Data Loaded');	
				}			
			);
			// window.location.reload();
		});
	}

	function getMoreVenueOptions() {
		$('#content').append('<p>So where the heck are we?</p>'); //				
		$('<div/>', {
			'class': 'nearby-venues',
			html: nearbyVenues.join('')
		}).appendTo('#content');
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
				// man, we should just pass everything to our server.
				// sendToServer({'action': 'new', type: 'user', 'userName': userName, 'userId':userId});
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
				lastCheckInName = json.response.checkins.items[0].venue.name;
				lastCheckInTime = json.response.checkins.items[0].createdAt; // 
				elapsedTime = (currentTime - lastCheckInTime) / 60; // in minutes	
			}
		});
		if(elapsedTime < checkInDuration) {
			checkedIn = true;
		} else {
			checkedIn = false;
		}
	} // end areYouCheckedIn()
	

	//for our server	
	function sendToServer(data){
		$.ajax({
			url:'/data/',
			data: data,
			type: 'POST',
		});
	} //end sendToServer

			
$(document).ready(function() {
	init();
});