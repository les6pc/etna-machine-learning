### Routes:
```
POST /user

{
  screen_name: 'value',  Without the '@'
}

```

USER
------------------
id
name
screen_name
followers_count
friends_count
favourites_count
statuses_count
profile_image_url

TWEET
-----------------
id
created_at
retweet_count
favorite_count
favorited
retweeted
engagement = (fav + rt + replies) / followers
// Pour les replies : boucler sur in_reply_to_status_id
// Qualifier la valeur ?

METRICS
-----------------
nb total RT
nb total fav
nb tweet avec 0 rt
nb tweet avec 0 fav
average RT
average FAV


Split la journée en 2 : une heure matinée et une heure soir
