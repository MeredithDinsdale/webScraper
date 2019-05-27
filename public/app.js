// Grab the articles as a json
$.getJSON("/parks_or", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#parks_or").append("<p data-id='" + data[i]._id + "'>" + data[i].park + "<br /></p>");
    }
  });

  $.getJSON("/parks_wa", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#parks_wa").append("<p data-id='" + data[i]._id + "'>" + data[i].park + "<br /></p>");
    }
  });

  $.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      let newsHeadline = $('<div>').attr('data-id', data[i]._id).html(`<a href="${data[i].link}"><h5> ${data[i].Article}</h5></a><p>${data[i].excerpt}<br />${data[i].date}</p><a href="#notes" class="button waves-effect waves-light btn-small" data-id="${data[i]._id}">Comment</a><br>`);
      $("#news").append(newsHeadline);
    }
  });
  
  
  // Whenever someone clicks a button
  $(document).on("click", ".button", function() {
    console.log('button clicked');
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the button
    var thisId = $(this).attr("data-id");
    console.log(thisId);
  
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
        $("#notes").append("<a class='pt-3 waves-effect waves-light btn-small' data-id='" + data._id + "' id='savenote'>Save Comment</a>");
  
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
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val(),
        commentUser: $("#userinput").val()
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
  