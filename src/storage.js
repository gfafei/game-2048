export const loadState = () => {
  const string = localStorage.getItem('game-state');
  try {
    return JSON.parse(string)
  } catch(e) {
    console.error(e)
    return null;
  }
}
export const saveState = (state) => {
  localStorage.setItem('game-state', JSON.stringify({
    grid: state.grid,
    score: state.score,
    bestScore: state.bestScore
  }))
}
