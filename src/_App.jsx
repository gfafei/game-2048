import './App.css'
import React from 'react';
import Color from 'color';
import uuid from './uuid';

const TILE_SIZE = 106;
const TILE_MARGIN = 15;

const specialColors = [
  [false, false], //2
  [false, false],
  ['#f78e48', true], //4
  ['#fc5e2e', true], //8
  ['#ff3333', true], //16
  ['#ff0000', true], //32
  [false, true], //128
  [false, true], //256
  [false, true], //512
  [false, true], //1024
  [false, true], //2048
]
const tileGoldColor = '#edc22e';
const tileColor = '#eee4da';

const mix = (color1, color2, weight) => {
  const c1 = Color(color1);
  const c2 = Color(color2);

  return c2.mix(c1, weight);
}

const getStyle = (value) => {
  let color = '#776e65';
  const exponent = Math.log(value) / Math.log(2);
  const goldPercent = (exponent - 1) / 10;
  let backgroundColor = mix(tileGoldColor, tileColor, goldPercent);
  const nthColor = specialColors[exponent - 1];
  const specialBackground = nthColor[0]
  const isBright = nthColor[1]
  if (specialBackground) {
    backgroundColor = mix(specialBackground, backgroundColor, 0.55);
  }
  if (isBright) {
    color = '#f9f6f2';
  }

  return { color, backgroundColor }
}
const Tile = (props) => {
  const { tile } = props;
  const { value } = tile;
  const style = getStyle(value);

  const pos = {
    transform: `translate(${tile.col * (TILE_SIZE + TILE_MARGIN)}px, ${tile.row * (TILE_SIZE + TILE_MARGIN)}px)`,
  }

  return (
    <div className={`tile${tile.isMerged ? ' tile-merged' : ''}${tile.isNew ? ' tile-new' : ''}`} style={pos}>
      <div className="tile-inner" style={style}>
        {value}
      </div>
    </div>
  );
}

const initialState = {
  size: 4,
  grid: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ]
}

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

const move = (grid, rotate, reverse) => {
  const size = grid.length;
  for (let i = 0; i < size; i++) {
    let flag = false;
    const from = reverse ? size - 1 : 0;
    const to = reverse ? 0 : size - 1;
    const step = reverse ? -1 : 1;
    let j = from;
    const row = rotate ? j : i;
    const col = rotate ? i : j;
    const prop = rotate ? 'row' : 'col';
    let condition = reverse ? j >= 0 : j <= size - 1;
    while (condition) {
      if (grid[row][col]) {

      }
      j += step;
    }
  }
}
const reducer = (state, action) => {
  const { size, grid } = state;
  switch (action.type) {
    case 'addRandomTile':
      addRandomTile(grid)
      return { ...state, grid }
    case 'moveUp':
      for (let i = 0; i < size; i++) {
        let flag = false;
        for (let j = 0; j < size ; j++) {
          if (grid[j][i] && j > 0) {
            const tile = grid[j][i];
            let v = grid[j][i].value;
            for (let k = tile.row - 1; k >= 0; k--) {
              if (!grid[k][i]) tile.row = k;
              if (grid[k][i]) {
                if (grid[k][i].value === v && !flag) {
                  tile.row = k;
                  tile.value *= 2;
                  tile.isMerged = true;
                  flag = true;
                } else {
                  break;
                }
              }
            }
            if (tile.row !== j) {
              grid[tile.row][i] = tile;
              grid[j][i] = null;
            }
          }
        }
      }
      addRandomTile(grid)
      return { ...state, grid };
    case 'moveRight':
      for (let i = 0; i < size; i++) {
        const row = grid[i];
        let flag = false;
        for (let j = size - 1; j >= 0; j--) {
          if (row[j] && j < size - 1) {
            const tile = row[j]
            for (let k = j + 1; k < size ; k++) {
              if (!row[k]) tile.col = k;
              if (row[k]) {
                if (row[k].value === tile.value && !flag) {
                  tile.col = k;
                  row[k].value *= 2;
                  row[k].isMerged = true;
                  flag = true;
                } else {
                  break;
                }
              }
            }
          }
        }
      }
      addRandomTile(grid)
      return { ...state, grid };
    case 'moveDown':
      for (let i = 0; i < size; i++) {
        let flag = false;
        for (let j = size - 1; j >= 0; j--) {
          if (grid[j][i] && j < size - 1) {
            const tile = grid[j][i];
            for (let k = j + 1; k < size; k++) {
              if (!grid[k][i]) tile.row = k;
              if (grid[k][i]) {
                if (grid[k][i].value === tile.value && !flag) {
                  tile.row = k;
                  grid[k][i].value *= 2;
                  grid[k][i].isMerged = true;
                  flag = true;
                } else {
                  break;
                }
              }
            }
          }
        }
      }
      addRandomTile(grid)
      return { ...state, grid };
    case 'moveLeft':
      for (let i = 0; i < size; i++) {
        const row = grid[i];
        let flag = false;
        for (let j = 0; j < size; j++) {
          if (row[j] && j > 0) {
            const tile = row[j]
            for (let k = j - 1; k >= 0; k--) {
              if (!row[k]) {
                tile.col = k;
              }
              if (row[k]) {
                if (row[k].value === tile.value && !flag) {
                  tile.col = k;
                  tile.value *= 2;
                  flag = true;
                }
                break;
              }
            }
            if (tile.col !== j) {
              if (!row[tile.col]) {
                row[tile.col] = tile;
              } else {
                row[tile.col].isMerged = true;
                row[tile.col].value *= 2;
                row[tile.col].from = tile;
              }
              row[j] = null;
            }
          }
        }
      }
      addRandomTile(grid)
      return { ...state, grid };
    default:
      return state;
  }
}
const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState, undefined);
  const { size, grid } = state;
  const cells = React.useMemo(() => {
    let res = [];
    for (let i = 0; i < Math.pow(state.size, 2); i++) {
      res.push(
        <div key={i} className="grid-cell"/>
      )
    }
    return res;
  }, [size]);

  React.useEffect(() => {
    const handler = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          dispatch({ type: 'moveUp' });
          break;
        case 'ArrowRight':
          dispatch({ type: 'moveRight' })
          break;
        case 'ArrowDown':
          dispatch({ type: 'moveDown' })
          break;
        case 'ArrowLeft':
          dispatch({ type: 'moveLeft' })
          break;
      }
    }
    window.addEventListener('keydown', handler)
    dispatch({ type: 'addRandomTile' });
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [])
  const tiles = [];
  grid.forEach(row => {
    row.forEach(tile => {
      if (tile) {
        tiles.push(<Tile key={tile.id} tile={tile}/>)
      }
    })
  })
  return (
    <div className="app">
      <div className="board-container">
        <div className="grid-container">
          {cells}
        </div>
        <div className="tiles-container">{tiles}</div>
      </div>
    </div>
  )
}

export default App;
