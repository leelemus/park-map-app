'use strict';

var map;
var service;
var infoWindow;

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
                localStorage.setItem('globalLat', position.coords.latitude);
                localStorage.setItem('globalLng', position.coords.longitude);
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
    const maxResult = $('#js-numberOfParks').val();
    const maxFound = checkboxArray.length;
    let pos = new google.maps.LatLng(Number(localStorage.getItem('globalLat')), Number(localStorage.getItem('globalLng')));

    console.log(maxResult);
    console.log(maxFound);

        for (let i = 0; i < maxResult && i < maxFound; i++) {
            if (checkboxArray[i].place_id) {
                console.log(i);
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
                    let parkTotal = route.legs.length -1;

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
                    <section id="routeButtonContainer">
                        <form class="startOver js-startOverForm" >
                            <input type="submit" value="START OVER" id="js-startOverButton" class="mapButtons"/>
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

// This listener function starts the search function, which kicks off the rest of the process.
function generateRoute() {
    $('.js-createRouteForm').submit(event => {
        event.preventDefault(); 

        const distanceAmount = $('#js-numberOfDistance').val() * 1609.344;

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
    });
}

function startOver() {
    $('.js-contentContainer').click('#js-startOverButton', event => {
        event.preventDefault(); 
        localStorage.clear();
        location.reload();
    });
}

function locateDevice() {
    $('.js-iconButton').click(event => {
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



