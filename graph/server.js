// native packages
var util = require('util');
var fs = require('fs');
var path = require('path');
var http = require('http');

// vendor packages
var express = require('express');
var queue = require('queue-async');

// app packages
var Store = require('./lib/store.js');

// init

var state = {};
state.db = false;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8081);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

var store = new Store(null, null, 'foosrank', function (err) {
  if (err) console.log('DB has error : ' + err);
});

app.get('/api/data', function (req, res) {
  if (!store.state) {
    res.send(500, {error: 'db has error'});
  } else {
    store.findAll('players', function (err, players) {
      if (err) {
        console.log('findAll has error : ' + err);
        res.send(500, {error: err});
      } else {
        res.json({players: players});
      }
    });
  }
});

app.get('/api/data/search', function (req, res) {
  if (!store.state) {
    res.send(500, {error: 'db has error'});
  } else {
    var query = {};
    if (!isNaN(parseInt(req.query.q))){
      query.rank = parseInt(req.query.q);
    } else {
      query.name = new RegExp('.*' + req.query.q + '.*', 'i');
    }
    console.log('api/data/search : ' + util.inspect(query));
    store.searchAll('players', query, function (err, players) {
      if (err) {
        console.log('searchAll has error : ' + err);
        res.send(500, {error: err});
      } else {
        res.json({players: players});
      }
    });
  }
});


var nav = {
  home: {class: ''},
  find: {class: ''},
  stats: {class: ''},
  setActive: function (link) { 
    Object.keys(this).forEach(function (key) {
      if (this[key].class !== undefined) {
        if (key == link) {
          this[key].class = 'active'
        } else {
          this[key].class = '';
        }
      }
    }, this)
  }
};

app.get('/', function (rew, res) {
  nav.setActive('home');
  console.log(nav.home);
  res.render('index', {nav: nav});
});

app.get('/find', function (rew, res) {
  nav.setActive('find');
  res.render('find', {nav: nav});
});

app.get('/stats', function (rew, res) {
  nav.setActive('stats');
  res.render('stats', {nav: nav});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
