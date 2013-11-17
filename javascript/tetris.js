var gameBoardId = "gameBoard";


var gameBoard = document.getElementById(gameBoardId);

var context = gameBoard.getContext('2d');

var width = gameBoard.width;
var height = gameBoard.height;

var rows = 60;
var cols = 15;

var boxHeight = height/rows;
var boxWidth = width/cols;

var grid = [];



function Box (row, col) {
	this.box = {
		'col': col, 'row': row
	};

	return this;
}

Box.prototype.render = function(color) {
	context.fillStyle = color;

	var startX = this.box.col * boxWidth;
	var startY = this.box.row * boxHeight;

	context.fillRect(startX, startY, boxWidth, boxHeight);

	return this;

};

Box.prototype.freeze = function() {
	// a little hacky - freeze our block at the row above where it struck
	grid[this.box.row -1][this.box.col].substrate = true;
	return;
};

Box.prototype.substrateCollision = function() {
	var	row = this.box.row;
	var col = this.box.col;

	var gridBox = grid[row][col];

	if (gridBox.substrate) {
		return true;
	} else {
		return false;
	}

};




Box.prototype.collisionTest = function() {
	// should return the direction of the collision

	this.row = this.box.row;
	this.col = this.box.col;

	var collideRight = this.col >= cols -1;
	var collideLeft = this.col <= 0;

	var collideTop = this.row <= 0;
	var collideBottom = this.row >= rows -1;

	var collision = collideRight || collideBottom || collideTop || collideLeft;

	// find a better way to do this

	if (collideRight) {
		return "right";
	} else if (collideLeft) {
		return "left";
	} else if (collideTop) {
		return "top";
	} else if (collideBottom) {
		return "bottom";
	}

	return collision;

};

Box.prototype.move = function(direction, speed) {
	var directions = {
		"left": {col: -1, row: 0},
		"right": {col: 1, row: 0},
		"up":    {col: 0, row: -1},
		"down":  {col: 0, row: 1}
	}

	if (direction in directions) {
		var movement = directions[direction];

		this.box.col += (movement.col);
		this.box.row += (movement.row);
	}

	return this;
};



for (var i=0; i<rows; i++) {
	var row = [];
	for (var j=0; j<cols; j++) {
		var box = new Box(i, j)
		row.push(box);
	}
	grid.push(row);
}





function eraseBoard () {
	grid.forEach(function (row) {
		row.forEach(function (box) {
			box.render("white");
		})
	})
}

function prepBoard () {
	eraseBoard();
	grid.forEach(function (row) {
		row.forEach(function (box) {
			if (box.substrate) {
				box.render("blue");
			}
		});
	});
}



var gravity = 5;

var block = new Box(1, 1);

window.block = block;

block.render('red');





//  ---------------------- Game Logic ----------------------


grid[grid.length-1].forEach(function (box) {
	box.substrate = true;
});


document.addEventListener('keydown', function (k){
	var directionsDict = {
		37 : "left",
		38 : "up",
		39 : "right",
		40 : "down"
	}

	if (k.which in directionsDict) {
		var direction = directionsDict[k.which];

		prepBoard();
		
		if (direction != block.collisionTest()) {
			block.move(directionsDict[k.which], 4);
		}

		if (block.substrateCollision()) {
			block.freeze();
			window.block = new Box(1, 1);

		}

		block.render("red");


	}

});


window.setInterval(function () {
	prepBoard();
	block.move("down", gravity);
	if (block.substrateCollision()) {
		block.freeze();
		window.block = new Box(1, 1);

	}

	block.render("red");

}, 50)
