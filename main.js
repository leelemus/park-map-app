'use strict';

/*

var request = {
    location: pyrmont,
    radius: '500',
    type: ['restaurant']
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);


*/

var map;
var infoWindow;
var service;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 43.074409, lng: -89.384085},
    zoom: 15
  });
  infoWindow = new google.maps.InfoWindow;
  var bikeLayer = new google.maps.BicyclingLayer();
  bikeLayer.setMap(map);

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
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

function findLocation() {
    // HTML5 geolocation.
    navigator.geolocation.getCurrentPosition(function(position) {

        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
  
        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        infoWindow.open(map);
        map.setCenter(pos);
    });
}

function locateDevice() {
    $('.js-contentContainer').on('click',`.js-iconButton`, event => {
        console.log('this works');
        findLocation();
    });
}

/*
function getResults() {
    $('.js-createRouteForm').on('click',`#createRouteButton`, event => {

        event.preventDefault();  
        var pyrmont = new google.maps.LatLng(43.074409, -89.384085);

        map = new google.maps.Map(document.getElementById('map'), {
            center: pyrmont,
            zoom: 15
        });

        var request = {
            location: pyrmont,
            query: 'playground',
            radius: '500'
        };

        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
    });
}
*/

function getResults() {
    $('.js-createRouteForm').on('click',`#createRouteButton`, event => {
        event.preventDefault(); 
        // Try HTML5 geolocation.
        
            navigator.geolocation.getCurrentPosition(function(position) {
            
                let searchLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                map = new google.maps.Map(document.getElementById('map'), {
                    center: searchLocation,
                    zoom: 15
                });

                let request = {
                    location: searchLocation,
                    radius: '1000',
                    keyword: 'park playground',
                    type: ['park']
                  };
                let service = new google.maps.places.PlacesService(map);
                  service.nearbySearch(request, callback);
            });
    });
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
        console.log(results.length);
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
    let marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
}

function mapApp() {
    locateDevice ();
    getResults();
}

$(mapApp);



