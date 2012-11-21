var util = require('util');
var fs = require('fs');
var path = require('path');
var http = require('http');

var express = require('express');

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

app.get('/data.json', function (req, res) {
  fs.readFile('data.json', 'utf8', function (err, data) {
    if (err) {
      res.send(500, {error: err});
    } else {
      res.send(data);
    }
  });
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
