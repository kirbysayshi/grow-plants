// Action Creators

export const PLANT_SEED = 'PLANT_SEED';
export function plantSeedUnsafe () {
  return { type: PLANT_SEED };
}

export const GROW = 'GROW';
export function grow(random) {
  return { type: GROW, random }
}

export const ADD_SEEDS_TO_BAG = 'ADD_SEEDS_TO_BAG';
export function addSeedsToBag(count) {
  return { type: ADD_SEEDS_TO_BAG, count }
}

export const REMOVE_PLANTS = 'REMOVE_PLANTS';
export function removePlants (plants) {
  return { type: REMOVE_PLANTS, plants }
}

export const ADD_MSG = 'ADD_MSG';
export function addMsg (msg) {
  return { type: ADD_MSG, msg }
}

// Async Action Creators

// this is a thunk action. apparently they are allowed to dispatch, I guess
// because they don't get a chance to mutate state.
export function tick(random) {
  return dispatch => {
    dispatch(grow(random));
    dispatch(checkRandomAccident(random));
    dispatch(checkGameOver());
  }
}

export function takeNap(random) {
  return dispatch => {
    let count = random.nextInt(1,50);
    while(count--) dispatch(tick(random));
  }
}

export function plantSeed() {
  return (dispatch, getState) => {
    if (getState().bag.seeds > 0) {
      dispatch(plantSeedUnsafe());
    }
  }
}

export function harvest () {
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

export function checkRandomAccident(random) {
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

export function checkGameOver () {
  return (dispatch, getState) => {
    let { plants, bag: { seeds } } = getState();
    if (plants.length > 0 || seeds > 0) return;

    dispatch(addMsg('You are out of seeds and have no plants. '
      + 'Sadly you will not survive the winter.'));
  }
}
