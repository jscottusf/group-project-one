//global variables
let searchLocation;
let cityAndState;
let city = ""; 
let state = "";
let displayCity = "";
let displayCount = 9;
var foodDisplayCount;
let header;
let imageURL;
let breweryImage = {};
let images;
let randomNum;
var startNum;
let breweries;
let breweryData = {};
let restaurants;
let restaurantData = {};
const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};

// firebaseConfig;
//Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBlv1hM_Yfh-sCVDgq3crNmKP1BVv5xC4o",
    authDomain: "brewgoimages.firebaseapp.com",
    databaseURL: "https://brewgoimages.firebaseio.com",
    projectId: "brewgoimages",
    storageBucket: "brewgoimages.appspot.com",
    messagingSenderId: "969778384720",
    appId: "1:969778384720:web:c70762ced17a0e269f6655"
};
const mapBoxApi = 'pk.eyJ1IjoianNjb3R0dXNmIiwiYSI6ImNrNjFpbWEydjAxbjgzam9hZTgyd3hoN3QifQ.tUiC-b5WfvxUJuYp49Vqzw';
const zomatoApi = '5b256502a738dbdef9eadd620cd79d8f';

firebase.initializeApp(firebaseConfig);
database = firebase.database();

//get location based on brewery address...
//many of the breweryDBs provide coordinates, BUT quite a few don't. This ensures that every brewery location is shown on the map.
function getLocation(address, city, state, zip) {
    var locationSearch = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURI(address) + '%20' + encodeURI(city) + '%20' + encodeURI(state) + '%20' + encodeURI(zip) + '.json?access_token=' + mapBoxApi;
    console.log(locationSearch);
    $.ajax({
        url: locationSearch,
        method: "GET",
    }).then(function(response) {
        latitude = response.features[0].center[1];
        longitude = response.features[0].center[0];
        mapBox(longitude, latitude);
        searchZomato();
    });
}

//display brewery location on map modal
function mapBox(long, lat) {
    mapboxgl.accessToken = mapBoxApi;
    //display map according to event location
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [long, lat],
    zoom: 13
    });
    //display map marker
    new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);
    //allows for full screen map
    map.addControl(new mapboxgl.FullscreenControl());
    //allows to zoom in and zoom out map
    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();
    //initial map is blurry, so calling resize adjusts blur
    map.on('load', function() {
        map.resize();
    });
}

//serach zamato for nearby restaurants
function searchZomato(){
    var foodURL = 'https://developers.zomato.com/api/v2.1/search?q=food&count=20&lat=' + latitude + '&lon=' + longitude + '&radius=2500&establishment_type=restaurant&sort=real_distance&order=asc';
    $.ajax({
        url: foodURL,
        headers: {
            "user-key": zomatoApi,
            "content-type": "application/json"
        },
        method: "GET"
    }).then(function(foodR) {
        var foodResults = foodR.restaurants;
        //added .empty because the restaurants were appending repeatedly while app was in use and adding five restaurants with every click
        $("#nearby-restaurants").empty();
        restaurants = [];
        foodDisplayCount = 0;
        for (var f = 0; f < foodResults.length; f++) {
            var restaurantName = foodResults[f].restaurant.name;
            var restaurantAddress = foodResults[f].restaurant.location.address;
            var menu = foodResults[f].restaurant.menu_url;
            var foodImg;
            if (foodResults[f].restaurant.thumb === "") {
                foodImg = "./assets/images/restaurant.jpg";
            }
            else {
                foodImg = foodResults[f].restaurant.thumb;
            }
            var foodPrice = foodResults[f].restaurant.price_range;
            //convert value into $$$$
            if (foodPrice === 1) {
                foodPrice = "$";
            }
            else if (foodPrice === 2) {
                foodPrice = "$$";
            }
            else if (foodPrice === 3) {
                foodPrice = "$$$";
            }
            else if (foodPrice === 4) {
                foodPrice = "$$$$";
            }
            else if (foodPrice === 5) {
                foodPrice = "$$$$$";
            }
            var foodRating = foodResults[f].restaurant.user_rating.aggregate_rating;
            //convert rating into thumbs up symbols
            if (foodRating < 1.5) {
                foodRating = '<i class="fas fa-thumbs-up"> </i><i class="far fa-thumbs-up"></i><i class="far fa-thumbs-up"></i><i class="far fa-thumbs-up"></i><i class="far fa-thumbs-up"></i>';
            }
            else if (foodRating >= 1.5 && foodRating < 2.5) {
                foodRating = '<i class="fas fa-thumbs-up"> </i><i class="fas fa-thumbs-up"></i><i class="far fa-thumbs-up"></i><i class="far fa-thumbs-up"></i><i class="far fa-thumbs-up"></i>';
            }
            else if (foodRating >= 2.5 && foodRating < 3.5) {
                foodRating = '<i class="fas fa-thumbs-up"> </i><i class="fas fa-thumbs-up"></i><i class="fas fa-thumbs-up"></i><i class="far fa-thumbs-up"></i><i class="far fa-thumbs-up"></i>';
            }
            else if (foodRating >= 3.5 && foodRating < 4.5) {
                foodRating = '<i class="fas fa-thumbs-up"> </i><i class="fas fa-thumbs-up"></i><i class="fas fa-thumbs-up"></i><i class="fas fa-thumbs-up"></i><i class="far fa-thumbs-up"></i>';
            }
            else if (foodRating >= 4.5) {
                foodRating = '<i class="fas fa-thumbs-up"> </i><i class="fas fa-thumbs-up"></i><i class="fas fa-thumbs-up"></i><i class="fas fa-thumbs-up"></i><i class="fas fa-thumbs-up"></i>';
            }
            var restaurantData = {"name" : restaurantName, "street" : restaurantAddress, "menu" : menu, "img": foodImg, "rating": foodRating, "price": foodPrice};
            restaurants.push(restaurantData);
        }
        showRestaurants();
    });
}

//display two restaurants at a time from restaurants array
function showRestaurants() {
    console.log(restaurants);
    $("#nearby-restaurants").empty();
    for (k = foodDisplayCount; k < (foodDisplayCount + 2); k++) {
        var foodDiv = $("<div>");
        var foodPic = $("<img width='300px'>");
        foodPic.attr("src", restaurants[k].img);
        foodPic.attr("alt", "Restaurant Pic");
        foodPic.addClass("card-img-top");
        var foodNameDiv = $("<h4>").text(restaurants[k].name);
        var foodRateDiv = $("<div>").html(restaurants[k].rating);
        var foodPriceDiv = $("<div>").text(restaurants[k].price);
        var foodAddressDiv = $("<div>").text(restaurants[k].street);
        var menuLink = $('<div><i class="fas fa-utensils"></i> <a href="' + restaurants[k].menu + '" class="text-dark" target="_blank">Menu</a></div>')
        foodAddressDiv.prepend('<i class="fas fa-map-marker-alt"></i>  ');
        var cardBody = $("<div>");
        foodDiv.addClass("food-div card")
        cardBody.addClass("card-body");
        foodDiv.css("width: 18rem;");
        cardBody.append(foodNameDiv);
        cardBody.append(foodAddressDiv);
        cardBody.append(menuLink);
        cardBody.append(foodRateDiv);
        cardBody.append(foodPriceDiv);
        foodDiv.append(foodPic);
        foodDiv.append(cardBody);
        $("#nearby-restaurants").append(foodDiv);
    }
}

//search breweryDB API
function searchBreweryDB() {
    var queryURL = 'https://api.openbrewerydb.org/breweries?per_page=50&by_city=' + encodeURI(city) + '&by_state=' + encodeURI(state) + '&sort=type,-name';
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET", 
    }).then(function(response) {
        //clear breweries array
        breweries = [];
        console.log(response.length);
        var breweriesDiv = ('<div class="col-lg-12" id="breweries">');
        var moreBrewsButton = $('<button type="button" class="btn btn-lg m-3 btn-info" id="more-beer">More breweries</button>');
        if (response.length > 1) {
            header = $('<h2 id="brewery-header">There are ' + response.length + ' breweries in ' + displayCity + '</h2>');
        }
        else if (response.length === 0) {
            header = $('<h1 id="brewery-header">There were no breweries found in ' + displayCity + '. Check your spelling or search another city. </h1>');
        }
        else {
            header = $('<h2 id="brewery-header">There is ' + response.length + ' brewery in ' + displayCity + ' </h2>');
        }
        $('#brewery-list').append(header, breweriesDiv, moreBrewsButton);
        //adds one to random image, as there are 100 (0-99) images stored on firebase
        //done like this to keep images consistent, otherwise it keeps generating a new image when new breweries are added. could make user confused.
        startNum = randomNum;
        for (var i = 0; i < displayCount; i++)  {
            if(response[i]) {
                //brewery card info
                var brewCard = $('<div class="mx-0 my-2 brewery-' + i + '" id="card-container" data-number="' + i + '" data-toggle="modal" data-target="#info-modal">');
                $('#breweries').append(brewCard);
                var zip = response[i].postal_code.substr(0,5);
                var addressDiv = $('<div id="address"><i class="fas fa-map-marker-alt"></i> ' + response[i].street + '<br>' + response[i].city + ', ' + response[i].state + ' ' + zip + '</div>');
                var breweryImg = $('<img id="random-img" src="' + images[startNum].url + '" alt="brewery logo">');
                var breweryNameH3 = $('<h3 id="brewery-name">' + response[i].name + '</h3>');
                $(brewCard).append(breweryNameH3, addressDiv, breweryImg);
                startNum += 1;
                //loop through array
                if (startNum > 99) {
                    startNum = 0;
                }
                //create a data array to use for modal
                var breweryName = response[i].name;
                var breweryStreet = response[i].street;
                var breweryCity = response[i].city;
                var breweryState = response[i].state;
                //zip is above
                var breweryLong = response[i].longitude;
                var breweryLat = response[i].latitude;
                var breweryPhone = response[i].phone;
                var breweryUrl = response[i].website_url;
                breweryData = {"name": breweryName, "street": breweryStreet, "city": breweryCity, "state": breweryState, "zip": zip, "longitude": breweryLong, "latitude": breweryLat, "phone": breweryPhone, "url": breweryUrl};
                breweries.push(breweryData);
            }
        }
        console.log(breweries);
    });
}

//reset display
function clearBreweries() {
    $('#breweries').remove();
    $('#brewery-header').remove();
    $('#more-beer').remove();
}

//whatever the user inputs as a city, correct capitalization for display purposes 
function cityCapitalization(str) {
    str = str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    displayCity = str;
    return displayCity;
}

//on form click
$('form').on('submit', function(event) {
    event.preventDefault();
    clearBreweries();
    displayCount = 9;
    //pulls random number for images from firebase
    randomNum = Math.floor(Math.random() * 100);
    searchLocation = $('.search-input').val().trim();
    cityAndState = searchLocation.split(',');
    city = cityAndState[0];
    //make all letters lowercase and then make each first letter uppercase and return var displayCity;
    cityCapitalization(city);
    if (cityAndState[1] === undefined) {
        state = "";
    }
    else if (cityAndState[1].length === 2 || cityAndState[1].length === 3) {
        var ref = cityAndState[1].trim().toUpperCase();
        state = states[ref];
    }
    else {
        state = cityAndState[1].trim();
    }
    //search breweryDB api
    searchBreweryDB();
    //scroll down to #breweries <div>
    $('html, body').animate({
        scrollTop: $("#brewery-list").offset().top - 50
   }, 500);
   $('.search-input').val('');
});

//on feautured cities click
$('.city-container').on('click', function(event) {
    event.preventDefault();
    clearBreweries();
    //pulls random number for images from firebase
    randomNum = Math.floor(Math.random() * 100);
    displayCount = 9;
    city = $(this).attr('data-city');
    state = $(this).attr('data-state');
    displayCity = $(this).attr('id');
    searchBreweryDB();
    $('html, body').animate({
        scrollTop: $("#brewery-list").offset().top - 50
   }, 500);
});

//add more breweries from same city
$('html, body').on('click', '#more-beer', function(event) {
    event.preventDefault();
    clearBreweries();
    city; 
    state;
    displayCity;
    displayCount += 3;
    searchBreweryDB();
});

//on brewery card click, append info to modal
$('#brewery-list').on('click', '#card-container', function(event) {
    event.preventDefault();
    var dataNum = $(this).attr('data-number');
    var areaCode = breweries[dataNum].phone.substr(0,3);
    var prefix = breweries[dataNum].phone.substr(3,3);
    var lineNum = breweries[dataNum].phone.substr(6,4);
    $('#brewery').text(breweries[dataNum].name);
    $('#address-info').html('<div id="address"><i class="fas fa-map-marker-alt"></i> ' + breweries[dataNum].street + '<br>' + breweries[dataNum].city + ', ' + breweries[dataNum].state + ' ' + breweries[dataNum].zip + '</div>');
    $('#phone-info').html('<div id="phone"><i class="fas fa-phone"></i>  (' + areaCode + ') ' + prefix + '-' + lineNum + '</div>');
    $('#website-info').html('<div id="website"><i class="fab fa-safari"></i> <a href="' + breweries[dataNum].url + '" class="text-dark" target="_blank">' + breweries[dataNum].url + '</a></div>');
    getLocation(breweries[dataNum].street, breweries[dataNum].city, breweries[dataNum].state, breweries[dataNum].zip);
    //dropped the following method...not all brewery locations were provided on brewery DB api...
    //mapBox(breweries[dataNum].longitude, breweries[dataNum].latitude);
});

//restaurants scroll left
$('.modal-body').on('click', '.left', function(event) {
    event.preventDefault();
    foodDisplayCount -= 2;
    if (foodDisplayCount < 0) {
        foodDisplayCount = (restaurants.length - 2);
    }
    showRestaurants();

});

//restaurants scroll right
$('.modal-body').on('click', '.right', function(event) {
    event.preventDefault();
    foodDisplayCount += 2;
    if (foodDisplayCount >= restaurants.length) {
        foodDisplayCount = 0;
    }
    showRestaurants();
});

//I ran a bing images api search and stored 100 generic brewery object image urls in and array called images on firebase
//There images generate randomly at the top of each brewery card
database.ref().on('value', function(snapshot) {
    if (snapshot.child('images').exists()) {
        images = snapshot.val().images;
        console.log(snapshot.val());
        }
    }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
    });

if (!Array.isArray(images)) {
images = [];
}