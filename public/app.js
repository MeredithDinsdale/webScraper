$(document).ready(function() {

//When page reloads, scroll to top and display welcome modal=========================================================
  $(this).scrollTop(0);
  setTimeout(function(){ 
    $('.modal').modal({
      preventScrolling: false,
      endingTop: '20%'
    });
    $('#modal1').modal('open');
 }, 1000); 
 
//scroll to the top of the page when the logo is clicked==========================================================
 $(document).on("click", "#logo", function() {
  $('html,body').scrollTop(0);
})


// Grabbing the scraped data as json (parks and articles)==============================================================
let getData = function() {
$.getJSON("/parks_or", function(data) {
    for (var i = 0; i < data.length; i++) {
      if ($('#'+data[i]._id).length === 0) {
        $("#parks_or").append("<p data-id='" + data[i]._id + "' id='" + data[i]._id + "'>" + data[i].park + "<br /></p>");
    }
    else {
        console.log('That OR Parks data already exists on the page');
    } 
    }
  });

$.getJSON("/parks_wa", function(data) {
  for (var i = 0; i < data.length; i++) {
    if ($('#'+data[i]._id).length === 0) {
      $("#parks_wa").append("<p data-id='" + data[i]._id + "' id='" + data[i]._id + "'>" + data[i].park + "<br /></p>");
  }
  else {
      console.log('That WA Parks data already exists on the page');
  } 
  }
});

$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    if ($('#'+data[i]._id).length === 0) {
      let row = $('<div>').attr('class', 'row my-3');
      let newsHeadline = $('<div>').attr('data-id', data[i]._id)
                                   .attr('id', data[i]._id)
                                   .html(`<a href="${data[i].link}" target="_blank"><h5> ${data[i].Article}</h5></a><p>${data[i].excerpt}<br />${data[i].date}</p><a href="#comments_top" class="button waves-effect waves-light btn-small" data-id="${data[i]._id}">Comment</a><br>`);
      let newsComments = $('<div>').attr('data-id', data[i]._id)
                                   .html(`<h5 class="gray" id="coments_showhide">Comments<b /></h5><p> ${data[i].note} </p>`);
      let divider = $('<div>').attr('class', 'divider');
      $(row).append(newsHeadline, newsComments, divider);
      $("#news").append(row);
  }
  else {
      console.log('That news data already exists on the page');
  } 
  }
});
}

getData();

//Updating the Scraped Items `'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`' `'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'`'

$(document).on('click', '#scrape_new', function () {

  event.preventDefault();

  $('#loadIcon').append('<i class="fas fa-spinner fa-spin ml-1" style="font-size:24px;"></i>');
  M.toast({html: 'Scraping latest info...', displayLength: 4000, outDuration: 4000, classes: 'toast'});

  console.log('scraping data...');

  $.when(scrape_news(), scrape_or(), scrape_wa()).done(function () {  
    $('#loadIcon').empty();
    M.toast({html: 'All done!', displayLength: 2500, outDuration: 4000, classes: 'toast'});
    getData();
    $('html,body').animate({
      scrollTop: $("#top").offset().top
   });
  });

});

let scrape_news = function () {
  return $.get("/scrape_news", function (data) {
    console.log(data);
  });
}

let scrape_or = function () {
  return $.get("/scrape_or", function (data) {
    console.log(data);
  });
}

let scrape_wa = function () {
  return $.get("/scrape_wa", function (data) {
    console.log(data);
  });
}

});
   
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
      $("#notes").append("<h5 class='gray'>You are commenting on: <i>" + data.Article + "</i></h5>");
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
