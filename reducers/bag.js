import { PLANT_SEED, ADD_SEEDS_TO_BAG } from '../actions';

export default function bag (bag, action) {
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
