var Pocket = require('pocket-ces');
var arbit = require('arbit');

var pkt = new Pocket();
var random = arbit();

var uiHTML = ''
 + '<button onclick="handlePlantSeedClick()">Plant a seed</button>'
 + '<button onclick="handleTickClick()">Walk through the fields</button>'
 + '<button onclick="handleHarvestClick()">Harvest!</button>'
 + '<button onclick="handleNapClick()">Take a relaxing nap</button>'
 + '<div id="status-pane"></div>'
document.body.innerHTML = uiHTML;

pkt.cmpType('life', function (cmp, opts) {
  cmp.age = cmp.age || 1;
})

pkt.cmpType('growth', function (cmp, opts) {
  cmp.height = cmp.height || 0;
});

pkt.cmpType('bag', function (cmp, opts) {
  cmp.seeds = cmp.seeds || 1;
});

pkt.systemForEach(
  'plants-grow',
	['life', 'growth'],
function (pkt, key, life, growth) {
  growth.height += Math.log(life.age);
  life.age += 1;
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