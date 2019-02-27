export default function (grid, height, width) {
  const coordinates = {};

  let maxColumnLength = 0;
  const colWidth = Math.round(width / grid.length);

  grid.forEach((column, colIndex) => {
    const cellHeight = Math.round(height / column.length);
    maxColumnLength = Math.max(maxColumnLength, column.length);

    column.forEach((cell, cellIndex) => {
      coordinates[cell] = {
        x: Math.round(colWidth * colIndex + colWidth / 2),
        y: Math.round(cellHeight * cellIndex + cellHeight / 2)
      };
    });
  });

  return {
    coordinates,
    radius: Math.min(Math.min(colWidth, height / maxColumnLength) * 0.25, 35)
  };
}
