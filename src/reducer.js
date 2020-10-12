import uuid from "./uuid";

const addRandomTile = (grid) => {
  const size = grid.length;
  const availableCells = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) {
        availableCells.push({ row: i, col: j });
      }
    }
  }
  const randomIdx = Math.floor(Math.random() * availableCells.length);
  const value = Math.random() > 0.25 ? 2 : 4;
  const cell = availableCells[randomIdx];
  grid[cell.row][cell.col] = {
    id: uuid(),
    isNew: true,
    value: value,
    row: cell.row,
    col: cell.col
  }
}

const move = (grid, direction) => {
  const size = grid.length;
  let moved = false;
  const vectors = {
    up: [1, 0],
    right: [0, 1],
    down: [1, 1],
    left: [0, 0]
  }
  const rotate = vectors[direction][0]
  const reverse = vectors[direction][1]
  const getTile = (n1, n2) => rotate ? grid[n2][n1] : grid[n1][n2]
  const setTile = (n1, n2, tile) => rotate ? grid[n2][n1] = tile : grid[n1][n2] = tile
  const prop = rotate ? 'row' : 'col';
  const from = reverse ? size - 2 : 1;
  const step = reverse ? -1 : 1;
  const getJCondition = (n) => reverse ? n >= 0 : n < size;
  const getKCondition = (n) => reverse ? n < size : n >= 0;
  for (let i = 0; i < size; i++) {
    let j = from;
    for (j = from; getJCondition(j); j += step) {
      if (getTile(i, j)) {
        const tile = getTile(i, j)
        for (let k = j - step; getKCondition(k); k -= step) {
          if (!getTile(i, k)) {
            tile[prop] = k;
          } else {
            if (getTile(i, k).value === tile.value && !tile.isMerged) {
              tile[prop] = k;
            } else {
              break;
            }
          }
        }
        if (tile[prop] !== j) {
          moved = true;
          if (!grid[tile.row][tile.col]) {
            grid[tile.row][tile.col] = tile;
          } else {
            grid[tile.row][tile.col].isMerged = true;
            grid[tile.row][tile.col].value *= 2;
            if (reverse) {
              grid[tile.row][tile.col].before = tile;
            } else {
              grid[tile.row][tile.col].after = tile;
            }
          }
          setTile(i, j, null)
        }
      }
    }
  }
  if (moved) {
    addRandomTile(grid)
  }
}
const reducer = (state, action) => {
  const { grid } = state;
  switch (action.type) {
    case 'addRandomTile':
      addRandomTile(grid)
      return { ...state, grid }
    case 'moveUp':
      move(grid, 'up');
      return { ...state, grid };
    case 'moveRight':
      move(grid, 'right')
      return { ...state, grid };
    case 'moveDown':
      move(grid, 'down')
      return { ...state, grid };
    case 'moveLeft':
      move(grid, 'left')
      return { ...state, grid };
    case 'prepareTiles':
      grid.forEach(row => {
        row.forEach(tile => {
          if (tile) {
            delete tile.isNew
            delete tile.isMerged
            delete tile.before
            delete tile.after
          }
        })
      })
      return { ...state, grid }
    default:
      return state;
  }
}

export default reducer;
