import { PLANT_SEED, GROW, REMOVE_PLANTS } from '../actions';

export default function plants (plants, action) {
  if (action.type === PLANT_SEED) {
    return [
      ...plants,
      { height: 0, age: 1, emotions: {} }
    ];
  }

  if (action.type === GROW) {
    return plants.map(p => {
      return {
        height: p.height + action.random.nextFloat(0.5, 1) * Math.log(p.age),
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
