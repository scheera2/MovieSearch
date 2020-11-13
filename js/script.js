/* Javascript/JQuery for the Movie Search Page (Run through OMDB API) */

$(document).ready(function () {
  $("#searchForm").on("submit", function (e) {
    e.preventDefault();
    let searchText = $("#searchText").val();
    getMovies(searchText); //calls method to search AirTable
  });
});

async function getMovies(text) {
  try {
    var movies = await $.getJSON(
      `https://www.omdbapi.com/?apikey=1593aaef&plot=full&t=${text}` //Uses the searched text to fetch data from OMDB API
    );

    // This happens if the request is sucesssful
    console.log(movies);

    var { Poster, Title, Year, Plot, Genre, Rated, Ratings } = movies; //Sets array of fetched data to append the current text

    $(".poster").attr("src", Poster);
    $("#moviePoster").css("opacity", "100%");
    $(".title").text(Title);
    $(".year").text(Year);
    $(".summary").text(Plot);
    $(".genre").text(Genre);

    getRated(Rated); //Calls method to display rating of the movie
    getRatings(Ratings); //Calls methos to display critic ratings of the movie
  } catch (err) {
    // This happens if the request fails
    console.error(err);
  }
}

function getRated(rated) {
  var imageBasePath = `./images/ratingicons`; //Sets base path to image folder with movie ratings (G,PG,PG13,R,NC17,Unrated)

  if (rated == "G") {
    $(".rating").attr("src", `${imageBasePath}/g.png`); //Checks to see if fetched rating data equals a specific rating, then changes the rating image
  } else if (rated == "PG") {
    $("rating").attr("src", `${imageBasePath}/pg.png`);
  } else if (rated == "PG-13") {
    $(".rating").attr("src", `${imageBasePath}/pg13.png`);
  } else if (rated == "R") {
    $(".rating").attr("src", `${imageBasePath}/r.png`);
  } else if (rated == "NC-17") {
    $(".rating").attr("src", `${imageBasePath}/nc17.png`);
  } else {
    $(".rating").attr("src", `${imageBasePath}/unrated.png`);
  }
}

function getRatings(ratingsList) {
  //Method to display all of the ratings from critics
  var totalRatings = "";

  ratingsList.forEach(function (rating) {
    //Goes through the list of ratings and displays them in a proper format
    totalRatings += rating.Source + ": " + rating.Value + "<br>";
  });

  document.getElementById("ratings").innerHTML = totalRatings; //Changes the text of the ratings p class
}

/* Javascript/JQuery for the Reviews Page (Ran through AirTable API) */

function getAirtable(data) {
  //Method to fetch the data from AirTable API
  var Airtable = require("airtable");

  console.log(data);
  var base = new Airtable({ apiKey: "keyjvAwclGLGnk0s2" }).base(
    //read-only api key
    "appXey3y52iS1mtlk"
  );

  base("Movies")
    .select({
      // Selecting the first 3 records in Main View:
      maxRecords: 10,
      view: "Main View",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
          //Goes through the Airtable database. If movie titles match, fetch the information for that movie
          if (record.fields.Name == data) {
            $(".title").text(record.fields.Name);
            $(".reviewPoster").attr("src", record.fields.Photos[0].url); //Changes the placeholder poster to the clicked movie's poster
            $("#listTwo").css("opacity", "100%"); //Reveals hidden movie poster
            $(".rating").text(
              "Rating: " + record.fields["Personal Rating"] + "/5"
            );
            $(".review").text(
              "Movie Review: " + record.fields["Personal Notes"]
            );
            getGenres(record.fields.Genre); //Calls method to display the genres of the movie
          }
        });
      },
      function done(err) {
        // This happens if the request fails
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

function getGenres(data) {
  //Method to fetch genres of selected movie from the database
  var string = "Genres: ";

  if (data.length == 1) {
    //Case if movie has only one genre
    string = "Genre: ";
    string += data[0];
  } else {
    for (i = 0; i < data.length; i++) {
      //If movie has multiple genres, display all of them, separated by a comma
      if (i == data.length - 1) {
        //Case to prevent a leftover comma at the end of the genre list
        string += data[i];
      } else {
        string += data[i] + ", ";
      }
    }
  }
  $(".genre").text(string); //Writes out the list of genres on the review page
}
