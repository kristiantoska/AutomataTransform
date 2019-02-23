export default function linePath(line, start, end, shift) {
  const curveShift = {
    x: 0,
    y: 0
  };

  if (start.x === end.x) {
    curveShift.x = start.y < end.y ? shift : -shift;
  } else {
    curveShift.y = start.x > end.x ? shift : -shift;
  }

  let path = '';

  if (line.start === line.end) {
    path = `
        M${start.x} ${start.y} 
        C${start.x - 2 * shift} ${start.y - 2 * shift} ${end.x + 2 * shift} ${end.y - 2 * shift}
        ${end.x} ${end.y}`;
  } else {
    path = `
        M${start.x} ${start.y} 
        Q${(start.x + end.x) / 2 + curveShift.x} ${(start.y + end.y) / 2 + curveShift.y} 
        ${end.x} ${end.y}`;
  }

  return path;
}
