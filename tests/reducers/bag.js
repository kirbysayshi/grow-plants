import sinon from 'sinon';
import test from 'tape';

import { plantSeed, addSeedsToBag } from '../../actions';
import bag from '../../reducers/bag';

test('bag: addSeedsToBag', t => {
  let state = { seeds: 1 };
  let nextState = bag(state, addSeedsToBag(1));

  t.equal(nextState.seeds, 2);
  t.notEqual(state, nextState);
  t.end();
});

test('bag: plantSeed', t => {

  let state = { seeds: 1 };

  let dispatch = sinon.spy();
  let getState = sinon.stub().returns({
    bag: state
  });

  plantSeed()(dispatch, getState);
  let action = dispatch.args[0][0];

  let nextState = bag(state, action);

  t.equal(nextState.seeds, 0);
  t.equal(dispatch.callCount, 1);
  t.notEqual(state, nextState);
  t.end();
});
