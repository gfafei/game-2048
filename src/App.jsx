import React from 'react'
import {hot} from "react-hot-loader";
import './App.css'
import Color from 'color'

const tileGoldColor = Color('#edc22e')
const tileColor = Color('#eee4da')

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
const App = () => {
  const array = [];
  for (let i = 1; i <= 11; i++) {
    let color = '#333'
    const value = Math.pow(2, i + 1);
    const goldPercent = (i - 1) / (10)
    let backgroundColor = tileColor.mix(tileGoldColor, goldPercent);
    const nthColor = specialColors[i - 1]
    const specialBackground = nthColor[0]
    const isBright = nthColor[1]

    if (specialBackground) {
      backgroundColor = Color(backgroundColor).mix(Color(specialBackground), 0.55)
    }
    if (isBright) {
      color = '#f9f6f2';
    }
    array.push(
      <div key={i} style={{height: 50, color: color, background: backgroundColor}}>{value}</div>
    )
  }
  return (
    <div className="App">
      {array}
    </div>
  )
}

export default hot(module)(App);
