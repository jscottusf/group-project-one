//global variables
let searchLocation;
let cityAndState;
let city = ""; 
let state = "";
let displayCity = "";
let displayCount = 9;
let header;
let imageURL;
let breweryImage = {};
let images;
let randomNum;
var startNum;
//found online...not yet being used. Want to write a function that converts state abbreviation to full state name (to increase user friendliness)
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
}
//firebase...in keys.js
firebaseConfig;
//Initialize Firebase
firebase.initializeApp(firebaseConfig);
database = firebase.database();

//search breweryDB API
function searchBreweryDB() {
    var queryURL = 'https://api.openbrewerydb.org/breweries?per_page=50&by_city=' + city + '&by_state=' + state + '&sort=type,-name';
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET", 
    }).then(function(response) {
        console.log(response.length);
        var breweries = ('<div class="col-lg-12" id="breweries">');
        var moreBrewsButton = $('<button type="button" class="btn btn-lg m-3 btn-info" id="more-beer">More breweries</button>');
        if (response.length > 1) {
            header = $('<h2 id="brewery-header">There are ' + response.length + ' breweries in ' + displayCity + '</h2>');
        }
        //not working>
        else if (breweries.length === 0) {
            header = $('<h1 id="brewery-header">There were no breweries found in ' + displayCity + '. Check your spelling or search another city. </h1>');
        }
        else {
            header = $('<h2 id="brewery-header">There is ' + response.length + ' brewery in ' + displayCity + ' </h2>');
        }
        $('#brewery-list').append(header, breweries, moreBrewsButton);
        //adds one to random image, as there are 100 (0-99) images stored on firebase
        //done like this to keep images consistent, otherwise it keeps generating a new image when new breweries are added. could make user confused.
        startNum = randomNum;
        for (var i = 0; i < displayCount; i++)  {
            if(response[i]) {
                var brewCard = $('<div class="mx-0 my-2 brewery-' + i + '" id="card-container" data-toggle="modal" data-target="#info-modal">');
                $('#breweries').append(brewCard);
                var zip = response[i].postal_code.substr(0,5);
                var addressDiv = $('<div id="address"><i class="fas fa-map-marker-alt"></i> ' + response[i].street + '<br>' + response[i].city + ', ' + response[i].state + ' ' + zip + '</div>')
                var breweryImg = $('<img id="random-img" src="' + images[startNum].url + '" alt="brewery logo">')
                var breweryName = $('<h3 id="brewery-name">' + response[i].name + '</h3>');
                $(brewCard).append(breweryName, addressDiv, breweryImg);
                startNum += 1;
                //loop through array
                if (startNum > 99) {
                    startNum = 0;
                } 
            }
        }
    });
}

//reset display
function clearBreweries() {
    $('#breweries').remove();
    $('#brewery-header').remove();
    $('#more-beer').remove();
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
    displayCity = cityAndState[0];
    city = cityAndState[0].split(' ').join('%20');
    if (cityAndState[1] === undefined) {
        state = "";
    }
    else if (cityAndState[1].length <= 3) {
        state = "";
        //var ref = cityAndState[1].trim();
        //state = states.ref;
        //trying to use the state const above to convert abbreviated state name to full state name for search purposes. Keeps coming out as undefined though :( 
    }
    else if (cityAndState[1] != undefined) {
        state = cityAndState[1].trim().split(' ').join('%20');
    }
    //other code will go here
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
})

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

function searchZomato() {
    var foodURL = 'https://developers.zomato.com/api/v2.1/search?lat=' + breweryLat + '&lon=' + breweryLon + '&radius=2500';
    console.log(foodURL);
    $.ajax({
        url: foodURL,
        type: "GET", 
    }).then(function(response) {});
