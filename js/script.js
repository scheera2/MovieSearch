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
      `https://www.omdbapi.com/?apikey=1593aaef&plot=full&t=${text}`
    );

    // This happens if the request is sucesssful
    console.log(movies);

    var { Poster, Title, Year, Plot, Genre, Rated, Ratings } = movies;

    $(".poster").attr("src", Poster);
    $(".title").text(Title);
    $(".year").text(Year);
    $(".summary").text(Plot);
    $(".genre").text(Genre);

    getRated(Rated);
    getRatings(Ratings);
  } catch (err) {
    // This happens if the request fails
    console.error(err);
  }
}

function getRated(rated) {
  var imageBasePath = `/images/ratingicons`;

  if (rated == "G") {
    $(".rating").attr("src", `${imageBasePath}/g.png`);
  } else if (rated == "PG") {
    $("rating").attr("src", `${imageBasePath}/pg.png`);
  } else if (rated == "PG-13") {
    $(".rating").attr("src", `${imageBasePath}/pg13.png`);
  } else if (rated == "R") {
    $(".rating").attr("src", `${imageBasePath}/r.png`);
  } else {
    $(".rating").attr("src", `${imageBasePath}/unrated.png`);
  }
}

function getRatings(ratingsList) {
  var totalRatings = "";

  ratingsList.forEach(function (rating) {
    totalRatings += rating.Source + ": " + rating.Value + "<br>";
  });

  document.getElementById("ratings").innerHTML = totalRatings;
}

function getAirtable(data) {
  var Airtable = require("airtable");

  console.log(data);
  var base = new Airtable({ apiKey: "keyjvAwclGLGnk0s2" }).base(
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
          if (record.fields.Name == data) {
            $(".title").text(record.fields.Name);
            $(".reviewPoster").attr("src", record.fields.Photos[0].url);
            $(".rating").text(
              "Rating: " + record.fields["Personal Rating"] + "/5"
            );
            $(".review").text(
              "Movie Review: " + record.fields["Personal Notes"]
            );
            getGenres(record.fields.Genre);
          }
        });
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

function getGenres(data) {
  var string = "Genres: ";

  if (data.length == 1) {
    string = "Genre: ";
    string += data[0];
  } else {
    for (i = 0; i < data.length; i++) {
      if (i == data.length - 1) {
        string += data[i];
      } else {
        string += data[i] + ", ";
      }
    }
  }
  $(".genre").text(string);
}
