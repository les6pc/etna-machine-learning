// START HEROKU
"use strict";
var express = require("express"),
  app = express(),
  config_t = require("./pwd.js"),
  Q = require('q'),
  limdu = require('limdu'),
  Classifier = new limdu.classifiers.NeuralNetwork(),
  bodyParser = require('body-parser'),
  db = require('./data/db.json'),
  Twit = require('twit'),
  colors = require('colors'),
  favicon = require('serve-favicon'),
  helmet = require('helmet'),
  port = process.env.PORT || 5000;

if (!db.message)
  console.log("Launching with " + "./data/db.json".underline.green);
else
  console.log("DB not found");

var initTrain = [];
db.forEach(function(el, i){
  initTrain[i] = {
    input : el,
    output : (db) ? 1 : 0
  };
});
console.log("Finished db import".underline.green);
Classifier.trainBatch(initTrain);
console.log("Finished initial training".underline.green);

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

  var tu = require('tuiter')(config.keys);
  
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
  //req.body.count = '3200';
  if (!req.body || !req.body.screen_name || !req.body.count)
    res.status(400).json({
      "message": "Missing Screen name or countTweet!"
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

          data[0].filter(function(obj) {
            if (!obj.retweeted_status)
              return obj;
            else
              return false
          }).forEach(function(tweet, index) {
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
        tweets = data[0].filter(function(obj) {
          if (!obj.retweeted_status)
            return obj;
          else
            return false
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

      var train = tweets.map(function(obj) {
        var rObj = {
          input: {
            time: new Date(obj.created_at).getHours()
          },
          output: (obj.engagement >= 0.4) ? 1 : 0
        }
        return rObj;
      });
      console.log("Starting the second training and predicting ".underline.blue);
      Classifier.trainBatch(train);
      res.json({
        "user": user,
        "tweets": tweets,
        "results": {
          "matin" : "09:45",
          "soir" : "19:23"
        }
      });
      console.log('Finished'.underline.green);
      return res.end();
    });
});

app.get("/lists/members/:slug", function(req, res) {
  if (!req.params)
    res.status(400).json({
      "message": "Missing slug /:slug"
    });
  else
    T.get('lists/members', {
		slug: req.params.slug,
		owner_screen_name: "DylanGDFR",
		cursor: "-1"
    }, function(err, user) {
      if (!user)
        res.status(400).json({
          "message": "not found"
        });
      else
	    var members = [];
		var res = [];
		tu.listMembers({owner_screen_name: config.me,
			slug: config.myList
		},
		function(error, data){
			if (!error) {
				for (var i=0; i < data.users.length; i++) {
					res.push(
						{
							'favs':data.users[i].favourites_count,'retweets':data.users[i].status.retweet_count,'followers':data.users[i].followers_count,'geoloc':data.users[i].status.geo,'date':data.users[i].created_at
						}
					);
				}
				console.log(res);
			} else {
				console.log(error);
				console.log(data);
			}
		});
    });
});

app.listen(port);
console.log("running on localhost:".underline.red + port);

