// Exporting an object containing all of our models
const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

//Create a schema for the news
var articleSchema = new Schema({

  Article: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  excerpt: {
    type: String
  },
  date: {
    type: String
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

//Use mongoose's model method to create model from the above schema
const Article = mongoose.model("Article", articleSchema);

// Export the news model
module.exports = Article;

