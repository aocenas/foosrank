var util = require('util');
var fs = require('fs');

var express = require('express');
var app = express();
var staticDir = __dirname;

app.configure(function(){
  app.use(express.static(staticDir));
});

app.get('/data', function (req, res) {
  fs.readFile('data.json', 'utf8', function (err, data) {
    if (err) {
      res.send(500, {error: err});
    } else {
      res.send(data);
    }
  });
})

app.listen(8081);
