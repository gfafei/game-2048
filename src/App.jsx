import './App.css'
import React from 'react';
import Tile from './Tile';
import reducer from "./reducer";
import { loadGrid, saveGrid } from './storage';

const initialState = {
  size: 4,
  grid: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ]
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
    const cachedGrid = loadGrid();
    if (cachedGrid) {
       dispatch({ type: 'setGrid', payload: cachedGrid });
    } else {
      dispatch({ type: 'addRandomTile' });
    }
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
