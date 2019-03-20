export const joinStates = (machine, states) =>
  states.reduce((mergedState, stateId) => {
    const temp = {};

    Object.keys(machine[stateId]).forEach(key => {
      if (mergedState[key]) {
        machine[stateId][key].forEach(endState => {
          if (mergedState[key].indexOf(endState) === -1) {
            temp[key] = mergedState[key].concat([endState]);
          }
        });
      } else {
        temp[key] = machine[stateId][key];
      }
    });

    return { ...mergedState, ...temp };
  }, {});

export const joinStateObj = states =>
  states.reduce((mergedState, state) => {
    const temp = {};

    Object.keys(state).forEach(key => {
      if (mergedState[key]) {
        state[key].forEach(endState => {
          if (mergedState[key].indexOf(endState) === -1) {
            temp[key] = mergedState[key].concat([endState]);
          }
        });
      } else {
        temp[key] = state[key];
      }
    });

    return { ...mergedState, ...temp };
  }, {});

export function removeArrDuplicates(arr) {
  return Object.keys(arr.reduce((acc, cur) => ({ ...acc, [cur]: 'true' }), {}));
}
