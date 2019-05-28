// Exporting an object containing all of our models
const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

//Create a schema for the news
var orSchema = new Schema({

  park: {
    type: String,
    required: true
  },
  state: {
    type: String
  }
});

//Use mongoose's model method to create model from the above schema
const or = mongoose.model("or", orSchema);

// Export the news model
module.exports = or;

