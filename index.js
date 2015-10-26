import arbit from 'arbit';

let random = arbit('grow some plants, friend');

let uiHTML = ''
 + '<button class="Button" onclick="handlePlantSeedClick()">Plant a seed</button>'
 + '<button class="Button" onclick="handleTickClick()">Walk through the fields</button>'
 + '<button class="Button" onclick="handleHarvestClick()">Harvest!</button>'
 + '<button class="Button" onclick="handleNapClick()">Take a relaxing nap</button>'
 + '<div id="status-pane"></div>'
document.body.innerHTML = uiHTML;

// Action Creators

const PLANT_SEED = 'PLANT_SEED';
function plantSeedUnsafe () {
  return { type: PLANT_SEED };
}

function plantSeed() {
  return (dispatch, getState) => {
    if (getState().bag.seeds > 0) {
      dispatch(plantSeedUnsafe());
    }
  }
}

const TAKE_NAP = 'TAKE_NAP';
function takeNap() { return { type: TAKE_NAP } }

const GROW = 'GROW';
function grow() { return { type: GROW } }

const ADD_SEEDS_TO_BAG = 'ADD_SEEDS_TO_BAG';
function addSeedsToBag(count) {
  return {
    type: ADD_SEEDS_TO_BAG,
    count
  }
}

const REMOVE_PLANTS = 'REMOVE_PLANTS';
function removePlants (plants) {
  return {
    type: REMOVE_PLANTS,
    plants
  }
}

const ADD_MSG = 'ADD_MSG';
function addMsg (msg) {
  return {
    type: ADD_MSG,
    msg
  }
}

// Async Action Creators

// this is a thunk action. apparently they are allowed to dispatch, I guess
// because they don't get a chance to mutate state.
function tick() {
  return dispatch => {
    dispatch(grow());
    dispatch(checkRandomAccident());
    dispatch(checkGameOver());
  }
}

function harvest () {
  return (dispatch, getState) => {
    let { plants } = getState();

    let seedsToAdd = 0;
    let plantsToRemove = plants.filter(p => {
      seedsToAdd += p.age > 20 ? Math.floor(p.height / p.age) : 0;
      return p.age <= 20;
    });

    dispatch(addSeedsToBag(seedsToAdd));
    dispatch(removePlants(plantsToRemove));
  }
}

function checkRandomAccident() {
  return (dispatch, getState) => {
    let state = getState();
    let highest = Math.max(...state.plants.map(p => p.height));
    let chance = highest >= 100 ? 0.01 : 0.001;
    let value = random.nextFloat(); // a side effect, but it's a seeded prng
    if (value > chance || state.plants.length == 1) return;
    let percentToDestroy = 0.1;
    let notDestroyed = Math.ceil(state.plants.length * percentToDestroy);

    dispatch(removePlants(state.plants.slice(0, notDestroyed)));
    dispatch(addMsg('A rampaging beast destroyed '
      + (percentToDestroy * 100) + '% of your crop!'));
  }
}

function checkGameOver () {
  return (dispatch, getState) => {
    let { plants, bag: { seeds } } = getState();
    if (plants.length > 0 || seeds > 0) return;

    dispatch(addMsg('You are out of seeds and have no plants. '
      + 'Sadly you will not survive the winter.'));
  }
}

// Store

const initialState = {
  bag: { seeds: 1 },
  plants: [],
  msgs: []
};

function bag (bag, action) {
  if (action.type === PLANT_SEED) {
    return {
      ...bag,
      seeds: bag.seeds - 1
    }
  }

  if (action.type === ADD_SEEDS_TO_BAG) {
    return {
      ...bag,
      seeds: bag.seeds + action.count
    }
  }

  return bag;
}

function plants (plants, action) {
  if (action.type === PLANT_SEED) {
    return [
      ...plants,
      { height: 0, age: 1, emotions: {} }
    ];
  }

  if (action.type === GROW) {
    return plants.map(p => {
      return {
        height: p.height + random.nextFloat(0.5, 1) * Math.log(p.age),
        age: p.age += 1
      }
    });
  }

  if (action.type === REMOVE_PLANTS) {
    return plants.filter(p => {
      return action.plants.indexOf(p) > -1;
    });
  }

  return plants;
}

function msgs (msgs, action) {
  if (action.type === ADD_MSG) {
    return [
      action.msg,
      ...msgs
    ]
  }
}

let store = createStore(
  combineReducers({
    bag,
    plants,
    msgs
  },
  initialState
);

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
  store.dispatch(tick());
}

window.handleHarvestClick = function (e) {
  store.dispatch(harvest());
  store.dispatch(tick());
}

window.handleTickClick = function (e) {
  store.dispatch(tick());
}

window.handleNapClick = function (e) {
  let count = random.nextInt(1,50);
  while(count--) store.dispatch(tick());
}


// Redux

function createStore (reducer, initialState) {
  let subs = [];
  let store = { dispatch, subscribe, getState };
  let state = initialState;
  let isDispatching = false;

  function dispatch (action) {
    // Thunk "middleware" support
    if (typeof action === 'function') {
      return action(dispatch, getState);
    } else {
      if (isDispatching === true) throw new Error(''
        + 'Cannot dispatch from within a reducer! '
        + JSON.stringify(action));
      try {
        isDispatching = true;
        state = reducer(state, action);
      } finally {
        isDispatching = false;
      }
      subs.slice(0).forEach(s => s());
      return action;
    }
  }

  function getState () { return state; }
  function subscribe (cb) {
    subs.push(cb);
    return function () {
      subs.splice(subs.indexOf(cb), 1);
    }
  }

  return store;
}

function combineReducers (reducers) {
  const keys = Object.keys(reducers);
  return function (state, action) {
    let hasChanged = false;
    const nextFullState = {};
    keys.forEach(k => {
      const prevStateForKey = state[k];
      const stateForKey = reducers[k](state, action);
      if (stateForKey === undefined) {
        throw new Error('Reducer for `' + k + '` returned `undefined`');
      }
      if (!prevStateForKey !== stateForKey) {
        hasChanged = true;
        nextFullState[k] = stateForKey;
      }
    });
    return hasChanged ? nextFullState : state;
  }
}
