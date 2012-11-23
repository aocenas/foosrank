$(function () {
  
  var rankings = graphs.Rankings();

  $('#scaleBtn').click(scaleChangeHandler);

  function scaleChangeHandler (e) {
    $(e.target).text(rankings.getActualScale() + ' scale');
    rankings.changeScale();
  }
  
  rankings.on('data.loaded', function () {
    
    console.log('data loaded in app');
    var $nameSearch = $('#nameSearch');
    var names = rankings.getPlayers().map(function (item) { return item.name; });
    $nameSearch.typeahead({source: names, items: 20});

    function highlight (e) {
      var name = $nameSearch.val();
      rankings.highlight(name);
    }

    var throttled = _.throttle(highlight, 500);
    $nameSearch.bind('change', throttled);
  });

  rankings.on('data.error', function () {
    $('#graph').append('<p>some wrong has been done to us</p>');
  })
  
  rankings.init('#graph', '/api/data');

  $('#findBox').searchbox({
    url: '/api/data/search',
    param: 'q',
    dom_id: function (data) {
      $('#results').html(templatizer.findPlayer(data));
    }
  });

})
