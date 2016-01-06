// START HEROKU
var express = require("express"),
  app = express(),
  config_t = require("./pwd.js"),
  Q = require('q'),
  bodyParser = require('body-parser'),
  Twit = require('twit'),
  port = process.env.PORT || 5000;
// Variables de ftp env utilisées

var config = {
    me: 'DylanGDFR', // Le compte a rt
    myList: 'dev', // La liste des mots interessants
    regexFilter: '', // Le pattern
    regexReject: '^@', // et on rejette tous les tweets avec ce pattern

    keys: {
      consumer_key: config_t.TWITTER_CONSUMER_KEY,
      consumer_secret: config_t.TWITTER_CONSUMER_SECRET,
      access_token_key: config_t.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: config_t.TWITTER_ACCESS_TOKEN_SECRET
    },
  },
  T = new Twit({
    consumer_key: config_t.TWITTER_CONSUMER_KEY,
    consumer_secret: config_t.TWITTER_CONSUMER_SECRET,
    access_token: config_t.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: config_t.TWITTER_ACCESS_TOKEN_SECRET
  }),
  options = {
    screen_name: 'EarvinKayonga',
    count: '3200'
  };

//Promise
var TwitGet = function(link, options, callback) {
  var deferred = Q.defer();
  T.get(link, options, function(err, data) {
    if (err)
      deferred.reject(err);
    else
      deferred.resolve(data);
  });
  return deferred.promise;
};

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.post("/user", function(req, res) {
  req.body.count = '3200';
  if (!req.body || !req.body.screen_name)
    res.status(400).json({
      "message": "Missing Screen name"
    });
  else
    Q.all([
      TwitGet('statuses/user_timeline', req.body),
      TwitGet('users/show', req.body)
    ])
    .then(function(data) {
      var tweets = data[0],
        user = {
          id: data[1].id,
          name: data[1].name,
          screen_name: data[1].screen_name,
          followers_count: data[1].followers_count,
          friends_count: data[1].friends_count,
          favourites_count: data[1].favourites_count,
          statuses_count: data[1].statuses_count,
          profile_image_url: data[1].profile_image_url
        };
      res.json({
        "user": user,
        "tweets": tweets
      });
    });
});


/**
 * Get les 200 derniers tweets du compte passé en option
 **/

/*T.get('statuses/user_timeline', options, function(err, data) {
  /*  console.log('tweets : ');
    console.log(data);
  for (var i = 0; i < data.length; i++) {
    console.log(i + ' ' + data[i].text);
  });
});*/

/*
T.get('users/show', options, function(err, data) {
 ///console.log(data);
})*/


app.listen(port);
console.log("running on localhost:" + port);
