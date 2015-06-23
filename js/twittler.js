/**
* Twittler.js (June 2015)
* Written by Dave Schumaker for Hack Reactor 31 pre-coursework
*
**/


/**
* This section generates an array of random colors that get assigned to all of our
* registered Twittler users. This is purely for stylistic reasons and to make
* each user appear to be unique.
**/

var visitor = "MyUser"; // Global value for username of the visitor.

var userColors = {}; // Object to store randomly picked user colors for the avatars.

var getAvatarColor = function(username, action) {
  var colorArray = ["#A6DDFF", "#FF5471", "#62FF54", "#3DF5E2", "#FF9854", 
  "#FFFC54", "#B254FF", "#548AFF", "#FFC5A8", "#B9EDE8", "#5C75E6"];

  var myColor = colorArray[Math.floor(Math.random() * (colorArray.length - 1))];

  var userFound = false;
  $.each(userColors, function(index, value) {
    if (index == username) { userFound = true};
  });

  if (userFound === false) {
    userColors[username] = myColor; 
  }

  return userColors[username];

}

/**
* Here is where all the Twittler magic is about to happen.
**/

$(document).ready(function(){
  // On initial load, hide the reset link that's displayed when we filter links.
  $('#reset').hide();
  $('#userInfo').hide();
  $('#tweetstatus').show();

  // Choose whether we're filtering by a specific username or showing all tweets.
  var filterMode = "_all"; 

  // Initially load the Twitter stream generated from data_generator.js
  // and count number of items in the array.
  var index = streams.home.length - 1;

  /* Keep track of where our old initial index was 
  // so that we can display new tweets that are pushed to the array 
  // and stop when we get to tweets that have already been displayed. */
  var oldindex = index;

  // Grab all tweets from stream array.
  var getTweets = function (userTweets, index, action) {
    // Depending on what mode the user has clicked will depend on where the stream will come from (either streams.home or streams.users[username])
    if (filterMode == "_all") {
      // Grab tweets from public stream.
      var tweet = streams.home[index];           
    } else {
      // Only grab tweets from a particular user that we set in the "filterMode" variable
      var tweet = streams.users[filterMode][index];
    }

    // Assign color if needed.
    var bgColor = getAvatarColor(tweet.user);

    // Detect if this is an update and apply proper classes (e.g., to highlight new tweets)
    var classes;
    if (action == "update") {
      classes = "tweet highlight-new";       
    } else {
      classes = "tweet";         
    }

    // Build a div containing all the information for this particular tweet.
    var $tweet = $('<div class="' + classes + '" data-username="' + tweet.user +'"></div>');
    $tweet.html('<a href="#" class="imglink"><img src="images/avatar_125px.png" class="avatar" style="background-color: ' + bgColor + '"></a><span class="username"><a href="#">@' + tweet.user + '</a></span><br/><span class="tweet-text">' + tweet.message + '</span><br><span class="tweet-time" data-createdAt="' + tweet.created_at + '">' + tweet.created_at + '</span>');
    $tweet.prependTo($(".stream"));         

    if (action == "update") {
      $('.tweet').first('').slideDown(function () {
        //$(this).closest('.tweet').animate({"background-color" : "#fff"}, 200);
      });
    };
    
  };

  while(index >= 0){
    getTweets(null, index);
    index -= 1;
  }

  // Function to get and update all times using momentjs.
  var updateTime = function() {
    $('.tweet-time').each(function() {
      var getTime = $(this).attr('data-createdAt');
      $(this).text(moment(getTime).fromNow());
    });
  }

  // Call this function with an interval to get new tweets that have been pushed to the stream.
  var updateStream = function() {
    if (filterMode == "_all") {
      index = streams.home.length - 1;
    } else {
      index = streams.users[filterMode].length - 1;

      // Total tweets from this user:
      var totalTweets = streams.users[filterMode].length;
      $('#totalTweets').text('Total tweets: ' + totalTweets);
      //console.log('User tweets: ' + totalTweets);
    }
    
    var newIndex = index + 1;
    while (index >= oldindex) {
      getTweets(null, index, "update");
      index -= 1;
    };
    oldindex = newIndex;
  };

  //$("abbr.timeago").timeago();

  // Update the stream at a set interval and append new tweets to the page.
  setInterval(function() {
    updateStream(); // Update stream.
    updateTime(); // Update time after stream is updated.
    return;
  }, 100);

  // Filter the stream to only show tweets from a specific username.
  $('.stream').on('click', 'a', function() {
    // Store the username that we want to filter.
    var filtername = $(this).closest('.tweet').data('username');

    // Clear out stream so we can only display tweets from specific user.
    $('.stream').html('');

    // Show user specific information.
    var bgColor = getAvatarColor(filtername);
    $('#bigavatar').css('backgroundColor', bgColor);
    $('#usernameInfo').text(filtername);
    $('#userInfo').show();
    $('#tweetstatus').hide();

    $('.stream').addClass('streamPlusInfo');

    // Show our nav
    $('#reset').show();

    // Display all tweets from a specific user.
    // TODO: Refactor our initial getTweet function to utilize this code as well.
    var userTweets = streams.users[filtername];
    var countTweets = userTweets.length - 1;

    //while(countTweets >= 0){
    for (var i = 0; i <= countTweets; i++) {
      filterMode = filtername;
      getTweets(userTweets, i);
    }          

  });

  // Show all tweets by default.
  // Useful for both our nav reset and clicking on the logo.
  var showAll = function() {
    filterMode = "_all";
    index = streams.home.length - 1;
    oldindex = index;
    while(index >= 0){
      getTweets(null, index);
      index -= 1;
    }
    $('#reset').hide();
    $('#userInfo').hide();
    $('#tweetstatus').show();
    $('.stream').removeClass('streamPlusInfo');
  };

  // Do some magic when the user submits a new tweet.
  $('#submittweet').on('click', function() {
    //alert($('#usertwit').val());
    var message = $('#usertwit').val();

    // Check if username exists. If not, add it.
    if (!streams.users[visitor]) {
      streams.users[visitor] = [];
    }

    writeTweet(message);
    $('#usertwit').val(""); // Reset the textarea.
  })

  // Reset button to show all tweets again.
  $('nav').on('click', '#reset', function () {
    showAll();
  });

  // Clicking on the logo shows all tweets without reloading the page.
  $('#logo').on('click', function() {
    showAll();
  });

  // Highlight tweet when we mouse over it.
  $('.stream').on('mouseenter', '.tweet', function() {
    $(this).toggleClass('highlight');
  })

  // Un-highlight tweet when we move mouse away
  $('.stream').on('mouseleave', '.tweet', function() {
    $(this).toggleClass('highlight');
  })        

});