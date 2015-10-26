import arbit from 'arbit';

import combineReducers from './combine-reducers';
import createStore from './create-store';

import bag from './reducers/bag';
import msgs from './reducers/msgs';
import plants from './reducers/plants';

import {
  plantSeed,
  tick,
  harvest,
  takeNap
} from './actions';

// A single random number generator instance.
let random = arbit('grow some plants, friend');

const initialState = {
  bag: { seeds: 1 },
  plants: [],
  msgs: []
};

const store = createStore(
  combineReducers({
    bag,
    plants,
    msgs
  },
  initialState
);

let uiHTML = ''
 + '<button class="Button" onclick="handlePlantSeedClick()">Plant a seed</button>'
 + '<button class="Button" onclick="handleTickClick()">Walk through the fields</button>'
 + '<button class="Button" onclick="handleHarvestClick()">Harvest!</button>'
 + '<button class="Button" onclick="handleNapClick()">Take a relaxing nap</button>'
 + '<div id="status-pane"></div>'
document.body.innerHTML = uiHTML;

// Render

let render = () => {
  let pane = document.querySelector('#status-pane');
  let { plants, bag: { seeds }, msgs } = store.getState();

  if (plants.length === 0) {
    pane.innerHTML = 'Your fields are empty.';
  } else {
    pane.innerHTML = plants.map(p => {
      return '<b>height:</b> '
        + p.height
        + ', <b>age:</b> '
        + p.age;
    }).join('<br>')
  }

  pane.innerHTML += '<p>Your bag has ' + seeds + ' seeds.</p>';
  pane.innerHTML += msgs.map(m => {
    return '<p>' + m + '</p>'
  }).join('<br>');
}

store.subscribe(render);
render(); // Initial render, will use default state.

// Handle User Input

window.handlePlantSeedClick = function (e) {
  store.dispatch(plantSeed())
  store.dispatch(tick(random));
}

window.handleHarvestClick = function (e) {
  store.dispatch(harvest());
  store.dispatch(tick(random));
}

window.handleTickClick = function (e) {
  store.dispatch(tick(random));
}

window.handleNapClick = function (e) {
  store.dispatch(takeNap(random));
}



