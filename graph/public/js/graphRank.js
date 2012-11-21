var graphs = (function (graphs){

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
  var lastSearched;

  var chart;
  var rulerx;
  var rulery;
  var linesHorizontal;
  var graph;

  var events = new EventEmitter();

  var $label;

  //
  // Compute some extra MAX/MIN related date
  //
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

  //
  // set the SVG element and all groups
  //
  function setStage(container) {

    // append svg to chosen container
    chart = d3.select(container).append('svg')
        .attr('class', 'chart')
        .attr('width', realWidth)
        .attr('height', realHeight);

    // append group for horizontal ruler
    rulerx = chart.append('g')
        .attr('class', 'rulerx')
        .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

    // vertical ruler
    rulery = chart.append('g')
        .attr('class', 'rulery')
        .attr('transform', 'translate(0, ' + marginTop +')');

    linesHorizontal = chart.append('g')
        .attr('class', 'rulery')
        .attr('transform', 'translate(10, ' + marginTop +')');

    // group for actual data points is appended as last so it is on top
    // of everything else
    graph = chart.append('g')
        .attr('class', 'graph')
        .attr(
          'transform', 
          'translate(' + marginLeft + ',' + marginTop + ')'
          //'scale(' + scaleX + ',' + scaleY + ')'
        );
  }

  //
  // render the actual graph with d3.js
  //
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
    $label
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
    $label.text('').hide();
    d3.select(this)
      .attr('r', 5)
      .classed('circleHover', false)
      .classed('circleNormal', true);
  }
  
  function setScale (actualScale) {
    oldY = actualY;
    
    // change to log or linear scale
    actualY = d3.scale[actualScale]()
      .domain([data.extras.minPoints, data.extras.maxPoints])
      .range([0, graphHeight]);
    
    oldY = oldY ? oldY : actualY;
    if (!x) {
      x = d3.scale.linear()
        .domain([data.extras.minTournaments, data.extras.maxTournaments])
        .range([0, graphWidth]);
    }
  }
  
  function highlight (name) {
    
    function filter (d, i) {
      return d.name == name;
    }

    var player = graph.selectAll('circle').filter(filter);

    player.attr('class' , 'hover');
    
    player.each(hoverCircle);
    if (lastSearched) {
      lastSearched.each(unhoverCircle);
    }
    lastSearched = player;

  }

  function finalize (actualScale) {
    computeExtras();
    setScale(actualScale);
    render();
  }

  function appendLabel () {
    $('body').append('<div id="rankingGraphLabel"></div>');
    $label = $('#rankingGraphLabel');
  }

  graphs.Rankings = function (container, dataArg) {
    
    var graph = new EventEmitter();
    var actualScale = 'log';

    setStage(container);
    appendLabel();
    
    if (typeof dataArg == 'string') {
      d3.json(dataArg, function (json) {
        data = json;
        graph.emit('data.loaded');
        finalize(actualScale);
      });
    } else {
      data = dataArg;
      graph.emit('data.loaded');
      finalize(actualScale);
    }

    graph.setScale = function (scaleType) {
      actualScale = scaleType;
      setScale(actualScale);
      render();
    };

    graph.changeScale = function () {
      if (actualScale === 'log') {
        this.setScale('linear');
      } else {
        this.setScale('log');
      }
    }

    graph.getActualScale = function () { return actualScale; };
    graph.getPlayers = function () { return data.players; };

    graph.highlight = function (name) { highlight(name) };

    return graph;

  };

  return graphs;
})(graphs || {});
