function Man(board, x, y, pixelWidth, context, colour) {
  this.x = x;
  this.y = y;
  this.pixelWidth = pixelWidth;
  this.context = context;
  this.colour = colour;
  this.board = board;

  this.draw = function() {
    this.context.fillStyle=this.colour;
    this.context.fillRect((this.x * this.pixelWidth) + 1, (this.y * this.pixelWidth) + 1, this.pixelWidth - 1, this.pixelWidth - 1)
  }

  this.moveup = function() {
    if (this.board.canMoveTo(this.x, this.y - 1))
      this.y -= 1;
  }
  this.movedown = function() {
    if (this.board.canMoveTo(this.x, this.y + 1))
      this.y += 1;
  }
  this.moveleft = function() {
    if (this.board.canMoveTo(this.x - 1, this.y))
      this.x -= 1;
  }
  this.moveright = function() {
    if (this.board.canMoveTo(this.x + 1, this.y))
      this.x += 1;
  }

  this.turn = function() {}
}

function Monster(board, man, x, y, pixelWidth, context, colour)  {
  this.x = x;
  this.y = y;
  this.pixelWidth = pixelWidth;
  this.context = context;
  this.colour = colour;
  this.board = board;
  this.man = man;
  this.counter = 0;
  this.direction = 180;
  this.change_x = 0;
  this.change_y = 0;

  this.turn = function() {
    var moved = false;
    if (this.counter % 4 == 0) {
      this.change_x = 0; this.change_y = 0;
      if ((this.x > this.man.x)) {
          this.change_x = -1;
      }
      if ((this.x < this.man.x)) {
          this.change_x = 1;
      }
      if ((this.y < this.man.y)) {
          this.change_y = 1;
      }
      if ((this.y > this.man.y)) {
          this.change_y = -1;
      }
    }

    if (this.board.canMoveTo(this.x + this.change_x, this.y + this.change_y)) {
      this.x += this.change_x;
      this.y += this.change_y;
      moved = true;
      //this.counter = 0;
    }

    if (!moved) {
      // lets try a random direction
      this.change_y = Math.floor(Math.random() * 3) - 1;
      this.change_x = Math.floor(Math.random() * 3) - 1;
    }

    if (this.x == man.x && this.y == man.y) {
      board.captured();
    }
    this.counter += 1;
  }
}

Monster.prototype = new Man();

function Board(width, height, pixelWidth, context) {
  this.width = width;
  this.height = height;
  this.pixelWidth = pixelWidth;
  this.context = context;
  this.things = new Array();
  this.context.canvas.width = (width + 1) * pixelWidth;
  this.context.canvas.height = (height + 1) * pixelWidth;
  this.deaths = 0;

  this.createCellArray = function() {
    var cells = new Array(this.width);
    for (var x = 0; x < this.width; x += 1) {
      cells[x] = new Array(this.height);

    }
    for (var x=0; x < this.width; x += 1) {
      for (var y=0; y < this.height; y += 1) {
        cells[x][y] = 0
      }
    }
    return cells;
  }
  this.cells = this.createCellArray();

  this.createMaze = function() {
    x = this.width; y = this.height;
  	var n=x*y-1;
  	if (n<0) {alert("illegal maze dimensions");return;}
  	var horiz =[]; for (var j= 0; j<x+1; j++) horiz[j]= [],
  	    verti =[]; for (var j= 0; j<y+1; j++) verti[j]= [],
  	    here = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)],
  	    path = [here],
  	    unvisited = [];
  	for (var j = 0; j<x+2; j++) {
  		unvisited[j] = [];
  		for (var k= 0; k<y+1; k++)
  			unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
  	}
  	while (0<n) {
  		var potential = [[here[0]+1, here[1]], [here[0],here[1]+1],
  		    [here[0]-1, here[1]], [here[0],here[1]-1]];
  		var neighbors = [];
  		for (var j = 0; j < 4; j++)
  			if (unvisited[potential[j][0]+1][potential[j][1]+1])
  				neighbors.push(potential[j]);
  		if (neighbors.length) {
  			n = n-1;
  			next= neighbors[Math.floor(Math.random()*neighbors.length)];
  			unvisited[next[0]+1][next[1]+1]= false;
  			if (next[0] == here[0])
  				horiz[next[0]][(next[1]+here[1]-1)/2]= true;
  			else
  				verti[(next[0]+here[0]-1)/2][next[1]]= true;
  			path.push(here = next);
  		} else
  			here = path.pop();
  	}

    for (var i=0; i < this.width; i += 1) {
      for (var j=0; j < this.height; j += 1) {
        this.cells[i][j] = (horiz[i][j] && verti[i][j]) ? 1 : 0
      }
    }

  	return {x: x, y: y, horiz: horiz, verti: verti};
  }


  this.add = function(object) {
    this.things.push(object);
  }

  this.canMoveTo = function(x, y) {
    return ((x >= 0) && (x < this.width - 1) && (y >= 0) && (y < this.height - 1) && (this.cells[x][y] === 0));
  }

  this.drawGrid = function() {
    for (var x = 0; x < (this.width + 1); x += 1) {
      this.context.moveTo(x * this.pixelWidth, 0);
      this.context.lineTo(x * this.pixelWidth, this.height * this.pixelWidth);
    }

    for (var y = 0; y < (this.height + 1); y += 1) {
      this.context.moveTo(0, y * this.pixelWidth);
      this.context.lineTo(this.width * this.pixelWidth, y * this.pixelWidth);
    }

    this.context.strokeStyle = "black";
    this.context.stroke();
  }

  this.drawCells = function() {
    this.context.clearRect(0, 0, (this.width + 1) * pixelWidth, (this.height + 1) * pixelWidth)
    for (var x = 0; x < this.width; x += 1) {
      for (var y = 0; y < this.height; y += 1) {
        if (this.cells[x][y] === 1) {
          this.context.fillStyle="black";
          this.context.fillRect((x * this.pixelWidth) + 1, (y * this.pixelWidth) + 1, this.pixelWidth - 1, this.pixelWidth - 1)
        }
      }
    }
    for (i = 0; i< this.things.length; i++) {
      this.things[i].draw()
    }
  }

  this.turn = function() {
    for (i = 0; i< this.things.length; i++) {
      this.things[i].turn()
    }
  }

  this.spawnLocation = function() {
    while (true) {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.height);
      if (this.canMoveTo(x,y))
        return {x: x, y: y}
    }
  }

  this.captured = function() {
    this.deaths += 1
    document.getElementById('deaths').innerHTML = "" + this.deaths;
  }
}

var start = function() {
  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");
  var board = new Board(50, 50, 10, context);
  board.createMaze();
  canvas.style.width = '' + (board.width * 10)  + 'px';
  canvas.style.height = '' + (board.height * 10) + 'px' ;

  var loc = board.spawnLocation()
  var man = new Man(board, loc.x, loc.y, 10, context, "red");
  loc = board.spawnLocation()
  var monster = new Monster(board, man, loc.x , loc.y, 10, context, "blue");
  var monster2 = new Monster(board, man, loc.x , loc.y, 10, context, "yellow");
  board.add(man);
  board.add(monster);
  board.add(monster2);

  document.onkeydown = function(e) {
    e = e || window.event;
    if (e.keyCode == '38') {
      man.moveup()
    } else if (e.keyCode == '40') {
      man.movedown()
    } else if (e.keyCode == '37') {
      man.moveleft()
    } else if (e.keyCode == '39') {
      man.moveright()
    }
  }


  setInterval(function() {
    board.drawCells();
  }, 1000 / 60);
  setInterval(function() {
    board.turn();
  }, 1000 / 5);
}