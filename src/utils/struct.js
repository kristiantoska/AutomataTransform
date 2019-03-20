import { EPSILON } from '../config/symbols';

const checkValues = (...valArray) => {
  const hasEmpty = valArray.some(val => val.trim() === '');

  if (hasEmpty) {
    return 'Fill all fields';
  }

  const hasWeird = valArray.some(val => !val.match(`^[A-z0-9]|${EPSILON}+$`));

  if (hasWeird) {
    return 'ONLY CHARS AND NUMBERS!';
  }

  return '';
};

export const addState = (machine, name, from, key) => {
  const valError = checkValues(name, from, key);

  if (valError) {
    return { error: valError };
  }

  if (machine[name] !== undefined) {
    return { error: 'State Exists!' };
  }

  if (machine[from] === undefined) {
    return { error: 'Beginning state doesnt exist!' };
  }

  return {
    machine: {
      ...machine,
      [from]: { ...machine[from], [key]: (machine[from][key] || []).concat(name) },
      [name]: {}
    }
  };
};

export const removeState = (machine, name, lines, initialId) => {
  const valError = checkValues(name);

  if (valError) {
    return { error: valError };
  }

  if (machine[name] === undefined) {
    return { error: 'State doesnt exist!' };
  }

  if (name === initialId) {
    return { error: 'Cannot remove initial state' };
  }

  const connectedStates = Object.keys(
    Object.keys(machine[name]).reduce((acc, key) => {
      const tmp = { ...acc };
      machine[name][key].forEach(el => (tmp[el] = ''));
      return tmp;
    }, {})
  );

  const brokenStates = connectedStates.filter(
    state => lines.findIndex(line => line.end === state && line.start !== name) === -1
  );

  return {
    machine: Object.keys(machine).reduce((newMachine, state) => {
      if (state === name || brokenStates.indexOf(state) !== -1) {
        return newMachine;
      }

      return {
        ...newMachine,
        [state]: Object.keys(machine[state]).reduce(
          (newKeys, curKey) => ({
            ...newKeys,
            [curKey]: machine[state][curKey].filter(el => el !== name)
          }),
          {}
        )
      };
    }, {})
  };
};

export const addLine = (machine, from, to, key) => {
  const valError = checkValues(from, to, key);

  if (valError) {
    return { error: valError };
  }

  if (machine[from] === undefined) {
    return { error: 'Beginning doesnt exist!' };
  }

  if (machine[to] === undefined) {
    return { error: 'Ending doesnt exist!' };
  }

  return {
    machine: {
      ...machine,
      [from]: { ...machine[from], [key]: (machine[from][key] || []).concat(to) }
    }
  };
};

export const removeLine = (machine, from, to, key, lines, initialId) => {
  const valError = checkValues(from, to, key);

  if (valError) {
    return { error: valError };
  }

  if (machine[from] === undefined) {
    return { error: 'Beginning doesnt exist!' };
  }

  if (machine[to] === undefined) {
    return { error: 'Ending doesnt exist!' };
  }

  if ((machine[from][key] || []).indexOf(to) === -1) {
    return { error: 'Line doesnt exist!' };
  }

  const isToBroken =
    to !== initialId &&
    to !== from &&
    lines.findIndex(line => line.end === to && (line.start !== from || line.keys.length > 1)) ===
      -1;

  return {
    machine: Object.keys(machine).reduce((newMachine, state) => {
      if (state === to && isToBroken) {
        return newMachine;
      }

      if (state === from) {
        return {
          ...newMachine,
          [state]: Object.keys(machine[state]).reduce((newKeys, curKey) => {
            if (curKey === key) {
              if (machine[state][curKey].length === 1) {
                return newKeys;
              }
              return { ...newKeys, [curKey]: machine[state][curKey].filter(end => end !== to) };
            }

            return { ...newKeys, [curKey]: machine[state][curKey] };
          }, {})
        };
      }

      return { ...newMachine, [state]: machine[state] };
    }, {})
  };
};
