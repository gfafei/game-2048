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
  React.useEffect(() => {
    return () => {
      console.log('unmounted', tile.value)
    }
  }, [])
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
  tiles: [
    {
      id: uuid(),
      row: 0,
      col: 0,
      value: 2
    },
    {
      id: uuid(),
      row: 0,
      col: 3,
      value: 4
    },
    {
      id: uuid(),
      row: 0,
      col: 2,
      value: 2
    }
  ]
}

const getTileMap = (tiles, size) => {
  const map = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    map.push(row)
    for (let j = 0; j < size; j++) {
      row.push(null)
    }
  }
  tiles.forEach(tile => {
    const {col, row} = tile;
    delete tile.isNew;
    delete tile.isMerged;
    delete tile.from;
    map[row][col] = tile;
  })
  return map;
}
const addRandomTile = (map, tiles, size) => {
  return;
  const availableLength = size * size - tiles.length;
  const randomIdx = Math.floor(Math.random() * availableLength);
  const value = Math.random() > 0.25 ? 2 : 4;

  let idx = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!map[i][j]) {
        idx++;
        if (idx === randomIdx) {
          map[i][j] = {
            id: uuid(),
            isNew: true,
            value: value,
            row: i,
            col: j
          }
        }
      }
    }
  }
}
const getTilesFromMap = (map, size) => {
  const tiles = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (map[i][j]) {
        tiles.push(map[i][j])
        if (map[i][j].from) {
          tiles.push(map[i][j].from)
        }
      }
    }
  }
  return tiles;
}

const reducer = (state, action) => {
  const { size, tiles } = state;
  const map = getTileMap(state.tiles, size);
  switch (action.type) {
    case 'moveUp':
      for (let i = 0; i < size; i++) {
        let flag = false;
        for (let j = 0; j < size ; j++) {
          if (map[j][i] && j > 0) {
            const tile = map[j][i];
            let v = map[j][i].value;
            for (let k = tile.row - 1; k >= 0; k--) {
              if (!map[k][i]) tile.row = k;
              if (map[k][i]) {
                if (map[k][i].value === v && !flag) {
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
              map[tile.row][i] = tile;
              map[j][i] = null;
            }
          }
        }
      }
      addRandomTile(map, tiles, size)
      return { ...state, tiles: getTilesFromMap(map, size) };
    case 'moveRight':
      for (let i = 0; i < size; i++) {
        const row = map[i];
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
      addRandomTile(map, tiles, size)
      return { ...state, tiles: getTilesFromMap(map, size) };
    case 'moveDown':
      for (let i = 0; i < size; i++) {
        let flag = false;
        for (let j = size - 1; j >= 0; j--) {
          if (map[j][i] && j < size - 1) {
            const tile = map[j][i];
            for (let k = j + 1; k < size; k++) {
              if (!map[k][i]) tile.row = k;
              if (map[k][i]) {
                if (map[k][i].value === tile.value && !flag) {
                  tile.row = k;
                  map[k][i].value *= 2;
                  map[k][i].isMerged = true;
                  flag = true;
                } else {
                  break;
                }
              }
            }
          }
        }
      }
      addRandomTile(map, tiles, size)
      return { ...state, tiles: getTilesFromMap(map, size) };
    case 'moveLeft':
      for (let i = 0; i < size; i++) {
        const row = map[i];
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
      addRandomTile(map, tiles, size)
      return { ...state, tiles: getTilesFromMap(map, size) };
    default:
      return state;
  }
}
const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState, undefined);
  const { size, tiles } = state;
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
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [])
  return (
    <div className="app">
      <div className="board-container">
        <div className="grid-container">
          {cells}
        </div>
        <div className="tiles-container">
          {
            tiles.map(tile => <Tile key={tile.id} tile={tile}/>)
          }
        </div>
      </div>
    </div>
  )
}

export default App;
