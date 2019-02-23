export default function formatToGrid(machine, initialId) {
  const grid = [[initialId]];
  const lines = [];

  const usedIds = { [initialId]: true };
  let column = 0;

  while (grid[column]) {
    const columnStates = grid[column];

    columnStates.forEach(machineKey => {
      usedIds[machineKey] = true;

      const transitionConfig = machine[machineKey];

      Object.keys(transitionConfig).forEach(transitionKey => {
        transitionConfig[transitionKey].forEach(nextState => {
          const duplicateIndex = lines.findIndex(
            line => line.start === machineKey && line.end === nextState
          );

          if (duplicateIndex === -1) {
            lines.push({
              start: machineKey,
              end: nextState,
              keys: [transitionKey]
            });
          } else if (lines[duplicateIndex].keys.indexOf(transitionKey) === -1) {
            lines[duplicateIndex].keys.push(transitionKey);
          }

          if (!usedIds[nextState]) {
            usedIds[nextState] = true;

            if (!grid[column + 1]) {
              grid[column + 1] = [];
            }

            grid[column + 1].push(nextState);
          }
        });
      });
    });

    column++;
  }

  return { grid, lines };
}
