// START HEROKU
var express = require("express"),
  app = express(),
  config_t = require("./pwd.js"),
  q = require('q'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.get('/', function(req, res) {
  res.send('Récupération des tweets.');
});
app.listen(port);
console.log("running on localhost:" + port);
// END HEROKU

// Config
//
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
};

var Twit = require('twit');

var T = new Twit({
  consumer_key: config_t.TWITTER_CONSUMER_KEY,
  consumer_secret: config_t.TWITTER_CONSUMER_SECRET,
  access_token: config_t.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: config_t.TWITTER_ACCESS_TOKEN_SECRET
})

var options = {
  screen_name: 'EarvinKayonga',
  count: '3200'
};


/**
 * Get les 200 derniers tweets du compte passé en option
 **/
T.get('statuses/user_timeline', options, function(err, data) {
  /*  console.log('tweets : ');
    console.log(data);
  for (var i = 0; i < data.length; i++) {
    console.log(i + ' ' + data[i].text);
  }*/
  console.log(data[0]);
});

/**
 * Get les infos du compte passé en option
 */
T.get('users/show', options, function(err, data) {
 ///console.log(data);
})
