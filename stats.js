module.exports = {
  quartile: function(el, array) {
    var fol = el.followers_count || el.followers,
      rt = el.retweet_count || el.retweets,
      fav = el.followers_count || el.favs,
      eng = (rt + fav) / fol;
    if (eng)
      return 0;
    else
      return 1;
  }
}
