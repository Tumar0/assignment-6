$(function () {
  var DUR = 700;          // move / sort duration
  var CARD_W = 290;       // full width of the guest card
  var jobs = [];          // animations in flight (move / sort); each can be finished at once
  var openName = null;    // name of the guest whose card is open
  var $card = $('#card');

  /* ---------- helpers ---------- */
  function roomById(id) { return rooms.filter(function (r) { return r.id === id; })[0]; }
  function roomOf(name) {
    return rooms.filter(function (r) {
      return r.guests.some(function (g) { return g.name === name; });
    })[0];
  }
  function guestEl(name) { return $('#house .guest[data-name="' + name + '"]'); }

  // Fast clicks: before any new action, every running move/sort jumps to its final state.
  function finishAll() {
    jobs.slice().forEach(function (j) { j.finish(); });
    $('.guest.flying').remove();
  }

  /* ---------- render (from the array) ---------- */
  function render() {
    finishAll();
    closeCard(true);
    var $house = $('#house').empty();
    [2, 1].forEach(function (f) {
      var $rooms = $('<div class="rooms">');
      rooms.filter(function (r) { return r.floor === f; }).forEach(function (r) {
        var $list = $('<ul class="guests">');
        var list = r.order
          ? r.order.map(function (n) { return r.guests.filter(function (g) { return g.name === n; })[0]; })
          : r.guests;
        list.forEach(function (g) { $list.append(guestHtml(g)); });
        $rooms.append(
          $('<div class="room">')
            .attr({ id: 'room-' + r.id, 'data-room': r.id, 'data-name': r.name, 'data-floor': f })
            .append(
              $('<h2>').append(
                $('<span>').text(r.name),
                $('<button class="sort">').attr('data-room', r.id).toggleClass('on', !!r.sorted).text('Sort by time')
              ),
              $list
            )
        );
      });
      $house.append(
        $('<section class="floor">').attr('data-floor', f)
          .append($('<div class="floor-label">').text('FLOOR ' + f), $rooms)
      );
    });
  }

  /* ---------- jump (Task 1) ---------- */
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

  /* ---------- 1. Spotlight ---------- */
  function spotlight($found) {
    var $keep = $found.filter('.guest').add($found.filter('.room').find('.guest'));
    $('#house .guest').not($keep).stop(true).fadeTo(300, 0.2);
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
    render(); // build the page again before every case (it also settles every animation)
    var $r = new Function('$', 'return ' + c.chain)(jQuery);
    $r.addClass('found');
    jump($r.filter('.guest, .room'));
    spotlight($r);
    showResult(c, $r);
  }

  function clearAll() {
    finishAll();
    $('.guest').stop(true).fadeTo(300, 1);
    $('.found').removeClass('found');
    $('.case').removeClass('on');
    $('#result').html('<em>Choose a case.</em>');
  }

  /* ---------- 2. Guest card ---------- */
  function avRect($g) {
    var $a = $g.find('.av');
    var o = $a.offset();
    return { left: o.left, top: o.top, width: $a.outerWidth(), height: $a.outerHeight() };
  }

  function describe(g) {
    var words = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
    var items = g.items.map(function (i) { return words[i]; });
    var has = !items.length ? 'Has nothing with them'
      : 'Has ' + (items.length > 1 ? items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1] : items[0]);
    return [
      'Came at ' + g.time,
      g.aitu ? 'AITU student' : 'Not an AITU student',
      has,
      'Wears ' + g.color,
      'Is in the ' + g.room.toLowerCase()
    ];
  }

  function guestFromEl($g) {
    return {
      name: $g.attr('data-name'),
      time: $g.attr('data-time'),
      color: $g.attr('data-color'),
      aitu: $g.hasClass('aitu'),
      items: ($g.attr('data-items') || '').split(' ').filter(Boolean),
      room: $g.closest('.room').attr('data-name'),
      roomId: $g.closest('.room').attr('data-room')
    };
  }

  function openCard($g) {
    finishAll();
    var g = guestFromEl($g);
    openName = g.name;

    var $inner = $('<div class="inner">').append(
      $('<div class="head">').append(
        $('<img>').attr('src', 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + encodeURIComponent(g.name)),
        $('<h3>').text(g.name)
      ),
      $('<ul>').append(describe(g).map(function (t) { return $('<li>').text(t); }))
    );
    if (roomOf(g.name)) {
      var $moves = $('<div class="moves">');
      rooms.filter(function (r) { return r.id !== g.roomId; }).forEach(function (r) {
        $moves.append($('<button class="move">').attr('data-to', r.id).text('Move to the ' + r.name.toLowerCase()));
      });
      $inner.append($moves);
    }

    var r = avRect($g);
    $card.stop(true).empty().append($inner)
      .css({ display: 'block', visibility: 'hidden', width: CARD_W, height: 'auto', left: 0, top: 0 });
    var H = $card.outerHeight();

    var $w = $(window);
    var left = Math.min(Math.max(r.left + r.width / 2 - CARD_W / 2, $w.scrollLeft() + 8),
                        $w.scrollLeft() + $w.width() - CARD_W - 8);
    var top = Math.max($w.scrollTop() + 8,
                       Math.min(r.top - 12, $w.scrollTop() + $w.height() - H - 8));

    // start small, on the guest's photo, then grow
    $card.css({ visibility: 'visible', left: r.left, top: r.top, width: r.width, height: r.height,
                borderRadius: r.width / 2, opacity: 0.6 })
      .animate({ left: left, top: top, width: CARD_W, height: H, borderRadius: 14, opacity: 1 }, 350);
  }

  function closeCard(now) {
    if (now) { openName = null; $card.stop(true).hide(); return; }
    if (openName === null) return;
    var name = openName;
    openName = null;
    $card.stop(true);
    var $g = guestEl(name);
    if (!$g.length) { $card.hide(); return; }
    var r = avRect($g);
    $card.animate({ left: r.left, top: r.top, width: r.width, height: r.height,
                    borderRadius: r.width / 2, opacity: 0.6 }, 250, function () { $card.hide(); });
  }

  $(document).on('click', function (e) {
    var $t = $(e.target);
    if ($t.closest('#card').length) return;
    var $g = $t.closest('.guest');
    if ($g.length && !$g.hasClass('flying') && !$g.hasClass('slot')) {
      if (openName === $g.attr('data-name')) closeCard(); else openCard($g);
    } else {
      closeCard();
    }
  });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeCard(); });

  /* ---------- 3. Move ---------- */
  $card.on('click', '.move', function () {
    var name = openName, to = $(this).attr('data-to');
    closeCard(true);
    moveGuest(name, to);
  });

  function moveGuest(name, toId) {
    finishAll();
    var from = roomOf(name), to = roomById(toId);
    if (!from || !to || from === to) return;
    var $g = guestEl(name);
    if (!$g.length) return;

    // 1) change the array, so the cases find the guest in the new room
    var i = from.guests.map(function (g) { return g.name; }).indexOf(name);
    to.guests.push(from.guests.splice(i, 1)[0]);
    if (from.order) from.order = from.order.filter(function (n) { return n !== name; });
    if (to.order) to.order.push(name);

    // 2) animate: a flying clone, a closing gap, an opening place
    var w = $g.outerWidth(), m = parseFloat($g.css('marginLeft')), start = $g.offset();
    var $ph = $('<li class="guest slot">').appendTo('#room-' + toId + ' .guests');
    var $clone = $g.clone().addClass('flying').css({ left: start.left, top: start.top, width: w }).appendTo('body');
    $g.css('visibility', 'hidden').animate({ width: 0, marginLeft: 0, marginRight: 0 }, DUR);
    $ph.animate({ width: w, marginLeft: m, marginRight: m }, DUR);

    var fly = $({ p: 0 });
    var job = {
      done: false,
      finish: function () {
        if (job.done) return;
        job.done = true;
        fly.stop(true);
        $g.stop(true).remove();
        $ph.stop(true).replaceWith($clone.removeClass('flying').css({ left: '', top: '', width: '' }));
        jobs = jobs.filter(function (j) { return j !== job; });
      }
    };
    jobs.push(job);
    fly.animate({ p: 1 }, {
      duration: DUR,
      step: function (p) {
        var t = $ph.offset();
        $clone.css({ left: start.left + (t.left - start.left) * p, top: start.top + (t.top - start.top) * p });
      },
      complete: job.finish
    });
  }

  /* ---------- 4. Sort by time ---------- */
  $('#house').on('click', '.sort', function () {
    var id = $(this).attr('data-room');
    sortRoom(id);
    $(this).toggleClass('on', !!roomById(id).sorted);
  });

  function sortRoom(id) {
    finishAll();
    closeCard(true);
    var room = roomById(id);
    var $list = $('#room-' + id + ' .guests');
    var els = $list.children('.guest').toArray();
    var before = els.map(function (el) { return $(el).offset().left; });

    room.sorted = !room.sorted;
    if (room.sorted) {
      els.sort(function (a, b) { return $(a).data('min') - $(b).data('min'); });
      room.order = els.map(function (el) { return $(el).attr('data-name'); });
    } else {
      var names = room.guests.map(function (g) { return g.name; });
      var idx = function (el) { var k = names.indexOf($(el).attr('data-name')); return k < 0 ? 999 : k; };
      els.sort(function (a, b) { return idx(a) - idx(b); });
      room.order = null;
    }

    var oldLeft = {};
    $list.children('.guest').each(function (k) { oldLeft[$(this).attr('data-name')] = before[k]; });
    $list.append(els);

    var $els = $(els);
    $els.each(function () {
      var $e = $(this);
      var dx = oldLeft[$e.attr('data-name')] - $e.offset().left;
      $e.css('left', dx).animate({ left: 0 }, DUR);
    });

    var job = {
      done: false,
      finish: function () {
        if (job.done) return;
        job.done = true;
        $els.stop(true).css('left', 0);
        jobs = jobs.filter(function (j) { return j !== job; });
      }
    };
    jobs.push(job);
    $els.promise().done(job.finish);
  }

  /* ---------- buttons ---------- */
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
  $('#clear').on('click', clearAll);

  render();
});
