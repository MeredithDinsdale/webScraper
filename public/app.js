$(document).ready(function() {

// Grabbing the scraped data as json (parks and articles)
$.getJSON("/parks_or", function(data) {
    for (var i = 0; i < data.length; i++) {
      $("#parks_or").append("<p data-id='" + data[i]._id + "'>" + data[i].park + "<br /></p>");
    }
  });

$.getJSON("/parks_wa", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#parks_wa").append("<p data-id='" + data[i]._id + "'>" + data[i].park + "<br /></p>");
  }
});

$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    let row = $('<div>').attr('class', 'row my-3');
    let newsHeadline = $('<div>').attr('data-id', data[i]._id)
                                 .html(`<a href="${data[i].link}"><h5> ${data[i].Article}</h5></a><p>${data[i].excerpt}<br />${data[i].date}</p><a href="#comments_top" class="button waves-effect waves-light btn-small" data-id="${data[i]._id}">Comment</a><br>`);
    let newsComments = $('<div>').attr('data-id', data[i]._id)
                                 .html(`<h5 class="gray" id="coments_showhide">Comments<b /></h5><p> ${data[i].note} </p>`);
    let divider = $('<div>').attr('class', 'divider');
    $(row).append(newsHeadline, newsComments, divider);
    $("#news").append(row);
  }
});

//Updating the Scraped News `'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`' `'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'

 $(document).on('click', '#scrape_new', scrapeNews());
   
// Leaving comments on articles `'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'
$(document).on("click", ".button", function() {
  // console.log('button clicked');
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the button
  var thisId = $(this).attr("data-id");
  console.log("article ID is... " + thisId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h5>You are commenting on: <i>" + data.Article + "</i></h5>");
      $("#notes").append("<input id='userinput' name='user' placeholder='Username' >")
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' placeholder='Comment Title'>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Leave your comment here'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<a href='#top' class='pt-3 waves-effect waves-light btn-small' data-id='" + data._id + "' id='savenote'>Save Comment</a>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
        $("#userinput").val(data.note.user)
      }
    });
});
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    M.toast({html: 'Thanks for commenting!'});
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val(),
        user: $("#userinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
}); 