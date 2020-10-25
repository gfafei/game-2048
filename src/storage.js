export const loadGrid = () => {
  const string = localStorage.getItem('grid');
  try {
    return JSON.parse(string)
  } catch(e) {
    console.error(e)
    return null;
  }
}
export const saveGrid = (grid) => {
  let size = grid.length;
  let isEmpty = true;
  for(let i = 0; i < size; i++) {
    const row = grid[i];
    for (let j = 0; j < size; j++) {
      if (row[j]) {
        isEmpty = false;
        break;
      }
    }
  }
  if (isEmpty) {
    localStorage.setItem('grid', 'null')
  } else {
    localStorage.setItem('grid', JSON.stringify(grid))
  }
}
