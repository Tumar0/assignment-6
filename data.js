// Party data transcribed from the picture. Guests are listed from left to right.
var ICONS = { phone: '📱', glasses: '👓', bag: '👜', cup: '☕', crumbs: '🍰' };

function toMin(t) {
  var p = t.split(':');
  return (+p[0]) * 60 + (+p[1]);
}

function G(name, color, time, aitu, items) {
  return { name: name, color: color, time: time, aitu: aitu, items: items };
}

var rooms = [
  { id: 'balcony', name: 'Balcony', floor: 2, guests: [
    G('Aigerim', 'green',  '20:45', true,  ['cup', 'crumbs']),
    G('Aliya',   'black',  '21:15', false, ['phone', 'cup']),
    G('Madina',  'green',  '22:10', false, ['phone', 'bag', 'crumbs']),
    G('Ivan',    'black',  '20:10', true,  ['cup'])
  ]},
  { id: 'hall', name: 'Hall', floor: 2, guests: [
    G('Arman',   'yellow', '20:35', true,  ['bag', 'glasses']),
    G('Sophia',  'purple', '21:20', true,  ['phone']),
    G('Dias',    'green',  '19:45', true,  []),
    G('Bekzat',  'purple', '20:55', false, ['bag', 'cup', 'crumbs']),
    G('Aruzhan', 'black',  '21:50', true,  ['phone']),
    G('Saule',   'green',  '21:25', false, ['glasses'])
  ]},
  { id: 'kitchen', name: 'Kitchen', floor: 1, guests: [
    G('Nurlan',  'red',    '19:40', true,  ['phone', 'cup']),
    G('Emma',    'black',  '20:15', false, ['bag']),
    G('Timur',   'green',  '21:05', true,  ['phone', 'bag', 'crumbs']),
    G('Sergey',  'yellow', '20:50', false, []),
    G('Yerlan',  'red',    '21:40', true,  ['glasses', 'phone']),
    G('Kamila',  'black',  '20:05', false, ['cup'])
  ]},
  { id: 'living', name: 'Living room', floor: 1, guests: [
    G('Daniel',  'blue',   '19:55', true,  ['glasses']),
    G('Zarina',  'green',  '21:10', false, ['bag', 'phone', 'crumbs']),
    G('Natasha', 'yellow', '20:30', true,  []),
    G('Askar',   'black',  '21:00', true,  ['phone']),
    G('Inkar',   'purple', '20:20', false, ['bag'])
  ]}
];

// Builds one guest card (jQuery object). Guest data lives in classes and data-* attributes.
function guestHtml(g) {
  var cls = ['guest', 'c-' + g.color];
  if (g.aitu) cls.push('aitu');
  g.items.forEach(function (i) { cls.push('item-' + i); });

  var $li = $('<li>').addClass(cls.join(' ')).attr({
    'data-name': g.name,
    'data-color': g.color,
    'data-time': g.time,
    'data-min': toMin(g.time),
    'data-aitu': g.aitu,
    'data-items': g.items.join(' ')
  });

  var $av = $('<div class="av">').append($('<img>', {
    src: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + encodeURIComponent(g.name),
    alt: g.name
  }));
  if (g.aitu) $av.append('<span class="badge" title="AITU student">🎓</span>');

  var icons = g.items.map(function (i) {
    return '<span title="' + i + '">' + ICONS[i] + '</span>';
  }).join('');

  return $li.append(
    $av,
    $('<div class="nm">').text(g.name),
    $('<div class="tm">').text('⏲ ' + g.time),
    $('<div class="ic">').html(icons)
  );
}
