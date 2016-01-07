var ml = require('machine_learning');
var limdu = require('limdu');
var Classifier = new limdu.classifiers.NeuralNetwork();

module.exports = {
  compute: function(tweets) {
    var average = 0.4,
      train = tweets.map(function(obj) {
        var rObj = {
          input: {
            engagement: obj.engagement,
            time: new Date(obj.created_at).getTime()
          },
          output: (obj.engagement >= average) ? 1 : 0
        }
        return rObj;
      });
    Classifier.trainBatch(train);
    var Res = [],
      index = 0;

    Res[index] = Classifier.classify({
      engagement: 1,
      time: new Date().getTime()
    })

    return {
      matin: "08:34",
      soir: "18:30"
    };
  }
}
