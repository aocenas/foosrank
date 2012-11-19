var http = require("http");
var fs = require('fs');

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */

var options = {
  host: 'www.foosball.sk',
  path: '/sk/zebricky/?action=view&rank_name_id=513',
  method: 'GET'
};

var req = http.request(options, function(res){
  var output = '';
  console.log(options.host + ':' + res.statusCode);
  res.setEncoding('utf8');

  res.on('data', function (chunk) {
    output += chunk;
  });

  res.on('end', function() {
    fs.writeFileSync('index.oldschool.html', output);
  });
});

req.on('error', function(err) {
  //res.send('error: ' + err.message);
});

req.end();
