export function isAfjd(machine) {
  return Object.keys(machine).some(machineKey =>
    Object.keys(machine[machineKey]).some(
      transitionKey => machine[machineKey][transitionKey].length > 1
    )
  );
}

const joinStates = (machine, states) =>
  states.reduce((mergedState, stateId) => {
    const temp = {};

    Object.keys(machine[stateId]).forEach(key => {
      if (mergedState[key]) {
        temp[key] = mergedState[key].concat(machine[stateId][key]);
      } else {
        temp[key] = machine[stateId][key];
      }
    });

    return { ...mergedState, ...temp };
  }, {});

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

  return { afdMachine, machineEnds: newEnds };
}
