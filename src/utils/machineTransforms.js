import { joinStates, joinStateObj, removeArrDuplicates } from './machineUtils';
import { EPSILON } from '../config/symbols';

// IS AFJD?
export function isAfjd(machine) {
  return Object.keys(machine).some(machineKey =>
    Object.keys(machine[machineKey]).some(
      transitionKey => machine[machineKey][transitionKey].length > 1
    )
  );
}

// HAS EPSILON?
export function hasEpsilon(machine) {
  return Object.keys(machine).some(machineKey =>
    Object.keys(machine[machineKey]).some(transitionKey => transitionKey === EPSILON)
  );
}

export function toAfjd(machine, initialId, machineEnds) {
  const afjdMachine = {};
  let nextStates = [initialId];

  while (nextStates.length > 0) {
    let tempStates = [];

    nextStates.forEach(stateId => {
      let newState = machine[stateId];

      const finalStatesIds = removeArrDuplicates(
        Object.keys(newState).reduce((acc, cur) => acc.concat(newState[cur]), [])
      ).filter(key => key !== stateId);

      if (!afjdMachine[stateId]) {
        tempStates = tempStates.concat(finalStatesIds);

        if (newState[EPSILON]) {
          const otherStatesJoin = joinStates(machine, finalStatesIds);

          newState = Object.keys(newState)
            .filter(key => key !== EPSILON)
            .reduce((acc, cur) => ({ ...acc, [cur]: newState[cur] }), {});

          newState = joinStateObj([newState, otherStatesJoin]);
        }

        afjdMachine[stateId] = newState;
      }
    });

    nextStates = tempStates;
  }

  return { machine: afjdMachine, machineEnds };
}

export function toAfd(machine, initialId, machineEnds) {
  let afdMachine = { [initialId]: {} };
  let nextStates = [initialId];

  while (nextStates.length > 0) {
    const tempStates = [];

    nextStates.forEach(stateId => {
      let state = machine[stateId];
      const stateSplit = stateId.split(',');

      if (stateSplit.length > 1) {
        state = joinStates(machine, stateSplit);
      }

      Object.keys(state).forEach(transitionKey => {
        const newState = state[transitionKey].join(',');

        if (!afdMachine[newState]) {
          afdMachine[newState] = {};
          tempStates.push(newState);
        }

        afdMachine[stateId][transitionKey] = [newState];
      });
    });

    nextStates = tempStates;
  }

  //Machine ends without ','
  const newEnds = [];

  Object.keys(afdMachine).forEach(stateId => {
    const split = stateId.split(',');
    const isEnd = split.some(el => machineEnds.indexOf(el) !== -1);

    if (isEnd) {
      newEnds.push(split.join(''));
    }
  });

  //Remove ','
  afdMachine = Object.keys(afdMachine).reduce(
    (acc, cur) => ({
      ...acc,
      [cur.split(',').join('')]: Object.keys(afdMachine[cur]).reduce(
        (keys, key) => ({
          ...keys,
          [key]: afdMachine[cur][key].map(val => val.split(',').join(''))
        }),
        {}
      )
    }),
    {}
  );

  return { machine: afdMachine, machineEnds: newEnds };
}
