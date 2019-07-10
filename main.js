'use strict';

var map;
var service;
var infoWindow;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.074409, lng: -89.384085}, // Madison, WI
        zoom: 15,
        gestureHandling: 'greedy', // One finger operation
        //Styling Map - colors and removal of superflous information like retail stores
        styles: [
            {"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType": "administrative.neighborhood","elementType": "all","stylers": [{"visibility": "on"},{"hue": "#0080ff"},{"weight": "0.63"}]},
            {"featureType": "landscape","elementType": "all","stylers": [{"color": "#f2f2f2"},{"visibility": "on"}]},
            {"featureType": "landscape","elementType": "geometry","stylers": [{"visibility": "on"}]},
            {"featureType":"poi","elementType":"all","stylers":[{"visibility":"on"},{"hue": "#0092ff"}]},
            {"featureType": "poi","elementType": "geometry","stylers": [{"visibility": "off"},{"hue": "#00ff89"}]},
            {"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.government","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"},{"hue": "#76ff00"}]},
            {"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType": "road","elementType": "all","stylers": [{"saturation": -20},{"lightness": 10},{"visibility": "on"}]},
            {"featureType": "road","elementType": "geometry","stylers": [{"visibility": "on"}]},
            {"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},
            {"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},
            {"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"on"}]},
            {"featureType":"transit.line","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"transit.line","elementType":"labels","stylers":[{"visibility":"off"}]},
            {"featureType":"transit.station","elementType":"all","stylers":[{"visibility":"off"}]},
            {"featureType":"water","elementType":"all","stylers":[{"color": "#0093b2"},{"visibility": "on"}]}]
    });

    infoWindow = new google.maps.InfoWindow;

    let bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

    // Initial GeoLocation call - saved locally to global use
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(
            function(position) {

                localStorage.setItem('globalLat', position.coords.latitude);
                localStorage.setItem('globalLng', position.coords.longitude);

                let pos = new google.maps.LatLng(Number(localStorage.getItem('globalLat')), Number(localStorage.getItem('globalLng')));
                infoWindow.setPosition(pos);
                infoWindow.setContent('Current Location');
                infoWindow.open(map);
                map.setCenter(pos);
            }, 
            function() {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}


// Callback takes the results from the API request and makes sure it is successful. Creates directions service and display instance. Sends both plus results to calculateAndDisplayRoute to generate route and directions. 

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay, results);
  }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, results) {
    let waypts = [];
    let checkboxArray = results;
    const routeType = $("form input[type='radio']:checked").val();
    const maxResult = $('#js-numberOfParks').val();
    const maxFound = checkboxArray.length;
    let pos = new google.maps.LatLng(Number(localStorage.getItem('globalLat')), Number(localStorage.getItem('globalLng')));

        //Creates array of waypoints up to maxResult amount to send to directions request object
        for (let i = 0; i < maxResult && i < maxFound; i++) {
            if (checkboxArray[i].place_id) {
              waypts.push({
                location: {
                  'placeId': checkboxArray[i].place_id
                },
                stopover: true
              });
            }
        }
        directionsService.route({
            origin: pos,
            destination: pos,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: routeType
        }, function(response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
                    $('.js-contentContainer').empty();

                    let route = response.routes[0];
                    let totalDistance = 0;
                    let totalSeconds = 0;
                    let totalTime;
                    let parkTotal = route.legs.length - 1;

                // Search results summary
                    for (let i = 0; i < route.legs.length; i++) {
                        totalDistance += route.legs[i].distance.value;
                        totalSeconds += route.legs[i].duration.value;
                    }   
                    totalDistance *= 0.000621;
                    totalDistance  = totalDistance.toFixed(2);

                    totalTime = timeCreator(totalSeconds); //Seconds to HH:MM:SS function


            
                $( '.js-restartButton').removeClass( "hidden" );
                $( '.js-contentContainer').removeClass( "noScroll" );

                $('.js-contentContainer').html(`
                    <section class="searchResultSummary">
                        <h2>Results</h2>
                        <div class="searchResultTotals">
                            <p>Park Stops:<br/><span class="totalResult">${parkTotal}</span></p>
                            <p>Total Miles:<br/><span class="totalResult">${totalDistance}</span></p>
                            <p>Estimated Time:<br/><span class="totalResult">${totalTime}</span></p>
                        </div>
                    </section>
                    <section id="directionsList">
                        <h2>Directions</h2>

                    </section>
                    <section id="routeButtonContainer">
                        <form class="startOver js-startOverForm" >
                            <input type="submit" value="START OVER" class="js-restartButton mapButtons"/>
                        </form>
                    </section>
                `);


                directionsDisplay.setPanel(document.getElementById('directionsList'));

                startOver();
              
            } else {
              window.alert('Directions request failed due to ' + status);
            }
        });
  }

  function timeCreator (Totalseconds) {

    const hours = Math.floor(Totalseconds/3600);
    const minutes = Math.floor((Totalseconds - (hours * 3600))/60);
    const seconds = Totalseconds % 60;

    let hoursString = hours.toString();
    let minutesString = minutes.toString();
    let secondsString = seconds.toString();

    console.log (minutesString.length);

    if ( hoursString.length === 1 ) {
        hoursString = "0" + hoursString;
    }
    if ( minutesString.length === 1 ) {
        minutesString = "0" + minutes;
    }
    if ( secondsString.length === 1 ) {
        secondsString = "0" + seconds;
    }

    return hoursString + ":" + minutesString + ":" + secondsString;

}

// This listener function creates an initial request to the API and sends the results to Callback function.
function generateRoute() {
    $('.js-createRouteForm').submit(event => {
        event.preventDefault(); 

        const distanceAmount = $('#js-numberOfDistance').val() * 1609.344; // Miles to meters

        infoWindow.close();

        let searchLocation = new google.maps.LatLng(Number(localStorage.getItem('globalLat')), Number(localStorage.getItem('globalLng')));
    
        let request = { 
            location: searchLocation,
            radius: distanceAmount,
            keyword: 'park playground',
            type: ['park']
        };
    
        let service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, callback); 
            // Send object request, then send result to callback
    });
}

function startOver() {
    $('.js-restartButton').click(event => {
        event.preventDefault(); 
        localStorage.clear();
        location.reload();
    });
}

function locateDevice() {
    $('.topButtonMenu').click('#js-locateButton', event => {
        event.preventDefault();

        navigator.geolocation.getCurrentPosition(function(position) {

            let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            infoWindow.setPosition(pos);
            infoWindow.setContent('Current Location');
            infoWindow.open(map);
            map.setCenter(pos);

        });
    });
}


function mapApp() {
    locateDevice ();
    generateRoute();
}

$(mapApp);



