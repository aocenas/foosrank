var queue = require('queue-async');
var scraper = require('./lib/scraper.js');
var Store = require('./lib/store.js');

var store;

var q1 = queue();
var q2 = queue();

q1.defer(scraper.scrape);
q1.defer(function (cb) { 
  store = new Store(null, null, 'foosrank', cb)
});

q1.await(function (err, data) {
  console.log('in the callback');
  if (err) console.log('err in cb: ' + err);
  else {
    console.log(data);
    
    data.players.forEach(function (player) {
      q2.defer(function (cb) {
        store.save(player, 'players', cb);
      });
    });

    q2.await(function (err) {
      console.log('all safe and cozy');
    });

  }
});
