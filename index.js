// START HEROKU
"use strict";
var express = require("express"),
  app = express(),
  config_t = require("./pwd.js"),
  machine_learning = require("./machine_learning/compute.js"),
  Q = require('q'),
  bodyParser = require('body-parser'),
  Twit = require('twit'),
  colors = require('colors'),
  favicon = require('serve-favicon'),
  helmet = require('helmet'),
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
// Use helmet to secure Express headers
app.use(helmet.xframe());
app.use(helmet.xssFilter());
app.use(helmet.nosniff());
app.use(helmet.ienoopen());
app.disable('x-powered-by');
app.use(bodyParser.json());
//app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static(__dirname + "/public"));

app.get("/search/:id", function(req, res) {
  if (!req.params)
    res.status(400).json({
      "message": "Missing id /:id"
    });
  else
    T.get('users/show', {
      screen_name: req.params.id,
      count: 3200
    }, function(err, user) {
      if (!user)
        res.status(400).json({
          "message": "not found"
        });
      else
        res.status(200).json(user);
    });
});

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
      // Metrics
      var metrics = (function() {
          var totalRetweet = 0,
            tweetZeroRT = 0,
            totalFav = 0,
            tweetZeroFAV = 0;

          data[0].forEach(function(tweet, index) {
            if (!tweet.retweeted_status) {
              totalFav += tweet.favorite_count;
              totalRetweet += tweet.retweet_count;
            }
            if (tweet.favorite_count == 0)
              tweetZeroFAV += 1;
            if (tweet.retweet_count == 0)
              tweetZeroRT += 1;
          });
          return {
            totalRetweet: totalRetweet,
            totalFav: totalFav,
            tweetZeroRT: tweetZeroRT,
            tweetZeroFAV: tweetZeroFAV,
            averageRT: (totalRetweet / data[0].length),
            averageFAV: (totalFav / data[0].length)
          };
        })(),
        user = {
          id: data[1].id,
          name: data[1].name,
          screen_name: data[1].screen_name,
          followers_count: data[1].followers_count,
          friends_count: data[1].friends_count,
          favourites_count: data[1].favourites_count,
          statuses_count: data[1].statuses_count,
          profile_image_url: data[1].profile_image_url,
          metrics: metrics
        },
        tweets = data[0].filter(function(obj){
          return obj;
        }).map(function(obj) {
          var time = new Date(obj.created_at);
          var rObj = {
            id: obj.id,
            created_at: obj.created_at,
            time: time.getHours() + ":" + time.getMinutes(),
            hour: time.getHours(),
            min: time.getMinutes() * (0.6),
            retweet_count: obj.retweet_count,
            favorite_count: obj.favorite_count,
            favorited: obj.favorited,
            retweeted: obj.retweeted,
            // Manque des replies
            engagement: (obj.favorite_count + obj.retweet_count) / obj.user.followers_count
          };
          return rObj;
        }).filter(function(obj) {
          return obj;
        });
      //console.log(machine_learning.compute(tweets));
      res.json({
        "user": user,
        "tweets": tweets
      });
    });
});

app.listen(port);
console.log("running on localhost:".underline.red + port);
