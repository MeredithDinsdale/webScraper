const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const PORT = process.env.PORT || 3030;

//Initialize express
const app = express();

//Logger Middleware logging in dev format to console
app.use(logger("dev"));

//Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/webScraper_db";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Start the server
app.listen(PORT, () => {
    console.log("Saweeet! App is running on http://localhost:" + PORT)
});

//==========================================================================================================

// Routes
// OREGON PARKS DIRECTORY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// A GET route for scraping the OR parks website
app.get("/scrape_or", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://oregonstateparks.org/index.cfm?do=visit.dsp_find").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);
     // Now, we grab every tr.a-cursor tag, and do the following:
     $("tr.a-cursor").each(function(i, element) {
       // Save an empty result object
       let result = {};
       // Add the text of every title, and save them as properties of the result object
       result.park = $(this)
         .children("td")
         .children("a")
         .text().trim().split("\n\t\t\t\t\t\t\t\t\t\t").toString()
       console.log(result.park);
       result.state = "Oregon";
       
     //Create a new park using the `result` object built from scraping
     db.Parks_or.updateOne(result, result, {upsert: true})
        .then(function(dbParks_or) {
          // View the added result in the console
          console.log(dbParks_or);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
     });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// WASHINGTON PARKS DIRECTORY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// A GET route for scraping the WA parks website
app.get("/scrape_wa", function(req, res) {
// First, we grab the body of the html with axios
axios.get("https://parks.state.wa.us/281/Find-a-Park").then(function(response) {
  // Then, we load that into cheerio and save it to $ for a shorthand selector
  const $ = cheerio.load(response.data);
  
   // Now, we grab every li.megaMenuItem tag, and do the following:
   $("li.megaMenuItem").each(function(i, element) {
     // Save an empty result object
     let result = {};
     // Add the text of every name, and save them as properties of the result object
      result.park = $(this)
        .children("a")
        .text()
      console.log(result.park);
      result.state = "Washington";

   //Create a new Article using the `result` object built from scraping
   db.Parks_wa.updateOne(result, result, {upsert: true})
       .then(function(dbParks_wa) {
         // View the added result in the console
         console.log(dbParks_wa);
       })
       .catch(function(err) {
         // If an error occurred, log it
         console.log(err);
       });
   });

  // Send a message to the client
  res.send("Scrape Complete");
});
});

// PNW Outdoor News~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// A GET route for scraping the nwtravelmag website
app.get("/scrape_news", function(req, res) {
// First, we grab the body of the html with axios
axios.get("http://nwtravelmag.com").then(function(response) {
  // Then, we load that into cheerio and save it to $ for a shorthand selector
  const $ = cheerio.load(response.data);

   $("div.td_module_2").each(function(i, element) {
     // Save an empty result object
     let result = {};
     // Add the text and href of every link, and save them as properties of the result object
      result.Article = $(this)
        .children("h3.entry-title")
        .text()
      console.log(result.Article);

      result.link = $(this)
        .children("h3.entry-title")
        .children("a")
        .attr("href")
      console.log(result.link);

      result.excerpt = $(this)
        .children("div.td-excerpt")
        .text().trim().split("\n").toString()
      console.log(result.excerpt);

      result.date = $(this)
        .children("div.td-module-meta-info")
        .children("span.td-post-date")
        .children("time.entry-date")
        .text()
      console.log(result.date);

   //Create a new Article using the `result` object built from scraping
   db.Article.updateOne(result, result, {upsert: true})
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
   });

  // Send a message to the client
  res.send("Scrape Complete");
});
});
// Route for grabbing Oregon Parks
app.get("/parks_or", function(req, res) {
  // Grab every document in the Parks_or collection
  db.Parks_or.find({})
    .sort({ park: 1 })
    .then(function(dbParks_or) {
      // If we were able to successfully find parks_or, send them back to the client
      res.json(dbParks_or);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing Washington Parks
app.get("/parks_wa", function(req, res) {
  db.Parks_wa.find({})
    .sort({ park: 1 })
    .then(function(dbParks_wa) {
      res.json(dbParks_wa);
    })
    .catch(function(err) {
      res.json(err);
    });
});

 // Route for grabbing News Articles
 app.get("/articles", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.find({})
    .sort({ date: -1 })
    .populate("Note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("Note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it bacSk to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Note.findOne({ _id: req.params.id })
    
    .then(function(dbNote) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbNote);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});