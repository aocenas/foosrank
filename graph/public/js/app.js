$(function () {
  
  var rankings = graphs.Rankings('#graph', '/data.json');

  $('#scaleBtn').click(scaleChangeHandler);

  function scaleChangeHandler (e) {
    $(e.target).text(rankings.getActualScale() + ' scale');
    rankings.changeScale();
  }
  
  rankings.on('data.loaded', function () {

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
  

})
