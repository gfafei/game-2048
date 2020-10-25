import React from 'react';
import Color from "color";

const tileGoldColor = '#edc22e';
const tileColor = '#eee4da';

const mix = (color1, color2, weight) => {
  const c1 = Color(color1);
  const c2 = Color(color2);

  return c2.mix(c1, weight);
}
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
export default Tile;
