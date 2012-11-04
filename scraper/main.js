var fs = require('fs');

var request = require('request');
var jsdom = require('jsdom');
var iconv = require('iconv-lite');

var rankOpen = 
  'http://www.foosball.sk/sk/zebricky/?action=view&rank_name_id=513';

var data = {};
data.players = [];
data.indexes = Object.create(null);

var callbacks = 0;

request(
  { 
    uri: rankOpen,
    headers: {
      'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3'
    }
  },
  wrap(mapPlayers)
);

function wrap () {
  var fn = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);

  return function (err, response, body) {
    if (err && response.statusCode !== 200) {
      console.log('Error when contacting foosball.sk')
    }

    console.log(response.headers);

    // body should be the first argument then the others
    args.unshift(body);
    fn.apply(null, args);
  }
}

function sanitize (html) {
  html = html.replace(/<td(.*)th>/gi, /<td$1td>/); 
  return html;
}

function mapPlayers(body) {
  
  var decoded = iconv.decode(body, 'windows-1250');
  fs.writeFileSync('index.html', decoded);
  // sanitize the <td></th> malformed combinations WAT?
  decoded = sanitize(decoded);

  jsdom.env(
    {
      html: decoded,
      scripts: [
        '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
      ]
    }, 
    function (err, window) {
      var $ = window.jQuery;

      // jQuery is now loaded on the jsdom window created from 'agent.body'
      
      var rows = $('div.content table tr');
      callbacks = rows.length - 1;
      rows.each(function (index, element) { 
        if (index > 0) {
          console.log(index + ' ' + $($(element).children().get(1)).text().trim());
          var row = $(element).find('td');
          
          var rank = +$(row.get(0)).text().trim();
          var name = $(row.get(1)).text().trim();

          var link = $(row.get(1)).find('a').attr('href');
          console.log(link);
          
          request(
            link,
            wrap(mapResults, link)
          );

          var tournaments = +$(row.get(3)).text().trim();
          var points = +$(row.get(8)).text().trim();
          
          var player = {
            rank: rank,
            name: name,
            tournaments: tournaments,
            points: points
          };

          data.indexes[link] = data.players.push(player) - 1;
        }
      });
    }
  );
}

function mapResults (body, link) {
  jsdom.env({
    html: sanitize(body),
    scripts: [
      '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js'
    ]
  },
  function (err, window) {
    var $ = window.jQuery;
    var tournaments = [];
    $('div.content table tr').each(function (index, element) {
      if (index > 0 ) {
        var row = $(element).find('td');
        var tournament = {};
        tournament.name = $(row.get(0)).find('a').text();
        tournament.discipline = $(row.get(0)).find('span').text();
        tournament.date = Date.parse($(row.get(1)).text());
        tournament.place = +$(row.get(2)).text();
        tournament.points = +$(row.get(3)).text();
        
        tournaments.push(tournament);
      }
    });

    data.players[data.indexes[link]].tournaments = tournaments;
    callbacks--;
    if (callbacks == 0) {
      fs.writeFileSync('data.json', JSON.stringify(data, null, '  '));
    }

  })
}


