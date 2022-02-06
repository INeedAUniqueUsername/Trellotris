import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Trello.css'
import reportWebVitals from './reportWebVitals';


const width = 12
const height = 10
const CARDS = [
  "Fix crash",
  "Write unit tests",
  "Implement boring transition",
  "Investigate mysterious bug",
  "Refactor unnecessary feature",
  "Fix compile error",
  "Test critical performance",
  "Rewrite module in Python",
  "Remove API key from GitHub",
  "Prepare Docker container",
  "Update YAML file",
]
function getCard() {
  return CARDS[Math.floor(Math.random() * CARDS.length)]
}

const isInBounds = (p) => p.x > -1 && p.x < width && p.y > -1 && p.y < height;
const isInX = (p) => p.x > -1 && p.x < width;
const isInY = (p) => p.y > -1 && p.y < height;
const isOpen = (p, blocks) => !blocks[p.x][p.y]
class Tetra {
  constructor(pos, tiles) {
    this.pos = pos
    this.tiles = tiles
    this.cards = [getCard(), getCard(), getCard(), getCard()]
  }
  getPoints = () =>
    this.tiles.map(t => ({
        x:t.x + this.pos.x,
        y:t.y + this.pos.y
      }))
  moveUp = (blocks) => {
    this.pos.y++;
    for(var p of this.getPoints()){
      if(!isInBounds(p) || !isOpen(p, blocks)){
        this.pos.y--;
        return false
      }
    }
    return true
  }
  moveDown = (blocks) => {
    this.pos.y--;
    for(var p of this.getPoints()){
      if(!isInBounds(p) || !isOpen(p, blocks)){
        this.pos.y++;
        return false
      }
    }
    return true
  }
  moveRight = (blocks) => {
    this.pos.x++;
    for(var p of this.getPoints()){
      if(!isInBounds(p) || !isOpen(p, blocks)){
        this.pos.x--;
        return false
      }
    }
    return true
  }
  flip = (blocks) => {
    var next = this.tiles.map(t => ({x: t.x, y:-t.y}))
    for(var t of next){
      var p = {x:t.x + this.pos.x, y:t.y + this.pos.y}
      if(!isInX(p) || (isInY(p) && !isOpen(p, blocks))){
        return false
      }
    }
    this.tiles = next
    return true
  }

  turnLeft = (blocks) => {
    var next = this.tiles.map(t => ({x: -t.y, y:t.x}))
    for(var t of next){
      var p = {x:t.x + this.pos.x, y:t.y + this.pos.y}
      if(!isInX(p) || (isInY(p) && !isOpen(p, blocks))){
        return false
      }
    }
    this.tiles = next
    return true
  }
  
  turnRight = (blocks) => {
    var next = this.tiles.map(t => ({x: t.y, y:-t.x}))
    for(var t of next){
      var p = {x:t.x + this.pos.x, y:t.y + this.pos.y}
      if(!isInX(p) || (isInY(p) && !isOpen(p, blocks))){
        return false
      }
    }
    this.tiles = next
    return true
  }
  place = (a) => {
    let i = 0;
    for(var p of this.getPoints()){
      if(!isInBounds(p)){
        continue;
      }
      a[p.x][p.y] = this.cards[i++]
    }
  }
  fall = (a) => {
    for(var p of this.getPoints()){
      if(!isInBounds(p)){
        continue;
      }
      if(p.x == width - 1){
        return false;
      }
      if(a[p.x + 1][p.y]) {
        return false
      }
    }
    this.pos.x++;
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
  const L2 = (pos) => new Tetra(pos, [
    p(0, 1),
    p(0, 0),
    p(0, -1),
    p(-1, -1)
  ]);

const I = (pos) => new Tetra(pos, [
  p(0, 1),
  p(0, 0),
  p(0, -1),
  p(0, -2)
]);

const S = (pos) => new Tetra(pos, [
  p(0, 1),
  p(0, 0),
  p(-1, 0),
  p(-1, -1)
]);
const S2 = (pos) => new Tetra(pos, [
  p(-1, 1),
  p(-1, 0),
  p(0, 0),
  p(0, -1),
]);
const O = (pos) => new Tetra(pos, [
  p(0, 1),
  p(0, 0),
  p(-1, 1),
  p(-1, 0)
]);
const T = (pos) => new Tetra(pos, [
  p(0, 0),
  p(-1, 0),
  p(1, 0),
  p(0, 1)

])
const MODE_PLAY = 1, MODE_GAME_OVER = 2
class Game extends React.Component {
  constructor(props) {
    super(props);
    var t = true
    var f = false
    this.state = {
      mode: MODE_PLAY,
      tetra: null,
      blocks:Array(width).fill().map((_, x) => Array(height).fill(false)),
      score: 0,
      highScore: 0,
      moveUp: false,
      moveDown: false,
      moveRight:false,
      flip:false,
      turnLeft: false,
      turnRight: false,
      hardDrop:false,
    };
    this.keylisten = ({ key }) => {
      console.log(String(key))
      if(key === "q"){
        this.setState({turnLeft:true})
      } else if(key === "Q"){
        this.setState({flip:true})
      } else if(key === "e"){
        this.setState({turnRight:true})
      } else if(key === "E"){
        this.setState({flip:true})
      } else if(key === "w"){
        this.setState({moveUp:true})
      } else if(key === "s"){
        this.setState({moveDown:true})
      } else if(key === "d"){
        this.setState({moveRight:true})
      } else if(key === "D"){
        this.setState({hardDrop:true})
      }
    }
  }
  componentDidMount(){
    this.updateTimer = setInterval(
      () => this.update(),
      800
    );
    this.updateTurnTimer = setInterval(
      () => this.updateTurn(),
      200
    );

    document.addEventListener("keydown", this.keylisten, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.keylisten, false);
    clearInterval(this.updateTimer);
    clearInterval(this.updateTurnTimer);
  }
  updateTurn(){
    this.setState((state, props) => {
      var { mode, tetra, blocks, moveUp, moveDown, flip, moveRight, hardDrop, turnLeft, turnRight } = this.state
      if(tetra){
        if(moveUp){
          tetra.moveUp(blocks)
        }
        if(moveDown){
          tetra.moveDown(blocks)
        }
        if(moveRight){
          tetra.moveRight(blocks)
        }
        if(flip) {
          tetra.flip(blocks)
        }
        if(turnLeft){
          tetra.turnLeft(blocks)
        }
        if(turnRight){
          tetra.turnRight(blocks)
        }
        if(hardDrop){
          while(tetra.moveRight(blocks));
        }
      }
      return {
        moveUp: false,
        moveDown: false,
        moveRight:false,
        flip:false,
        hardDrop:false,
        turnLeft: false,
        turnRight: false
      }
    });
  }
  update() {
    const {mode} = this.state
    if(mode === MODE_PLAY){
      this.setState((state, props) => {
        var { mode, tetra, blocks, score, highScore } = this.state
        if(tetra){

          if(!tetra.fall(blocks)){
            tetra.place(blocks)

            for(var t of tetra.getPoints()){
              if(!isInBounds(t)) {
                this.setState({mode: MODE_GAME_OVER,
                  highScore: Math.max(score, highScore)
                });
              }
            }
            tetra = null;
          }
        } else {
          let points = 1
          for(let x = 0; x < width; x++){
            var b = true
            for(let y = 0; y < height; y++){
              if(!blocks[x][y]) {
                b = false
              }
            }
            if(b){
              for(let y = 0; y < height; y++){
                blocks[x][y] = false
              }
              for(let x2 = x; x2 > 0; x2--){
                for(let y = 0; y < height; y++){
                  blocks[x2][y] = blocks[x2 - 1][y]
                }
              }
              this.setState({ score: this.state.score + points })
              points++
            }
          }
          var f = [L, I, S, O, T][Math.floor(Math.random() * 5)]
          tetra = f(p(-1, height/2))
        }
        return {
          mode: mode,
          tetra: tetra,
          blocks: blocks,
        }
      });
      
    } else if(mode === MODE_GAME_OVER) {
      var { blocks } = this.state
      for(let x = width - 1; x > 0; x--){
        for(let y = 0; y < height; y++){
          blocks[x][y] = blocks[x - 1][y]
          blocks[x - 1][y] = null
        }
      }
    }
  }
  render() {
    const {tetra, blocks} = this.state
    var apparent = blocks.map(a => {return {...a}})
    if(tetra) {
      tetra.place(apparent)
    }
    return (
      <div style={{margin:"0px", backgroundImage:"url(https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2048x1152/e88cf820526ba3344d163ee0521d3ae4/photo-1591989600120-ac94311508ce.jpg)"}}>
        
        <div dangerouslySetInnerHTML={{__html:``}}/>
        
        <div className="top">
          <div className="separate"></div>
          <h2>Trello</h2>
          <div className="separate"></div>
          <p>Workspaces</p>
          <div className="separate"></div>
          <p>Recent</p>
          <div className="separate"></div>
          <p>Starred</p>
          <div className="separate"></div>
          <p>Templates</p>
        </div>
        <div className="second">
          <div className="separate"></div>
          <div className="separate"></div>
          <p>Board</p>
          <div className="separate"></div>
          <p>R&amp;D</p>
          <div className="separate"></div>
          <p>Workspace visible</p>
          <div className="separate"></div>
          <p>+Invite</p>
          <div className="separate"></div>
          <p>Score: {this.state.score}</p>
          {this.state.highScore > 0 && 
          [<div className="separate"></div>,
          <p>High score: {this.state.highScore}</p>]}
          {this.state.mode === MODE_GAME_OVER && [
            <div className="separate"></div>,
            <p>Game over!</p>,
            <div className="separate"></div>,
            <b onClick={() => {this.setState({mode:MODE_PLAY, score:0})}}>Reset</b>
          ]}
        </div>
        <div style={{ overflowX:"scroll", whiteSpace:"nowrap", width:"100%"  }}>
          {apparent && Array(width).fill().map((_, x) =>{
            
            return [<div className="separator"></div>, <div className="column">
              <h4 style={{marginLeft:"24px"}}>{[
                
                "Won't fix", "Low priority", "Backlog 3", "Backlog 2", "Backlog 1", "To do",
                "Doing", "Waiting for PR", "Reviewed", "Done", "Deployed", "Live"
              ][x]}</h4>
              <div>

                {Array(height).fill().map((_, y) => {
                  var col = apparent[x]
                  var b = col[height - y - 1] 
                  if(b){
                    return <div className="card"><p>{b}</p></div>
                  } else {
                    return <pre className="empty"> </pre>
                  }
                })}
                
                <pre className="edge"> </pre>
              </div>
            </div>]
          })}
          <div className="separator"></div>
        </div>
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
