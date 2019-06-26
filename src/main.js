const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const Session = require('./session');
const Client = require('./client');
const http = require ('http');
const path = require('path');
const fs = require('fs');

const http_server = http.createServer((req, res) => {
    // Build file path
    let filePath = path.join(
      __dirname,
      '../',
      req.url === '/' ? './index.html' : req.url
    );

    // Extension of file
    let extname = path.extname(filePath);

    // Initial content type
    let contentType = 'text/html';

    // Check ext and set content type
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
    }

    // Read File
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code == 'ENOENT') {
          // Page not found
          fs.readFile(
            path.join(__dirname, '404.html'),
            (err, content) => {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf8');
            }
          );
        } else {
          //  Some server error
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // Success
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf8');
      }
    });
  });

const PORT = process.env.PORT || 8080;

http_server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//const PubNub = require('pubnub');

context.scale(20, 20);

//
import PubNub from 'pubnub';
var pubnub = new PubNub({
  subscribeKey: "sub-c-c3e9d46a-96af-11e9-ab0f-d62d90a110cf",
  publishKey: "pub-c-d99d7542-4d07-43c0-a3e1-2aee03cf4db8",
  secretKey: "sec-c-ZDc0YjYxNzktOTZlNC00YzFhLWFhZjMtZWUwNzhiZDRiMDUw",
  ssl: true
});

function publish(key) {
  i = 0;
  pubnub = new PubNub({
    publishKey : 'pub-c-d99d7542-4d07-43c0-a3e1-2aee03cf4db8',
    subscribeKey : 'sub-c-c3e9d46a-96af-11e9-ab0f-d62d90a110cf'
  });
  function publishSampleMessage() {
    console.log("1: pub");
    i = 0;
    var publishConfig = {
      channel : "hello_world",
      message : {
        title: key,
        description: "3: pub",
        deleted: true
      }
    };
    pubnub.publish(publishConfig, function(status, response) {
      console.log(status, response);
    });
  }
  pubnub.addListener({
    status: function(statusEvent) {
      if (statusEvent.category === "PNConnectedCategory") {
        i = 0;
        publishSampleMessage();
      }
    },
    message: function(msg) {
      //tetrisStream(msg.message.title);
      console.log("i = " + i);

      //console.log(msg.message.description);
      if(i == 0 ) {
        tetrisStream(msg.message.title);
        console.log(msg.message.title);
        console.log(msg.message.description);
        i++;
      }
    },
    presence: function(presenceEvent) {
    }
  });
  console.log("Subscribing..");
  pubnub.subscribe({
    channels: ['hello_world']
    //callback: tetrisStream(key)
  });
}
function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length -1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount;
  }
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type)
{
  if (type === 'I') {
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ];
  } else if (type === 'L') {
    return [
      [0, 2, 0],
      [0, 2, 0],
      [0, 2, 2],
    ];
  } else if (type === 'J') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [3, 3, 0],
    ];
  } else if (type === 'O') {
    return [
      [4, 4],
      [4, 4],
    ];
  } else if (type === 'Z') {
    return [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'T') {
    return [
      [0, 7, 0],
      [7, 7, 7],
      [0, 0, 0],
    ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
          y + offset.y,
          1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 500;
let i = 0;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
    i = 0;
  }

  lastTime = time;

  draw();
  requestAnimationFrame(update);
}
function tetrisStream(message){
  if(!message) return;
  if (message === 37) {
    playerMove(-1);
  } else if (message === 39) {
    playerMove(1);
  } else if (message === 40) {
    playerDrop();
  } else if (message === 38) {
    playerRotate(1);
  }
}
function updateScore() {
  document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
  publish(event.keyCode, i);
  // if (event.keyCode === 37) {
  //   playerMove(-1);
  // } else if (event.keyCode === 39) {
  //   playerMove(1);
  // } else if (event.keyCode === 40) {
  //   playerDrop();
  // } else if (event.keyCode === 38) {
  //   playerRotate(1);
  // }
});

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
};

playerReset();
updateScore();
update();
