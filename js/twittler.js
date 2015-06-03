$(document).ready(function(){
  // On initial load, hide the reset link that's displayed when we filter links.
  $('#reset').hide();

  var filterMode = "_all"; // Choose whether we're filtering by a specific username or showing all tweets.

  // Initially load the Twitter stream
  var index = streams.home.length - 1;

  // Keep track of where our old initial index was so that we can display new tweets that are pushed to the array and stop when we get to tweets that have already been displayed.
  var oldindex = index;

  // Get tweets from our array.
  var getTweets = function (userTweets, index, action) {
    // Depending on what mode the user has clicked will depend on where the stream will come from (either streams.home or streams.users[username])
    if (filterMode == "_all") {
      var tweet = streams.home[index];           
    } else {
      var tweet = streams.users[filterMode][index];
    }

    // Detect if this is an update and apply proper classes
    var classes;
    if (action == "update") {
      classes = "tweet highlight-new";       
    } else {
      classes = "tweet";         
    }


    var $tweet = $('<div class="' + classes + '" data-username="' + tweet.user +'"></div>');
    //$tweet.text('@' + tweet.user + ': ' + tweet.message);
    $tweet.html('<span class="username"><a href="#">@' + tweet.user + '</a></span><br/><span class="tweet-text">' + tweet.message + '</span><br><span class="tweet-time"><abbr class="timeago" title="' + tweet.created_at.toISOString() + '">' + tweet.created_at + '</abbr></span>');
    $tweet.prependTo($("#stream"));         

    if (action == "update") {
      $('.tweet').first('').slideDown(function () {
        //$(this).closest('.tweet').animate({"background-color" : "#fff"}, 200);
      });
    }
       
  }

  while(index >= 0){
    getTweets(null, index);
    index -= 1;
  }

  // Call this function with an interval to get new tweets that have been pushed to the stream.
  var updateStream = function() {
    if (filterMode == "_all") {
      index = streams.home.length - 1;
    } else {
      index = streams.users[filterMode].length - 1;
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
    //$("abbr.timeago").timeago();
    updateStream();
    return;
  }, 100);

  // Filter the stream to only show tweets from a specific username.
  $('#stream').on('click', 'a', function() {
    // Store the username that we want to filter.
    var filtername = $(this).closest('.tweet').data('username');

    // Clear out stream so we can only display tweets from specific user.
    $('#stream').html('');

    // Show our nav
    $('#reset').show();

    // Display all tweets from user.
    // TODO: Refactor our initial getTweet function to utilize this code as well.
    var userTweets = streams.users[filtername];
    var countTweets = userTweets.length - 1;

    console.log(userTweets);
    console.log(countTweets);

    //while(countTweets >= 0){
    for (var i = 0; i <= countTweets; i++) {
      filterMode = filtername;
      getTweets(userTweets, i);
    }          

  });

  // Reset button to show all tweets again.
  $('nav').on('click', '#reset', function () {
    filterMode = "_all";
    index = streams.home.length - 1;
    oldindex = index;
    console.log(index);
    while(index >= 0){
      getTweets(null, index);
      index -= 1;
    }
    $('#reset').hide();
  });

  // Highlight tweet when we mouse over it.
  $('#stream').on('mouseenter', '.tweet', function() {
    $(this).toggleClass('highlight');
  })

  // Un-highlight tweet when we move mouse away
  $('#stream').on('mouseleave', '.tweet', function() {
    $(this).toggleClass('highlight');
  })        

});