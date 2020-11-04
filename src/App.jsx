import './App.css'
import React from 'react';
import Tile from './Tile';
import reducer from "./reducer";
import { loadState, saveState } from './storage';

const initialState = {
  size: 4,
  score: 0,
  bestScore: 0,
  biggest: 0,
  grid: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ]
}

const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { size, grid, score, bestScore, biggest } = state;
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
    const cachedState = loadState();
    if (cachedState) {
       dispatch({ type: 'setState', payload: cachedState });
    } else {
      dispatch({ type: 'addRandomTile' });
    }
    const dispatchMove = (direction) => {
      dispatch({ type: 'prepareTiles' });
      setTimeout(() => dispatch({ type: 'move', payload: direction }), 0)
    }
    const handler = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          dispatchMove('up')
          break;
        case 'ArrowRight':
          dispatchMove('right')
          break;
        case 'ArrowDown':
          dispatchMove('down')
          break;
        case 'ArrowLeft':
          dispatchMove('left')
          break;
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [])
  React.useEffect(() => {
    saveState(state);
  }, [state])
  React.useEffect(() => {
    //TODO 判断2048
  }, [state.score])
  const handleRestart = () => {
    dispatch({ type: 'restart' });
  }
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
      <div className="heading">
        <div className="btn-reset" onClick={handleRestart}>重&nbsp;&nbsp;来</div>
        <div className="pane-score">
          <div className="score-label">得分</div>
          <div className="score">{score}</div>
        </div>
        <div className="pane-score">
          <div className="score-label">最高得分</div>
          <div className="score">{bestScore}</div>
        </div>
      </div>
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
