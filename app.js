$(function () {
  // Build the whole party from the array.
  function render() {
    var $house = $('#house').empty();
    [2, 1].forEach(function (f) {
      var $rooms = $('<div class="rooms">');
      rooms.filter(function (r) { return r.floor === f; }).forEach(function (r) {
        var $list = $('<ul class="guests">');
        r.guests.forEach(function (g) { $list.append(guestHtml(g)); });
        $rooms.append(
          $('<div class="room">')
            .attr({ id: 'room-' + r.id, 'data-room': r.id, 'data-name': r.name, 'data-floor': f })
            .append($('<h2>').text(r.name), $list)
        );
      });
      $house.append(
        $('<section class="floor">').attr('data-floor', f)
          .append($('<div class="floor-label">').text('FLOOR ' + f), $rooms)
      );
    });
  }

  // One jump: the found element goes up and comes back (animate()).
  function jump($els) {
    $els.each(function () {
      var $e = $(this);
      var prev = $e.data('jump');
      if (prev) prev.stop(true, true);
      var o = $({ p: 0 });
      $e.data('jump', o);
      o.animate({ p: 1 }, {
        duration: 320,
        step: function (p) { $e.css('top', (-16 * Math.sin(Math.PI * p)) + 'px'); },
        complete: function () { $e.css('top', 0); }
      });
    });
  }

  function showResult(c, $r) {
    var names = $r.map(function () { return $(this).data('name'); }).get();
    $('#result').empty().append(
      $('<h3>').text('Case ' + c.n + ': ' + c.title),
      $('<div>').text('Found: ' + names.length + (names.length ? ' — ' + names.join(', ') : '')),
      $('<pre>').text(c.chain)
    );
  }

  function runCase(c) {
    render(); // build the page again before every case
    var $r = new Function('$', 'return ' + c.chain)(jQuery);
    $r.addClass('found');
    jump($r.filter('.guest, .room'));
    showResult(c, $r);
  }

  // Case buttons
  var $cases = $('#cases');
  CASES.forEach(function (c) {
    $('<button>').addClass('case').attr('data-case', c.n).text(c.n + '. ' + c.title).appendTo($cases);
  });
  $cases.on('click', '.case', function () {
    var n = +$(this).data('case');
    $('.case').removeClass('on');
    $(this).addClass('on');
    runCase(CASES.filter(function (c) { return c.n === n; })[0]);
  });

  render();
});
