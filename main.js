'use strict';

var map;
var service;
var infoWindow;
var pos;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.074409, lng: -89.384085},
        zoom: 15,
        gestureHandling: 'greedy'
    });

    infoWindow = new google.maps.InfoWindow;

    let bikeLayer = new google.maps.BicyclingLayer();
    bikeLayer.setMap(map);

    // Try HTML5 geolocation.
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(
            function(position) {
                let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
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


// Callback takes results and generates directions with waypoints by initiating services and launching the calculateAndDisplayRoute function

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
    const maxResult = $('#js-numberOfPlaygrounds').val();

    navigator.geolocation.getCurrentPosition(function(position) {
        let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        for (let i = 0; i < maxResult; i++) {
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
                    let parkTotal = route.legs.length;
                    console.log(route);

                // Search results summary information.
                    for (let i = 0; i < route.legs.length; i++) {
                        totalDistance += route.legs[i].distance.value;
                    }   
                    totalDistance *= 0.000621;
                    totalDistance  = totalDistance.toFixed(2);
            

                $('.js-contentContainer').html(`
                <section class="searchResultSummary">
                    <h2>Results</h2>
                    <div class="searchResultTotals">
                        <p>PG#: <span>${parkTotal}</span></p>
                        <p>Total Distance: <span>${totalDistance}</span></p>
                    </div>
                </section>
                <section id="directionsList">
                    <h2>Directions</h2>

                </section>
                <form class="createRouteForm js-createRouteForm" >
                    <input type="submit" value="START OVER" id="createRouteButton"/>
                </form>
              `);


                directionsDisplay.setPanel(document.getElementById('directionsList'));
              
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
    });
  }

// This listener function starts the search function, which kicks off the rest of the process.
function generateRoute() {
    $('.js-createRouteForm').submit(event => {
        event.preventDefault(); 

        const distanceAmount = $('#js-numberOfDistance').val() * 1609.344;

        infoWindow.close();
        
        navigator.geolocation.getCurrentPosition(function(position) {

            let searchLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
            let request = {
                location: searchLocation,
                radius: distanceAmount,
                keyword: 'park playground',
                type: ['park']
            };
    
            let service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, callback);
        });
    });
}

function locateDevice() {
    $('.js-contentContainer').on('click',`.js-iconButton`, event => {
        event.preventDefault();

        navigator.geolocation.getCurrentPosition(function(position) {

            pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            infoWindow.setPosition(pos);
            infoWindow.setContent('Current Location');
            infoWindow.open(map);
            map.setCenter(pos);

        });
    });
}

function startOver() {
    $('.js-createRouteForm').submit(event => {
        event.preventDefault(); 
        $('.contentContainer').html(`
            <div class="locateIconContainer">
                <button class="iconButton js-iconButton">
                    <i class="fas fa-street-view"></i>
                </button>
            </div>
        
            <h2>Instructions</h2>
            <p>Enter the maximum amount of park you want to visit and the mile radius you want to search from your current location.</p>

            <form class="createRouteForm js-createRouteForm" >
                <legend>Route Information</legend>
                <div class="numberInputContainer">
                    <div class="numberInput">
                        <label for="numberOfPlaygrounds">Max # of Playgrounds<br/>(btwn 1 and 23):</label>
                        <input type="number" name="numberOfPlaygrounds" id="js-numberOfPlaygrounds" value="4" min="1" max="23"/>
                    </div>
                    <div class="numberInput">
                        <label for="numberOfDistance">Distance in miles<br/>(btwn 1 and 30):</label>
                        <input type="number" name="numberOfDistance" id="js-numberOfDistance" value="3" min="1" max="30" />
                    </div>
                </div>
                <div class="typeInput">
                    <label for="typeOfActivity">Type of Activity</label>
                    <label><input type="radio" name="typeOfActivity" value="BICYCLING">Bike</label>
                    <label><input type="radio" name="typeOfActivity" value="WALKING" checked>Run</label>
                </div>
                <input type="submit" value="CREATE ROUTE" id="createRouteButton"/>
            </form>
        `);
    });
}

function mapApp() {
    locateDevice ();
    generateRoute();
}

$(mapApp);



