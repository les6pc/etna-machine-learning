// START HEROKU
var express = require("express");
var app = express();
var config_t = require("./pwd.js");
app.get('/', function(req, res){ res.send('Récupération des tweets.'); });
app.listen(process.env.PORT || 5000);
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

// On recupere tous les comptes ecoutés et on les passe à la callback
function getListMembers(callback) {
    var memberIDs = [];

    tu.listMembers({owner_screen_name: config.me,
        slug: config.myList
    },
    function(error, data){
        if (!error) {
            for (var i=0; i < data.users.length; i++) {
                memberIDs.push(data.users[i].id_str);
            }

            // On appelle la callback pour ecoutés les ids des membres en params
            callback(memberIDs);
        } else {
            console.log(error);
            console.log(data);
        }
    });
}

// Erreur à gérér lorsque l'on rt quelque chose
function onReTweet(err) {
    if(err) {
        console.error("retweeting raté :(");
        console.error(err);
    }
}

// Ce que nous voulons faire lorsque l'on récupère un tweet
function onTweet(tweet) {
    // On rejette le tweet si :
    //  1. Si le tweet reprend un flag
    //  2. Si la regex des chars interdites correspond
    //  3. Si la regex des chars devant correspondre ne correspond pas
    var regexReject = new RegExp(config.regexReject, 'i');
    var regexFilter = new RegExp(config.regexFilter, 'i');
    if (tweet.retweeted) {
        return null;
    }
	
	else if (tweet.user.lang != 'fr') {
		console.log('raté user lang : ' + tweet.user.lang);
		console.log('raté user id : ' + tweet.user.id);
		console.log('raté user nick : ' + tweet.user.screen_name);
        return null;
    }
	
	/* Je peux filtre sur la langue */
	
	/*if(tweet.retweeted_status.lang != 'fr'){
		console.log('rt lang status : ' + tweet.retweeted_status.lang);
		return;
	}*/
		
    else if (config.regexReject !== '' && regexReject.test(tweet.text)) {
        return null;
    }
    else {
        console.log(tweet);
		console.log('langue du tweet : ' + tweet.user.lang);
		console.log('user id : ' + tweet.user.id);
		console.log('user nick : ' + tweet.user.screen_name);
        tu.retweet({
            id: tweet.id_str
        }, onReTweet);
    }
}

// Fonction pour ecouter twitter en live et retweet à la demande dès concordance
function listen(listMembers) {
    tu.filter({
        follow: listMembers
    }, function(stream) {
        console.log("En écoute");
        stream.on('tweet', onTweet);
    });
}

// Appel de l'app.
// Utilisation du tuiter node module pour obtenir l'accès à twitter.
var tu = require('tuiter')(config.keys);

// Lance l'application. La callback recupere la liste des membres
// sur l'écoute avant de traiter via l'api.
//getListMembers(listen);

/**
* Définie les options pour la seconde app
* Ici on utilise twit pour faire les appels
*/

var Twit = require('twit');

var T = new Twit({
	consumer_key: '0BEoRbxt3UYV808T6cHZCmO2i',
	consumer_secret: 'S2eeRHrlweoBzhilTQm8FPg9RVVSyxzN599CtW9QtvKqUgmtpF',
	access_token: '423806753-JtJ2O1Pa4t3CIdAIiCqWOtFbycQHmR6cXVDZSIHb',
	access_token_secret: 'RY9o3wL84wuTwT8c8TlU9xAlVej6AM5FmNjf8JqIHaUl0'
})

var options = { screen_name: 'DylanGDFR', count: '3200' };

/**
* Get les 200 derniers tweets du compte passé en option
**/
T.get('statuses/user_timeline', options , function(err, data) {
  for (var i = 0; i < data.length ; i++) {
    console.log(i + ' ' + data[i].text);
  }
})

/**
* Get les infos du compte passé en option
**/
T.get('users/show', options , function(err, data) {
    console.log(data);
})
