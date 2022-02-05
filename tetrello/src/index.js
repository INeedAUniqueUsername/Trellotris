import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';


const width = 8
const height = 8

const isInBounds = (p) => p.x > -1 && p.x < width && p.y > -1 && p.y < height;

class Tetra {
  constructor(pos, tiles) {
    this.pos = pos
    this.tiles = tiles
  }
  getPoints = () =>
    this.tiles.map(t => ({
        x:t.x + this.pos.x,
        y:t.y + this.pos.y
      }))
  place = (a) => {
    for(var p of this.getPoints()){
      if(!isInBounds(p)){
        continue;
      }
      a[p.y][p.x] = true
    }
  }
  fall = (a) => {
    for(var p of this.getPoints()){
      if(!isInBounds(p)){
        continue;
      }
      if(p.y == 0){
        return false;
      }
      if(a[p.y - 1][p.x]) {
        return false
      }
    }
    this.pos.y--;
    return true;
  }
}

const p = function(x, y) { return { x:x, y:y }; }
const L = (pos) => new Tetra(pos, [
    p(0, 1),
    p(0, 0),
    p(0, -1),
    p(1, -1)
  ]);

const MODE_IDLE = 0, MODE_FALL = 1
class Game extends React.Component {
  constructor(props) {
    super(props);
    var t = true
    var f = false
    this.state = {
      mode: MODE_IDLE,
      tetra: null,
      blocks:[
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f],
        [f, f, f, f, f, f, f, f]
      ]
    };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState((state, props) => {
      var { mode, tetra, blocks } = this.state
      if(tetra){
        if(!tetra.fall(blocks)){
          tetra.place(blocks)
          tetra = null;
        }
      } else {
        tetra = L(p(4, 10))
      }
      return {
        mode: mode,
        tetra: tetra,
        blocks: blocks
      }
    });
  }
  render() {
    const {tetra, blocks} = this.state
    var apparent = blocks.map(a => {return {...a}})
    if(tetra) {
      tetra.place(apparent)
    }
    return (
      <div>
        <h1>Hello, world!</h1>
        {apparent && Array(width).fill().map((_, x) =>{
          return <div className="column">
            {Array(height).fill().map((_, y) => {
              var row = apparent[height - y - 1]
              if(row[x]){
                return <div className="empty">TRUE</div>
              } else {
                return <div className="empty">.</div>
              }
            })}
          </div>
        })}
      </div>
    );
  }
}
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
