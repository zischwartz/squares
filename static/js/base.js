//make happy/sad points bigger. 4 was probably too much. try 1 or 2... and make it a variable at the top
//also what happens if the happiness score is less than one? then you are dividiing by a fraction, so
//just add an if(happinessscore > 1) this else speed = 2 (something)
//zach will keep log(value) - but remove the divide by 10 - already done and pulled from git
(function($) {
    var 
        home = 'http://127.0.0.1:8000/',
        // home = 'http://23.21.160.17/',
        accessToken = '', //only set this once in the AUTHORIZED ROUTE
        CLIENTID = 'GJBRSVE1RHFMVCU0U24NLCU2RFR4QGT0UH1MORG1IYYA5Q2G',
        // CLIENTID = 'OEV1XMR3UXQCHJ0WM2G3K4OQ0CKN3XNBYKH0B3MVN3NOYZBK',
        CLIENTSECRET = 'KFVN4K3Y42SHR411SIVGQCSVHLZTFMY4FDU5G42RJQOG2CXZ',
        // CLIENTSECRET = 'UXQY0GPW0LKQJJSOFSXQP0KUGOMXOMVQI101VDI1OQDCQJT0',        
        validateAddress = 'https://foursquare.com/oauth2/authenticate?client_id=' + CLIENTID + '&response_type=token&redirect_uri=' + home,        
        squareDimension = 112,
        squarePixelDim = 16,
        checkInDuration = 112,
        userName = 'userName',
        checkedIn = false,
        userId ='',
        checkinId ='', 
        userPhoto='',
        nearbyVenues = [],
        rankedVenues = [],
        speed = 300,
        previousBeta = 0,
        previousGamma = 0,
        danceScore = 0,
        desiredVenue,
        desiredVenueName,
        desiredVenueAddress,
        desiredVenueID,
        happyIncrement
        ;
        
    $.lastCheckInName = 'a TEST location';
        
    $('.square').live("click", function() {
        console.log('click');
    });

    $.fn.pause = function(duration) { //calling pause on jquery events 
        $(this).animate({ dummy: 1 }, duration);
        return this;
    };
    Array.max = function( array ){
        return Math.max.apply( Math, array );
    };
    var minExcludeZero = function( array ){
        var tempArray = [];
        for (var i=0; i<array.length; i++) {
            if(array[i] != 0) {
                tempArray.push(array[i]);
            }
        }
        return Math.min.apply( Math, tempArray );
    };
    Array.prototype.imax = function() {
      if (this.length == 0)
            return {'index':-1};
        var maxIndex = 0;
          for (var i = 1; i<this.length; i++)
                if (this[i]>this[maxIndex]) 
                        maxIndex = i;
            return {'index':maxIndex, 'value':this[maxIndex]};
    }
    //checkIN to venues flow
    $("a.checkin").live("click", function(){
        //show a checkin confirmation button
        var text = $(this).children(":first").text();
        $('.confirm .venue-name').html(text);
        $('.confirm').show();
        $('a.checkin-confirm').attr('title',$(this).attr('title'));        
    });
    $("a.checkin-confirm").live('click', function(){
        $('.confirm').hide();
        $('.loading').show();
        console.log($(this).attr('title'));
        checkIN($(this).attr('title'));
    });
    $("a.checkin-decline").live("click", function(){
        $('.confirm').hide();
    });
    $('a.sad').live('click', function(){logActivity(-1)});
    //
    $("a.target-more_options").live("click", function(){
        window.location.replace(home + '#access_token=' + accessToken + '/more_options');
    });
    $("a.target-suggest").live("click", function(){
        window.location.replace(home + '#access_token=' + accessToken + '/suggest');
    });
    $("a.dance").live("click", function(){
        window.location.replace(home + '#access_token=' + accessToken + '/dance');
    });
    $(".stop-dancing").live("click", function(){ //this is the <p> id to stop the eventLstener. the interface functionality is handled by the '.back a' click function above
        stopDancing();
        window.location.replace(home + '#access_token=' + accessToken + '/activities');
    });
    //NEED TO FIGURE OUT HOW CHECKOUT WORKS WITH REPOPULATING INFO, cuz there's a lastVenue
    //cache that doesn't clear. The data doesn't cache (which is good) but the display
    //name for the venue caches. CAN YOU TAKE A LOOK, ZACH??
    $("a.target-check_out").live("click", function(){
        checkOut();
    });
    function checkOut() {
        //send stuff to zach's url
        console.log('you checked out!');
        $.ajax({
            type: 'GET',
            url: "/learn/train/"+checkinId,
        });
        checkedIn = false;
        getLocation();
    }
    function checkIN(venueID) {
        $('.loading').show();
        console.log('lastCheckInName at top of checkIn = ' + $.lastCheckInName);
        $.post('https://api.foursquare.com/v2/checkins/add?oauth_token=' + accessToken + '&broadcast=public&venueId=' + venueID , function(Cdata) {
            console.log('checkin', Cdata);
            $.get('https://api.foursquare.com/v2/venues/'+ venueID+ "?access_token=" + accessToken + "&client_id=" + CLIENTID + "&client_secret=" + CLIENTSECRET, function(Vdata){
                console.log('CHECKING IN');
                // alert('Venue Data Loaded');    
                sendToServer({type: 'checkin', 'userName': userName, 'userId':userId, 'checkinData': Cdata.response.checkin, 'venueData': Vdata.response.venue });
                checkinId = Cdata.response.checkin.id;
                $.lastCheckInName = Cdata.response.checkin.venue.name;
                console.log('response name is = ' + Cdata.response.checkin.venue.name);
                console.log('response name from lastCheckInName = ' + $.lastCheckInName);
                checkedIn = true;
                getLocation();
                }            
            );
            console.log('lastCheckInName at bottom of checkIn = ' + $.lastCheckInName);
            $('.loading').hide();
            window.location.replace(home + '#access_token=' + accessToken + '/activities');
        });
    }
    function findNearby(lat,lon) { //take the lat lon values and look for nearby venues in the foursquare API
    //changed this to the search url, which caused some problems
        $('.loading').show();
        var getVenues = "https://api.foursquare.com/v2/venues/search?ll=" + lat + "," + lon + "&access_token=" + accessToken + "&client_id=" + CLIENTID + "&client_secret=" + CLIENTSECRET;
        $.ajax({
            url: getVenues,
            async: false,
            dataType: 'json',
            success: function(json) {
                // var desiredVenueNumber = json.response.groups[0].items[getDesiredVenue(json.response)]; //this so isn't a "number"
                //the above can't work this way, talking to the server is async, this only works when we were faking it.
                // so instead I'm factoring in the below
                venues=[];
                $.each(json.response.groups[0].items, function(){ venues.push(this)});
                //console.log('VVVVVVVvv', venues);
                $.ajax({
                    url: "/learn/choose/"+userId,
                    // async: false,
                    type: 'POST',
                    dataType: 'json',
                    data: $.toJSON(venues),
                    success: function(data){
                        //console.log(data);
                        $.each(data, function() {
                            rankedVenues.push(this[1]);
                        });
                        maxScore= rankedVenues.imax();
                        if (maxScore.index ==-1) maxScore.index=1; //on the first attempt, we have no data, so just pick the second result
                        // and the old code added below
                        desiredVenueNumber = json.response.groups[0].items[maxScore.index];
                        desiredVenueNumber= {venue:desiredVenueNumber}; // the rest of this code expects it like this, le yuck
                        // calls a function that crunches the venues' attributes in the neural net and returns optimal venue from array of 30 nearby venues
                        desiredVenueID = desiredVenueNumber.venue.id;
                        desiredVenueName = desiredVenueNumber.venue.name; 
                        desiredVenueAddress = desiredVenueNumber.venue.location.address;
                        if (desiredVenueAddress!=undefined) {desiredVenueAddress= ', at ' + desiredVenueAddress;}else{desiredVenueAddress=' ';}
                        $.each(json.response.groups[0].items, function() {
                            var venueAddress = this.location.address;
                            if (venueAddress!=undefined) {venueAddress='<h3>' + venueAddress + '</h3>';}else{venueAddress='';}
                            nearbyVenues.push('<a class="checkin option" title="' + this.id + '"><h2>' + this.name + '</h2>' + venueAddress + '</a>');
                            //console.log('<a class="checkin option" title="' + this.id + '"><h2>' + this.name + '</h2>' + venueAddress + '</a>'); 
                        });
                    } //end /learn/choose success
                }) //end learn choose ajax
            }
        });
        $('.loading').hide();
        //add in functions from welcome HERE???    
        //areYouCheckedIn();    
        window.location.replace(home + '#access_token=' + accessToken + '/suggest');
    }// end findNearby()
    function getLocation() { // look at the GPS of the device and then call the API
        $('.loading').show();
        navigator.geolocation.getCurrentPosition(function(loc){
            var lat = loc.coords.latitude,
                lon = loc.coords.longitude;
                if ( checkedIn != true) {
                    $('.loading').hide();
                    findNearby(lat,lon); // take the lat lon values and look for nearby venues in the foursquare API
                } else {
                    //go to activities
                    window.location.replace(home + '#access_token=' + accessToken + '/activities');
                }
        });
    }// end getLocation()
    function areYouCheckedIn() { // pretty straight forward - returns false if your last check in was over 2 hours ago, or true if it was less than 2 hours ago
        $('.loading').show();
        var getCheckins = "https://api.foursquare.com/v2/users/self/checkins?oauth_token=" + accessToken,
            currentTime = Math.round(new Date().getTime() / 1000),
            elapsedTime = 0, // time between now and your last check-in            
            lastCheckInTime = 0; // time of your last check-in
        $.ajax({
            url: getCheckins,
            async: false,
            dataType: 'json',
            success: function(json) {
                console.log(json);
                try{ // what's this? Fred would like to know more about 'try' and catch(err)
                    $.lastCheckInName = json.response.checkins.items[0].venue.name;
                    console.log('lastCheckInName = ' + $.lastCheckInName);
                    lastCheckInTime = json.response.checkins.items[0].createdAt; // 
                    elapsedTime = (currentTime - lastCheckInTime) / 60; // in minutes    
                    checkinId = json.response.checkins.items[0].id;
                    }
                catch(err)
                {
                    elapsedTime = 10000;
                }
            }
        });
        if(elapsedTime < checkInDuration) {
            checkedIn = true;
        } else {
            checkedIn = false;
        }
        $('.loading').hide();
    } // end areYouCheckedIn()
    //for our server    
    function sendToServer(data){
        $('.loading').show();
        $.ajax({
            url:'/data/',
            data: $.toJSON(data),
            type: 'POST',
            dataType: 'json',
            success: function(json) {
                $('.loading').hide();
                console.log('send to server success');
            }
        });
    }//end sendToServer
    function getUserInfo() {
        $('.loading').show();
        var getInfo = 'https://api.foursquare.com/v2/users/self?oauth_token=' + accessToken;
        $.ajax({
            url: getInfo,
            async: false,
            dataType: 'json',
            success: function(json) {
                userName = json.response.user.firstName;
                userId = json.response.user.id;
                userPhoto = json.response.user.photo; 
                sendToServer({type: 'user', 'userName': userName, 'userId':userId});
                console.log('userId = ' + userId);
            }
        });
        $('.loading').hide();
    }
    function addPixels() {
        $('.loading').show();
        //get http://127.0.0.1:8000/learn/getvisdata/21208820
        $.getJSON('http://127.0.0.1:8000/learn/getvisdata/'+ userId, function(VisData){
                var totalHappy = VisData["total"],
                    lastInputs = VisData["lastInputs"],
                    lastTotal = VisData["lastTotal"],
                    net = VisData['net'],
                    mappedVals = [],
                    maxMappedVal,
                    minMappedVal,
                    rangeMapped
                ;
                //adjust the speed of the squares bounce based on how happy it is
                $('.square').css({'-webkit-animation-duration':(2/totalHappy).toString() + 's'});
                $('.shadow').css({'-webkit-animation-duration':(2/totalHappy).toString() + 's'});
                //I'd like to add in the range of the bounce as a parameter,
                //but changing webkit animations is moutful so I'm gonna save it as a 
                //'only if we have time' item :D    
                //$('@-webkit-keyframes bounce').css({'from { top': (60).toString() + 'px'});
                
                //map each value in lastInputs from 0-255 and add it to mappedVals array
                $.each(net, function() {
                    for(var i=0; i<this.length; i++) {
                        //if(this[i] != 0) {
                          //  mappedVals.push(52-(this[i]-1));
                        //} else {
                           mappedVals.push(this[i]); 
                        //}
                        
                    }
                });
                
                //find the min and max values, excluding zero
                //find the max value in the array of mappedVals
                // this is backwards because if A is stronger, the RGB value should be brighter, AKA a larger value, e.g.:
                /*
                A = 1 = ~255
                a = 2 = ~245
                B = 3 = ~235
                ...
                52 = ~10
                0 = 0
                */
                maxMappedVal = Array.max(mappedVals);
                minMappedVal = minExcludeZero(mappedVals);
                rangeMapped = maxMappedVal - minMappedVal;
                console.log("maxMappedVal = " +  maxMappedVal);
                console.log("minMappedVal = " +  minMappedVal);
                console.log("rangeMapped = " +  rangeMapped);
                //scale each value in mappedVals from 0 to the max value in the entire array
                for(var i=0; i<mappedVals.length; i++) {
                    //console.log("value before scale = " + mappedVals[i]);
                    mappedVals[i] = Math.floor(((mappedVals[i]*255)/maxMappedVal));
                    //console.log("value after scale = " + mappedVals[i]);
                }
                
                
                
                for(var i=0; i<256; i++) {
                    var hue = 'rgb(' + mappedVals[i] + ',' + mappedVals[i+1] + ',' + mappedVals[i+2] + ')',                
                        pixel = '<div class="' + i + '"></div>';
                    $('.square').append(pixel);
                    $('.square .' + i).css('background', hue);
                }
                $('.square div').css({'height':squareDimension/squarePixelDim,'width':squareDimension/squarePixelDim});
            }            
        );
        
        
        $('.loading').hide();
    }
    function dance() {
        danceScore = 0;
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
            $('.square').css({'margin-left': (-squareDimension/2 + x),'margin-top': (y)});
            $('.shadow').css({'margin-left': (-squareDimension + x), 'top': (300 + y)});
        }
        danceScore += (Math.abs(gamma) + Math.abs(beta))/1000;
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
    function logActivity(points){
        sendToServer({'type':'activity', 'points':points, 'id':checkinId});    
    }
    //this sets up routing with SAMMY.JS
    var squares = $.sammy('.content', function() {
        this.use('Template'); //we're using Sammy templates
        this.use('Session');
        this.around(function(callback) {
            var context = this;
            context.app.clearTemplateCache();
            this.load('static/data/content.json',{cache: false})
                    .then(function(items) {
                        context.items = items;
                    })
            .then(callback);                    
        });
    //WELCOME ROUTE, i.e. you do not have an OAUTH token from foursquare yet
        this.get('#/', function(context) {
            $('.loading').show();
            context.app.swap('');
            //render the welcome screen
            context.render('static/templates/welcome.template', {
                welcomeText : context.items[0].welcomeText
            }).then(function(element){
                $('.loading').hide();
                $(element).appendTo(context.$element());                
            });
        });
    //AUTHORIZED REDIRECT ROUTE, this is the url we get after getting an OAUTH token from foursquare
        //once we have it, we need to redirect to /suggest/ to render venues suggestions
        this.get(/#access_token=[0-9A-Z]{48}$/, function() {
            //grab the access token and set accessToken, then redirect to SUGGEST ROUTE
            $('.loading').show();
            accessToken = (window.location.href).split('=')[1];
            getUserInfo();
            areYouCheckedIn();
            getLocation();
            /*console.log('checkedIn = ' + checkedIn);
            if(checkedIn != true) {
                window.location.replace(home + '#access_token=' + accessToken + '/suggest');
            } else {
                window.location.replace(home + '#access_token=' + accessToken + '/activities');
            }*/
        });
    //SUGGEST ROUTE,
        this.get(/#access_token=[0-9A-Z]{48}\/suggest/, function(context) {
            //if a user tries to get into the app by hitting a back button
            //or from their cache and the access token hasn't been verified
            //i.e. if accessToken is an empty string
            //then we need to redirect them through the AUTHORIZED ROUTE
            //Repeat this for other routes!
            $('.loading').show();
            var tempToken = ((window.location.href).split('=')[1]).split('/')[0];
            if(accessToken === '') {
                //find the window.location and get everything between '=' and '/'
                //this is the accessToken. I know this seems redundant
                window.location.replace(home + '#access_token=' + tempToken);
            } else {
                var context = this;
                context.app.swap('');
                context.render('static/templates/suggest.template', {
                    //load in any data parsed from the API here
                    homeText : context.items[0].homeText,
                    venueName : desiredVenueName,
                    venueAddress : desiredVenueAddress,
                    venueID : desiredVenueID
                    //squareURL : home + '#access_token=' + tempToken + '/suggest'
                }).then(function(element){
                    $('.loading').hide();
                    $(element).appendTo(context.$element()); //add it to the screen
                    addPixels();
                });
            }
        });
    //ACTIVITIES ROUTE
        this.get(/#access_token=[0-9A-Z]{48}\/activities/, function(context) {
            //do we need to redirect them through the AUTHORIZED ROUTE?
            //console.log('accessToken = ' + accessToken);
            $('.loading').show();
            var tempToken = ((window.location.href).split('=')[1]).split('/')[0];
            if(accessToken === '') {
                //find the window.location and get everything between '=' and '/'
                //this is the accessToken. I know this seems redundant
                window.location.replace(home + '#access_token=' + tempToken);
            } else {        
                var context = this;
                context.app.swap('');
                context.render('static/templates/activities.template', {
                    //load in any data parsed from the API here
                    venueName : $.lastCheckInName
                }).then(function(element){
                    $('.loading').hide();
                    $(element).appendTo(context.$element()); //add it to the screen
                    addPixels();
                });
            }
        });
    //DANCE ROUTE
        this.get(/#access_token=[0-9A-Z]{48}\/dance/, function(context) {
            //do we need to redirect them through the AUTHORIZED ROUTE?
            //console.log('accessToken = ' + accessToken);
            $('.loading').show();
            var tempToken = ((window.location.href).split('=')[1]).split('/')[0];
            if(accessToken === '') {
                //find the window.location and get everything between '=' and '/'
                //this is the accessToken. I know this seems redundant
                window.location.replace(home + '#access_token=' + tempToken);
            } else {        
                var context = this;
                context.app.swap('');
                context.render('static/templates/dance.template', {
                    //load in any data parsed from the API here
                    userName : userName                        
                }).then(function(element){
                    $('.loading').hide();
                    $(element).appendTo(context.$element()); //add it to the screen
                    addPixels();
                    dance();
                });
            }
        });        
    //MORE_OPTIONS ROUTE
        this.get(/#access_token=[0-9A-Z]{48}\/more_options/, function(context) {
            //do we need to redirect them through the AUTHORIZED ROUTE?
            //console.log('accessToken = ' + accessToken);
            $('.loading').show();
            var tempToken = ((window.location.href).split('=')[1]).split('/')[0];
            if(accessToken === '') {
                //find the window.location and get everything between '=' and '/'
                //this is the accessToken. I know this seems redundant
                window.location.replace(home + '#access_token=' + tempToken);
            } else {        
                var context = this;
                context.app.swap('');
                context.render('static/templates/more_options.template', {
                    //load in any data parsed from the API here
                    venueName : desiredVenueName,
                    userName : userName,
                    venues : nearbyVenues.join('')
                }).then(function(element){
                    $('.loading').hide();
                    $(element).appendTo(context.$element()); //add it to the screen
                    addPixels();
                });
            }
        });
        
    });
    $(function() {
        squares.run('#/');
    });
})(jQuery);
