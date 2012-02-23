var test, // DOM NodeList caches
	// home = 'http://127.0.0.1:8000/',
	home = 'http://23.21.160.17/',
	// home = 'http://squares.fredtruman.com/',
	introduction = 'Hey there. Welcome to the wonderfully impulsive world of Squares, where code-based organisms with agency get you to drag them around all over town in the endless pursuit of their own cryptic and selfish goals.',
	// CLIENTID = 'GJBRSVE1RHFMVCU0U24NLCU2RFR4QGT0UH1MORG1IYYA5Q2G',
	CLIENTID = 'OEV1XMR3UXQCHJ0WM2G3K4OQ0CKN3XNBYKH0B3MVN3NOYZBK',
	// CLIENTSECRET = 'KFVN4K3Y42SHR411SIVGQCSVHLZTFMY4FDU5G42RJQOG2CXZ',
	CLIENTSECRET = 'UXQY0GPW0LKQJJSOFSXQP0KUGOMXOMVQI101VDI1OQDCQJT0',
	validateAddress = 'https://foursquare.com/oauth2/authenticate?client_id=' + CLIENTID + '&response_type=token&redirect_uri=' + home,
	token = document.location.href, // grabs the current address and looks for access tokens
	checkedIn = false,
	userName = 'userName',
	userId ='',
	checkinId ='',
	userPhoto='',
	lastCheckInName = 'a TEST location',
	nearbyVenues = [],
	rankedVenues = [],
	speed = 300,
	previousBeta,
	previousGamma,
	squareDimension = 120,
	squarePixelDim = 10,
	pixelCounter = 0,
	danceScore,
	checkInDuration = 1; // how long check-ins last, in minutes
	
	$.fn.pause = function(duration) { //calling pause on jquery events 
		$(this).animate({ dummy: 1 }, duration);
		return this;
	};
	
	Array.max = function( array ){
	    return Math.max.apply( Math, array );
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

	$('a#makeHappy').live('click', function(){logActivity(0.1)});//I called this 'logActivity' cuz there's probably a function for doing the activity before the score is sent to the server
	$('a#makeSad').live('click', function(){logActivity(-0.1)});
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
		$('#shadow').css('top',2*squareDimension + 'px');
		$('#content').css('paddingTop',240+squareDimension + 'px');		
		addPixels();
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
    //changed this to the search url, which caused some problems
		var getVenues = "https://api.foursquare.com/v2/venues/search?ll=" + lat + "," + lon + "&access_token=" + token[1] + "&client_id=" + CLIENTID + "&client_secret=" + CLIENTSECRET;
		var desiredVenueName;
		var desiredVenueAddress;
		$.ajax({
			url: getVenues,
			async: false,
			dataType: 'json',
			success: function(json) {
				// just random for now
        // NOT IF I HAVE ANYTHING TO SAY ABOUT IT -z
				// var desiredVenueNumber = json.response.groups[0].items[getDesiredVenue(json.response)]; //this so isn't a "number"
        
        //the above can't work this way, talking to the server is async, this only works when we were faking it.
        // so instead I'm factoring in the below
		    venues=[];
        $.each(json.response.groups[0].items, function(){ venues.push(this)});
        // console.log('VVVVVVVvv', venues);
        
        $.ajax({
          url: "/learn/choose/"+userId,
          // async: false,
          type: 'POST',
          dataType: 'json',
          data: $.toJSON(venues),
          success: function(data){
            console.log('data returned from sending venues!');
            console.log(data);
            $.each(data, function() {
              rankedVenues.push(this[1]);
              //var venueAddress = this.venue.location.address;
              //if (venueAddress!=undefined) {venueAddress='<h3>' + venueAddress + '</h3>';}else{venueAddress='';}
              //nearbyVenues.push('<a class="checkin nearby" title="' + this.venue.id + '"><h2>' + this.venue.name + '</h2>' + venueAddress + '</a>'); 
             });
            console.log(rankedVenues);
            console.log('imax=', rankedVenues.imax());
            maxScore= rankedVenues.imax();
            if (maxScore.index ==-1) maxScore.index=1; //on the first attempt, we have no data, so just pick the second result
            // and the old code added below
            desiredVenueNumber = json.response.groups[0].items[maxScore.index];
            desiredVenueNumber= {venue:desiredVenueNumber}; // the rest of this code expects it like this, le yuck
            // calls a function that crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
            desiredVenueID = desiredVenueNumber.venue.id;
            desiredVenueName = desiredVenueNumber.venue.name; 
            // console.log('dvn', desiredVenueNumber)
            desiredVenueAddress = desiredVenueNumber.venue.location.address;
            if (desiredVenueAddress!=undefined) {desiredVenueAddress= ', at ' + desiredVenueAddress;}else{desiredVenueAddress=' ';}
            //console.log(json.response.groups[0].items);
            $.each(json.response.groups[0].items, function() {
              var venueAddress = this.location.address;
              if (venueAddress!=undefined) {venueAddress='<h3>' + venueAddress + '</h3>';}else{venueAddress='';}
              nearbyVenues.push('<a class="checkin nearby" title="' + this.id + '"><h2>' + this.name + '</h2>' + venueAddress + '</a>'); 
            });
            console.log('desiredVenueName = ' + desiredVenueName);
            $('#content').append('<div id="requested"><p>Hello ' + userName + '. Me square.<br /> Me want go to <strong>' + desiredVenueName + desiredVenueAddress + '<strong></p><p class="button"><a class="checkin" title="' + desiredVenueID + '">Ok, we\'re here at ' + desiredVenueName + '</a></p><p id="more-options" class="button"><a>Nah, let\'s look for other options.</a></p></div>'); //
           
           
            } //end /learn/choose success
        }) //end learn choose ajax
			}
		});		
				
	}// end findNearby()
// 
// 	function getDesiredVenue(json) { // this should be received from server: it crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
// 		test=json;
// 		// console.log('jssson', json);
// 		venues=[];
// 	
// 		$.each(json.groups[0].items, function(){
// 			// venues.push(json.groups[0].items[v].venue);
// 			// console.log(json.groups[0].items);
// 			// console.log(this);
// 			venues.push(this) //this was this.venue, coming from api/explore. simply this using api/search
// 			});
// 	
// 		console.log(venues);
// 		console.log('get desired venue called'); 
// 		$.ajax({
// 			url: "/learn/choose/"+userId,
// 			// async: false,
// 			type: 'POST',
// 			dataType: 'json',
// 			data: $.toJSON(venues),
// 			success: function(data){
// 				console.log('data returned from sending venues!');
// 				console.log(data);
// 				$.each(data, function() {
//           rankedVenues.push(this[1]);
//           //var venueAddress = this.venue.location.address;
// 					//if (venueAddress!=undefined) {venueAddress='<h3>' + venueAddress + '</h3>';}else{venueAddress='';}
// 					//nearbyVenues.push('<a class="checkin nearby" title="' + this.venue.id + '"><h2>' + this.venue.name + '</h2>' + venueAddress + '</a>'); 
//          });
//         console.log(rankedVenues);
// 				console.log('imax=', rankedVenues.imax());
//         return rankedVenues.imax();
// 				}
// 			});
// 
// 				// console.log('imax=', rankedVenues.imax());
// 		// var desiredVenueNumber = Math.floor(Math.random()*30); // for now it just calls a random from the array
// 		// return desiredVenueNumber;
// 	}
	
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
		$('<div id="nearby"><p>Ok, where you want to go, Mr. Smartypants?</p></div>').hide().appendTo('#content').pause(speed).fadeIn(speed); //				
		$('<div/>', {
			'class': 'nearby-venues',
			html: nearbyVenues.join('')
		}).hide().appendTo('#content').pause(speed).fadeIn(speed);
		$('<p class="back nav button"><a id="requested">Nevermind.</a></p>').hide().appendTo('#content').pause(speed).fadeIn(speed);
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
		var activities = "<p class='button'><a id='makeHappy' class='activity'> Make me happy</a></p><p class='button'><a id='makeSad' class='activity'>Make me sad</a></p><p class='button'><a id='dance' class='activity'>Let\'s dance!</a></p>";
		$(activities).appendTo("#act").pause(speed).fadeIn(speed);
		$("<p id='checkout' class='back nav'><a id='requested'>Ok, let\'s leave " + lastCheckInName + ".</a></p>").appendTo("#act").pause(speed).fadeIn(speed);
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
			$('#square').css('margin-left', -(squareDimension/2) + x);
			$('#shadow').css('margin-left', -squareDimension + x);
			$('#square').css('top', 100 + y);
			$('#shadow').css('top', 2*squareDimension + y + 'px');
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
	
	function addPixels() {
		// the idea here is to divide the square into regions based on the number of parameters that we are using
		// and the color of each region is based on the parameters average, and the internal dimensions are determined by 
		// the percentage change (+plus or -minus)
		// alpha, luminosity and/or the smile (but probably the 'bounciness') is determined by the happiness score
		// The backend will deliver:
		// 1). The last score and average cumaltive score for each input between 0-1
		// 2). The last score and average cumulative happiness score between 0-1
		$('#square').css('height', squareDimension);
		$('#square').css('width', squareDimension);
		$('#square').css('marginTop', -squareDimension/2);
		$('#square').css('marginLeft', -squareDimension/2);
		for(var i=0; i<squarePixelDim; i++) {
			for(var j=0; j<squarePixelDim; j++) {
				var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';				
				var pixel = '<div class="' + pixelCounter + '"></div>';
				$('#square').append(pixel);
				$('#square .' + pixelCounter).css('background', hue);
				pixelCounter++;
			}
			
		}
		$('#square div').css('height',squareDimension/squarePixelDim);
		$('#square div').css('width',squareDimension/squarePixelDim);
	}

			
$(document).ready(function() {
	init();
});


Array.prototype.imax=function()
{
  if (this.length == 0)
        return {'index':-1};
    var maxIndex = 0;
      for (var i = 1; i<this.length; i++)
            if (this[i]>this[maxIndex]) 
                    maxIndex = i;
        return {'index':maxIndex, 'value':this[maxIndex]};
}
