$(function () {

  var marginTop = 20;
  var marginBottom = 50;
  var marginLeft = 50;
  var marginRight = 10;
  var graphWidth = 640;
  var graphHeight = 360;
  var realWidth = graphWidth + marginLeft + marginRight;
  var realHeight = graphHeight + marginTop + marginBottom;
  var scaleX = Math.round((graphWidth/realWidth) * 100) / 100;
  var scaleY = Math.round((graphHeight/realHeight) * 100) / 100;

  var data;
  //scales
  var x;
  var actualY;
  var oldY;
  var actualScale = 'log';
  var lastSearched;

  var chart;
  var rulerx;
  var rulery;
  var linesHorizontal;
  var graph;

  var events = new EventEmitter();

  setStage();

  d3.json('/data.json', function (json) {
    data = json;
    events.emit('data.loaded');
    computeExtras();
    setScale();
    render();
  });
  
  function computeExtras () {
    data.extras = {};
    data.extras.maxPoints = 0;
    data.extras.minPoints = Infinity;
    data.extras.maxTournaments = 0;
    data.extras.minTournaments = Infinity;

    data.players.forEach(function (item) {
      data.extras.maxPoints = item.points > data.extras.maxPoints ? 
        item.points :
        data.extras.maxPoints;

      data.extras.minPoints = item.points < data.extras.minPoints ? 
        item.points :
        data.extras.maxPoints;

      data.extras.maxTournaments = 
        item.tournaments.length > data.extras.maxTournaments ? 
          item.tournaments.length :
          data.extras.maxTournaments;

      data.extras.minTournaments = 
        item.tournaments.length < data.extras.minTournaments ? 
          item.tournaments.length :
          data.extras.minTournaments;
      
    })
  }
  
  function setStage() {
  
    chart = d3.select('#graph').append('svg')
        .attr('class', 'chart')
        .attr('width', realWidth)
        .attr('height', realHeight);

    rulerx = chart.append('g')
        .attr('class', 'rulerx')
        .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')

    rulery = chart.append('g')
        .attr('class', 'rulery')
        .attr('transform', 'translate(0, ' + marginTop +')')

    linesHorizontal = chart.append('g')
        .attr('class', 'rulery')
        .attr('transform', 'translate(10, ' + marginTop +')')

    graph = chart.append('g')
        .attr('class', 'graph')
        .attr(
          'transform', 
          'translate(' + marginLeft + ',' + marginTop + ')'
          //'scale(' + scaleX + ',' + scaleY + ')'
        );
  }

  function render () {

    var players = graph.selectAll('circle')
        .data(data.players, function (d) { return d.name; });

    players.enter().append('circle')
        .attr('cx', function (d, i) {
          console.log('d');
          return Math.floor(x(d.tournaments.length));
        })
        .attr('cy', function (d, i) {
          return graphHeight - Math.floor(oldY(d.points));
        })
        .attr('class', 'circleNormal')
        .attr('r', 5)
        .on('mouseover', hoverCircle)
        .on('mouseout', unhoverCircle);
    
    players.transition()
        .duration(1000)
        .attr('cy', function (d, i) {
          return graphHeight - Math.floor(actualY(d.points));
        });


    // number of tournaments
    rulerx.selectAll('text.rulex')
        .data(x.ticks(25))
      .enter().append('text')
        .attr('class', 'rulex')
        .attr('x', x)
        .attr('y', graphHeight)
        .attr('dy', 30)
        .attr('text-anchor', 'middle')
        .text(String);
    
    // points
    var points = rulery.selectAll('text.ruley')
        .data(actualY.ticks(10), function (d) { return d; });

    points.enter().append('text')
        .attr('class', 'ruley')
        .attr('x', 0)
        .attr('y', function (d, i) { return graphHeight - oldY(d, i); })
        .attr('dx', 20)
        .attr('dy', 4)
        .attr('text-anchor', 'end')
        .text(String)
        .style('opacity', 0.0);
    
    points.transition()
        .duration(1000)
        .attr('y', function (d, i) { return graphHeight - actualY(d, i); })
        .style('opacity', 1.0);

    points.exit().transition()
        .duration(1000)
        .attr('y', function (d, i) { return graphHeight - actualY(d, i); })
        .style('opacity', 0.0)
        .remove();

    var horizontalLines = linesHorizontal.selectAll('line')
        .data(actualY.ticks(10), function (d) { return d; });

    horizontalLines.enter().append('line')
        .attr('x1', 11)
        .attr('x2', graphWidth + marginLeft)
        .attr('y1', function (d, i) { 
          return Math.round(graphHeight - oldY(d, i)); 
        })
        .attr('y2', function (d, i) { 
          return Math.round(graphHeight - oldY(d, i)); 
        })
        .attr('dx', 20)
        .style('opacity', 0.0);

    horizontalLines.transition()
        .duration(1000)
        .attr('y1', function (d, i) { 
          return Math.round(graphHeight - actualY(d, i)); 
        })
        .attr('y2', function (d, i) {
          return Math.round(graphHeight - actualY(d, i)); 
        })
        .style('opacity', 1.0);

    horizontalLines.exit().transition()
        .duration(1000)
        .attr('y1', function (d, i) { 
          return Math.round(graphHeight - actualY(d, i)); 
        })
        .attr('y2', function (d, i) {
          return Math.round(graphHeight - actualY(d, i)); 
        })
        .style('opacity', 0.0)
        .remove();

  }
  
  function hoverCircle (d, i) {
    var cords = $(this).offset();
    $('#label')
      .html(d.name + '<br> points: ' + 
        d.points + '<br> tournaments: ' + d.tournaments.length
      )
      .show()
      .css('left', cords.left + 15)
      .css('top', cords.top - 10);

    d3.select(this)
      .attr('r', 8)
      .classed('circleHover', true)
      .classed('circleNormal', false);
    this.parentNode.appendChild(this);

  }

  function unhoverCircle () {
    $('#label').text('').hide();
    d3.select(this)
      .attr('r', 5)
      .classed('circleHover', false)
      .classed('circleNormal', true);
  }

  $('#scaleBtn').click(scaleChangeHandler);

  function scaleChangeHandler (e) {
    $(e.target).text(actualScale + ' scale');
    actualScale = (actualScale == 'log') ? 'linear' : 'log';
    setScale();
    render();
  }
  
  function setScale () {
    oldY = actualY;
    if (actualScale == 'log'){
      actualY = d3.scale.log()
        .domain([data.extras.minPoints, data.extras.maxPoints])
        .range([0, graphHeight]);

    } else {
      actualY = d3.scale.linear()
        .domain([data.extras.minPoints, data.extras.maxPoints])
        .range([0, graphHeight]);
    }
    oldY = oldY ? oldY : actualY;
    if (!x) {
      x = d3.scale.linear()
        .domain([data.extras.minTournaments, data.extras.maxTournaments])
        .range([0, graphWidth]);
    }
  }
  
  events.on('data.loaded', function () {
    var names = data.players.map(function (item) { return item.name; });
    $('#nameSearch').typeahead({source: names, items: 20});
    var throttled = _.throttle(highlight, 500);
    $('#nameSearch').bind('change', throttled);
  });
  
  function highlight (e) {
    
    function filter (d, i) {
      return d.name == name;
    }

    var name = $(e.target).val();
    var player = graph.selectAll('circle')
      .filter(filter);

    player
      .attr('class' , 'hover');
    
    player.each(hoverCircle);
    if (lastSearched) {
      lastSearched.each(unhoverCircle);
    }
    lastSearched = player;

  }


})
