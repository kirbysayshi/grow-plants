import Pocket from 'pocket-ces';
import arbit from 'arbit';

var pkt = new Pocket();
var random = arbit();

var uiHTML = ''
 + '<button class="Button" onclick="handlePlantSeedClick()">Plant a seed</button>'
 + '<button class="Button" onclick="handleTickClick()">Walk through the fields</button>'
 + '<button class="Button" onclick="handleHarvestClick()">Harvest!</button>'
 + '<button class="Button" onclick="handleNapClick()">Take a relaxing nap</button>'
 + '<div id="status-pane"></div>'
document.body.innerHTML = uiHTML;

pkt.cmpType('life', function (cmp, opts) {
  cmp.age = opts.age || 1;
})

pkt.cmpType('growth', function (cmp, opts) {
  cmp.height = opts.height || 0;
});

pkt.cmpType('bag', function (cmp, opts) {
  cmp.seeds = opts.seeds || 1;
});

pkt.cmpType('status-msg', function (cmp, opts) {
  cmp.msg = opts.msg || '';
});

pkt.systemForEach(
  'plants-grow',
	['life', 'growth'],
function (pkt, key, life, growth) {
  growth.height += random.nextFloat(0.5, 1) * Math.log(life.age);
  life.age += 1;
});

pkt.system(
  'random-accident',
  ['growth'],
(pkt, keys, growths) => {
  let highest = Math.max(...keys.map(k => growths[k].height));
  let chance = highest >= 100 ? 0.30 : highest >= 50 ? 0.10 : 0.01;
  let value = random.nextFloat();
  if (value > chance) return;
  let percentToDestroy = 0.3;
  let destroyed = keys.slice(0, Math.ceil(keys.length * percentToDestroy));
  destroyed.forEach(k => pkt.destroyKey(k));
  pkt.key({
    'status-msg': {
      msg: 'A rampaging beast destroyed '
      + (percentToDestroy * 100) + '% of your crop!'
    }
  });
});

pkt.systemForEach(
  'plant-harvester',
	['life', 'growth'],
function (pkt, key, life, growth) {
  var shouldHarvest = pkt.keysMatching('cmd:should-harvest');
  if (!shouldHarvest.length) return;
  shouldHarvest.forEach(function(key) { pkt.destroyKey(key) });
  var bag = pkt.firstData('bag');
  if (life.age > 20) {
    bag.seeds += Math.floor(growth.height / life.age);
    pkt.destroyKey(key);
  }
});

pkt.system(
  'game-over',
  [],
(pkt) => {
  let bag = pkt.firstData('bag');
  let keys = pkt.keysMatching('life', 'growth');
  if (keys.length === 0 && bag.seeds === 0) {
    pkt.key({
      'status-msg': {
        msg: 'You are out of seeds and have no plants. '
          + 'Sadly you will not survive the winter.'
      }
    })
  }
})

pkt.system(
  'system-printer',
	[],
function (pkt) {
  var pane = document.querySelector('#status-pane');
  var bag = pkt.firstData('bag');
  var lifes = pkt.indexedData('life');
  var growths = pkt.indexedData('growth');
  var keys = pkt.keysMatching('life', 'growth');
  if (!keys.length) {
    pane.innerHTML = 'Your fields are empty.';
  } else {
    pane.innerHTML = keys.map(function(key) {
      return '<b>height:</b> '
      	+ growths[key].height
      	+ ', <b>age:</b> '
      	+ lifes[key].age;  
    }).join('<br>')
  }
  pane.innerHTML += '<p>Your bag has ' + bag.seeds + ' seeds.</p>';
  var statuses = pkt.indexedData('status-msg');
  pane.innerHTML += Object.keys(statuses).map(s => {
    return '<p>' + statuses[s].msg + '</p>'
  }).join('<br>');
});

pkt.key({
  bag: null
});

window.handlePlantSeedClick = function (e) {
  var bag = pkt.firstData('bag');
  if (bag.seeds > 0) {
    bag.seeds--;
    pkt.key({
      life: null,
      growth: null
    });
    pkt.tick(16);
  }
}

window.handleHarvestClick = function (e) {
  var shouldHarvest = pkt.keysMatching('cmd:should-harvest');
  if (!shouldHarvest.length) {
  	pkt.key({ 'cmd:should-harvest': null });
    pkt.tick(16);
	  pkt.tick(16);
  }
}

window.handleTickClick = function (e) {
  pkt.tick(16);
}

window.handleNapClick = function (e) {
  var count = random.nextInt(1,101);
  while(count--) pkt.tick(16);
}