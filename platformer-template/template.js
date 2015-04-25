function Thing(board, x, y) {
  this.x = x;
  this.y = y;
  this.board = board;
  this.step = null;

  this.turn = function() {}

  this.canMoveUp = function() {
    var varCanMoveUp = true
    for (var i = 0; i <= this.width + 1; i++) {
      if (this.board.isBlocked(this.x + i, this.y - 1)) {
        varCanMoveUp = false;
      }
    }
    return (varCanMoveUp);
  }

  this.falling = function() {
    return !this.onGround()
  }

  this.onGround = function() {
    var onGround = false
    for (var i = 0; i <= this.width + 1; i++) {
      if (this.board.isBlocked(this.x + i, this.y + this.height + 1)) {
        onGround = true;
      }
    }
    return (onGround);
  }

  this.againstLeftLine = function() {
    var avaliableSteps = 0;
    var varLeftLine = false
    for (var i = 1; i <= 4; i++) {
      for (var j = 0; j <= this.height; j++) {
        if (this.board.isBlocked(this.x - i, this.y + j)) {
          if (!this.board.isBlocked(this.x - avaliableSteps, this.y + j)) {
            avaliableSteps += 1
          }
        }
        if (this.board.isBlocked(this.x - i, this.y + j)) {
          var used = avaliableSteps
          this.getClose(used)
          avaliableSteps = 0
          varLeftLine = true;
          break;
        }
      }
    }
    return (varLeftLine);
  }

  this.againstRightLine = function() {
    var avaliableSteps = 0;
    var varRightLine = false
    for (var i = 1; i <= 4; i++) {
      for (var j = 0; j <= this.height; j++) {
        if (this.board.isBlocked(this.x + this.width + i, this.y + j)) {
          if (!this.board.isBlocked(this.x + this.width + avaliableSteps, this.y + j)) {
            avaliableSteps += 1
          }
        }
        if (this.board.isBlocked(this.x + this.width + i, this.y + j)) {
          var used = avaliableSteps
          this.getClose(used)
          avaliableSteps = 0
          varRightLine = true;
          break;
        }
      }
    }
    return (varRightLine);
  }

  this.getClose = function(steps, direction) {
    if (steps < 0 && direction === "left") {
      steps *= -1
      this.x -= (steps - 1)
    } else if (steps > 0 && direction === "right") {
      steps *= 1
      this.x += (steps + this.width - 1)
    }
  }

  this.within = function(thing) {
    if ((this.x - thing.width + 1 <= thing.x && this.x + this.width - 1 >= thing.x) &&
    (this.y - thing.height + 1 <= thing.y && this.y + this.height - 1 >= thing.y)) {
      return true;
    } else {
      return false;
    }
  }
} // end of Thing

function getMilliseconds() {
  return new Date().getTime();
}


function Man(board, x, y, height, width, colour) {
  this.x = x;
  this.y = y - height;
  this.board = board;
  this.lineAbove = false;
  this.lineBelow = false;
  this.height = height;
  this.width = width;
  this.colour = colour
  this.vForce = null;
  this.xChange = 0;
  this.lastXChange = 1;
  this.step = 4;

  this.draw = function() {
    //body
    this.board.context.fillStyle = this.colour;
    this.board.context.fillRect(this.x, this.y, this.width, this.height)
  }

  this.turn = function() {
    // look above us
    if (this.vForce > 0 && this.canMoveUp()) {
      // move to the positon unless we hit something first
      var pointsToMove = Math.round(this.vForce * .4);
      for (var i = 0; i < pointsToMove; i += 1) {
        if (this.canMoveUp()) {
          this.y -= pointsToMove / 20;
        } else {
          this.vForce = null;
        }
      }
      this.vForce -= 1;
    } else if (this.falling()) {
      // if we are falling
      if (this.vForce === null);
      this.vForce = 0;
      this.vForce += 1;
      var pointsToMove = Math.round(this.vForce * .7);
      for (var i = 0; i < pointsToMove; i += 0.25) {
        if (this.falling()) {
          this.y += pointsToMove;
        } else {
          this.vForce = null;
        }
      }
    } else {
      this.vForce = null;
    }
    if ((this.xChange < 0 && !this.againstLeftLine()) ||
    (this.xChange > 0 && !this.againstRightLine())) {
      this.x += this.xChange * this.step;
    }
    this.xChange = 0;
  }

  this.jump = function() {
    if (this.vForce == null)
      this.vForce = 30;
    }

  this.moveleft = function() {
    this.xChange = -1;
    this.lastXChange = -1;
  }

  this.moveright = function() {
    this.xChange = 1;
    this.lastXChange = 1;
  }

  this.restart = function() {
    this.x = board.width / 2 - 10;
    this.y = board.height - 2 - this.height;
    this.board = board;
    this.lineAbove = false;
    this.lineBelow = false;
    this.height = height;
    this.width = width;
    this.vForce = null;
    this.xChange = 0;
    this.lastXChange = 1;
  }
}

Man.prototype = new Thing()

function Line(board, x, y, width, height) {
  this.board = board
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.draw = function() {
    this.board.context.fillStyle = "black";
    this.board.context.fillRect(this.x, this.y, this.width, this.height)
  }
}

Line.prototype = new Thing()

function Board(width, height, pixelWidth, context) {
  this.width = width;
  this.height = height;
  this.pixelWidth = pixelWidth;
  this.context = context;
  this.things = new Array()
  this.context.canvas.width = width;
  this.context.canvas.height = height;
  this.context.canvas.style.width = '' + (width * pixelWidth)  + 'px';
  this.context.canvas.style.height = '' + (height * pixelWidth) + 'px';
  this.keyMap = [];
  this.man = null;
  this.lines = [];
  this.elevators = []
  this.spikes = []

  this.add = function(thing) {
    this.things.push(thing);
  }

  this.remove = function(thing) {
    var index = this.things.indexOf(thing)
    if (index > -1) {
      this.things.splice(index, 1);
    }
  }

  this.addMan = function(man) {
    this.man = man;
  }

  this.addLines = function(line) {
    this.lines.push(line);
    this.add(line);
  }

  this.drawCells = function() {
    this.clearBoard()
    for (var i = 0; i< this.things.length; i++) {
      this.things[i].draw()
    }
  }

  this.clearBoard = function() {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  this.isBlocked = function(x, y) {
    for (var i = 0; i < this.lines.length; i++) {
      if ((x >= this.lines[i].x && x <= (this.lines[i].x + this.lines[i].width)) &&
        (y >= this.lines[i].y && y <= (this.lines[i].y + this.lines[i].height))) {
          return true;
        }
      }
      return false;
    }

    this.turn = function() {
      for (var i = 0; i < this.things.length; i++) {
        this.things[i].turn()
      }
      if (this.keyMap['38']) {
        this.man.jump();
      }
      if (this.keyMap['37']) {
        this.man.moveleft();
      }
      if (this.keyMap['39']) {
        this.man.moveright();
      }
      if (this.keyMap['82']) {
        restart();
      }
    }

    this.keyUpDown = function(e){
      e = e || event; // to deal with IE
      board.keyMap[e.keyCode] = e.type == 'keydown';
    }
  }

  var getBoard = function() {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    return(new Board(1000, 500, 1, context));
  }

  var board = null;

var start = function() {
  board = getBoard()//new Board(1000, 500, 1, context);

  var line = new Line(board, board.width / 2 - 240, board.height - 20, 25, 5)
  var line2 = new Line(board, board.width / 2 - 180, board.height - 50, 25, 5)
  var line3 = new Line(board, board.width / 2 - 110, board.height - 80, 25, 5)
  var line4 = new Line(board, board.width / 2 - 60, board.height - 110, 25, 5)
  var line5 = new Line(board, board.width / 2, board.height - 140, 25, 5)
  var line6 = new Line(board, board.width / 2 + 60, board.height - 170, 25, 5)
  var line7 = new Line(board, board.width / 2 + 180, board.height - 175, 25, 5)
  var line8 = new Line(board, board.width / 2 + 280, board.height - 210, 25, 5)
  var lineblock = new Line(board, board.width / 2 + 380, board.height - 240, 80, 220)
  var linecave = new Line(board, board.width / 2 + 450, board.height - 50, 10, 50)

  var block = new Line(board, 0, board.height - 120, 50, 120)
  var block2 = new Line(board, 40, board.height - 80, 50, 80)
  var block3 = new Line(board, 80, board.height - 40, 50, 40)

  var top = new Line(board, 0, 0, board.width, 1)
  var bottom = new Line(board, 0, board.height - 1, board.width, 1)
  var left = new Line(board, 0, 0, 1, board.height)
  var right = new Line(board, board.width - 1, 0, 1, board.height)

  var man = new Man(board, board.width / 2 - 10, board.height - 2 - 10, 16, 9, "blue")

  board.add(man);
  board.addMan(man);

  board.addLines(line);
  board.addLines(line2);
  board.addLines(line3);
  board.addLines(line4);
  board.addLines(line5);
  board.addLines(line6);
  board.addLines(line7);
  board.addLines(line8);
  board.addLines(lineblock);
  board.addLines(linecave);

  board.addLines(block);
  board.addLines(block2);
  board.addLines(block3);

  board.addLines(top);
  board.addLines(bottom);
  board.addLines(left);
  board.addLines(right);


  document.onkeydown = board.keyUpDown;
  document.onkeyup = board.keyUpDown;

  setInterval(function() {
    board.drawCells();
  }, 1000 / 60);

  setInterval(function() {
    board.turn()
  }, 1000 / 60);
}

var restart = function() {
  board.man.restart()
}
