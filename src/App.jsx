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
  let fontSize = 55;
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
  if (value >= 100) {
    fontSize = 45
  }
  if (value >= 1000) {
    fontSize = 35
  }

  return { color, backgroundColor, fontSize }
}
const Tile = (props) => {
  const { tile } = props;
  const [value, setValue] = React.useState(tile.value)
  const style = getStyle(value);
  const ref = React.useRef(null);

  const pos = {
    transform: `translate(${tile.col * (TILE_SIZE + TILE_MARGIN)}px, ${tile.row * (TILE_SIZE + TILE_MARGIN)}px)`,
  }

  React.useEffect(() => {
    setTimeout(() => setValue(tile.value), 100)
  }, [tile.value])
  return (
    <div id={tile.id} ref={ref} className={`tile${tile.isMerged ? ' tile-merged' : ''}${tile.isNew ? ' tile-new' : ''}`} style={pos}>
      <div className="tile-inner" style={style}>
        {value}
      </div>
    </div>
  );
}

const initialState = {
  size: 4,
  grid: [
    [{ id: uuid(), row: 0, col: 0, value: 2 }, null, null, null],
    [{ id: uuid(), row: 1, col: 0, value: 2 }, null, null, null],
    [{ id: uuid(), row: 2, col: 0, value: 2 }, null, null, null],
    [{ id: uuid(), row: 3, col: 0, value: 2 }, null, null, null]
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

const move = (grid, direction) => {
  const size = grid.length;
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
}
const reducer = (state, action) => {
  const { grid } = state;
  switch (action.type) {
    case 'addRandomTile':
      addRandomTile(grid)
      return { ...state, grid }
    case 'moveUp':
      move(grid, 'up');
      addRandomTile(grid)
      return { ...state, grid };
    case 'moveRight':
      move(grid, 'right')
      addRandomTile(grid)
      return { ...state, grid };
    case 'moveDown':
      move(grid, 'down')
      addRandomTile(grid)
      return { ...state, grid };
    case 'moveLeft':
      move(grid, 'left')
      addRandomTile(grid)
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
    const dispatchMove = (direction) => {
      dispatch({ type: 'prepareTiles' });
      setTimeout(() => dispatch({ type: `move${direction}` }), 0)
    }
    const handler = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          dispatchMove('Up')
          break;
        case 'ArrowRight':
          dispatchMove('Right')
          break;
        case 'ArrowDown':
          dispatchMove('Down')
          break;
        case 'ArrowLeft':
          dispatchMove('Left')
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
        if (tile.before) {
          tiles.push(<Tile key={tile.before.id} tile={tile.before}/>)
        }
        tiles.push(<Tile key={tile.id} tile={tile}/>)
        if (tile.after) {
          tiles.push(<Tile key={tile.after.id} tile={tile.after}/>)
        }
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
