// Every case is ONE jQuery chain that searches the page (not the array).
// The chain text is shown on the page and executed as written.
var CASES = [
  { n: 1, title: 'Who is in the hall?',
    chain: `$('.room[data-room="hall"] .guest')` },

  { n: 2, title: 'Who is dressed in yellow or purple?',
    chain: `$('.guest.c-yellow, .guest.c-purple')` },

  { n: 3, title: 'Which AITU students are upstairs?',
    chain: `$('.floor[data-floor="2"] .guest.aitu')` },

  { n: 4, title: 'Who has glasses or a bag?',
    chain: `$('.guest').filter('[data-items~="glasses"], [data-items~="bag"]')` },

  { n: 5, title: 'Who came with nothing at all?',
    chain: `$('.guest[data-items=""]')` },

  { n: 6, title: 'Who has a phone but no bag?',
    chain: `$('.guest.item-phone:not(.item-bag)')` },

  { n: 7, title: 'Who arrived between 20:30 and 21:00 (both included)?',
    chain: `$('.guest').filter(function () {
  var m = $(this).data('min');
  return m >= 1230 && m <= 1260;
})` },

  { n: 8, title: 'Who arrived after 21:00 and is not an AITU student?',
    chain: `$('.guest').filter(function () {
  return $(this).data('min') > 1260;
}).not('.aitu')` },

  { n: 9, title: 'Who stands right next to Askar?',
    chain: `$('.guest[data-name="Askar"]').siblings().filter(function () {
  return $(this).prev().is('[data-name="Askar"]') ||
         $(this).next().is('[data-name="Askar"]');
})` },

  { n: 10, title: 'Who stands last in each room?',
    chain: `$('.guests .guest:last-child')` },

  { n: 11, title: 'Who stands third in each room?',
    chain: `$('.guests .guest:nth-child(3)')` },

  { n: 12, title: 'Who stands after Timur in his room?',
    chain: `$('.guest[data-name="Timur"]').nextAll()` },

  { n: 13, title: 'Who stands right before someone in black?',
    chain: `$('.guest.c-black').prev('.guest')` },

  { n: 14, title: 'In which room is Aruzhan?',
    chain: `$('.guest[data-name="Aruzhan"]').closest('.room')` },

  { n: 15, title: 'Which rooms have fewer than 6 guests?',
    chain: `$('.room:not(:has(.guest:nth-child(6)))')` },

  { n: 16, title: 'In which rooms does somebody have a cup, but nobody wears glasses?',
    chain: `$('.room:has(.item-cup):not(:has(.item-glasses))')` },

  { n: 17, title: 'Who came first to each room?',
    chain: `$('.room').map(function () {
  return $(this).find('.guest').toArray().sort(function (a, b) {
    return $(a).data('min') - $(b).data('min');
  })[0];
})` },

  { n: 18, title: 'Miras (AITU, blue) comes at 21:20 with his phone and stands between Askar and Inkar',
    chain: `$(guestHtml({ name: 'Miras', color: 'blue', time: '21:20', aitu: true, items: ['phone'] }))
  .hide()
  .insertAfter('.guest[data-name="Askar"]')
  .fadeIn(800)` },

  { n: 19, title: 'Natasha says goodbye and goes home',
    chain: `$('.guest[data-name="Natasha"]').fadeOut(800, function () { $(this).remove(); })` },

  { n: 20, title: 'Who took the cake?',
    chain: `$('.floor[data-floor="1"] .guest')
  .filter(function () {
    var m = $(this).data('min');
    return m > 1260 && m < 1290;
  })
  .filter('.item-crumbs:not(.item-cup)')
  .filter(function () {
    return $(this).prev().add($(this).next()).is('.aitu');
  })` }
];
