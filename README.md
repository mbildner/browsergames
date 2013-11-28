HTML5 Games
===========


Background
----------

This is a small collection of games built using Javascript and HTML5. The games are to serve as a playground to practice building simple programs designed around MVC architecture and which require coordination between multiple endpoints.


##Snake:

### The Game:

You move a snake around the gameboard, using the arrow keys to turn the snake up, down, right, or left.  The snake will always move forward, and you must prevent it from striking any walls, or its own body.  

The goal of the game is to chase the food block around the board and eat it, at which time another will replace it on screen.  Your snake will grow one block longer for every block you consume, making the game progressively harder.

### The Design: 

The game is loosely built to follow the MVC (model-view-controller) architectural pattern.  MVC dictates that there be one true **model** of the program state, which is represented by a **view** or (views), and that  inputs should be taken from outside the program (from the user, the network, other programs, etc) by a *controller*, which applies them to the model, and updates the view accordingly.


The game makes use of three custom *prototypes* (Javascript's rough equivalent to classes), and a few free functions.  The prototypes are:

* **GridBox:**

`var GridBox = function(row, col, width, height){
	this.row = row;
	this.col = col;
	this.width = width;
	this.height = height;
	this.collideable = false;

	this.render = function(color){
		context.fillStyle = color;
		context.fillRect(row*height, col*width, width, height, color)
	}

	this.erase = function(){
		this.render(canvas.backgroundColor);
	}
}`

The The GridBox contains information necessary to check whether other things are in its own space (collisions) and to make itself visible to the player, when instructed by the controller to do so.

* **GridModel**
	The GridModel is basically a giant grid, built of an array of arrays, which holds a matrix of GridBox objects. Controller code manages those boxes. The GridModel also has functions that permit it to render itself to the viewer, by instructing certain elements within it to render themselves.

* **SnakeModel**
	The SnakeModel holds the code to manage the player's snake itself.  The object dictates how the snake 'moves', how it renders itself (like the GridModel, by instructing its constituent boxes to render themselves), and how the snake tests for, and handles collision events.  


### Controller Code: 

*I ruined the game's clean MVC pattern when I ported it from single player to multiplayer.  I plan to gradually refactor it back to a logical configuration.*

The game's controller code lives in a single GameLoop that runs continuously which runs the following steps in order:
	1) Set the player's snake to be collideable
	2) check for collisions on that object
	3) clear the board's view
	4) render the food block
	5) make the food collideable
	6) render and make collideable the gameboard edges
	7) render the snake
	8) try to send the snake's position to other players using a websocket object we've opened for that purpose
	9) loop through the other players' snakes, and render them to the screen and set them collideable for our snake



### UI Controller Code:

The game has a super basic user interface, which consists of one selector, for the game's speed, and one button, to start or pause the game.  

These interface pieces control the game's state, which is held in a simple finite state machine.  When the user reaches the page, the state machine begins in "dead" mode.  
When the player starts the game, gamestate switches to "running" state, a snake is instantiated, and a websocket opened to the server for communication with other players.

When the user pauses, gamestate switches to "paused",  gameplay stops, and nothing new is rendered to the screen until the game is put back in play. 

When a player loses, the game goes into "dead" state, and the user may restart as if they had just landed on the page.

### For Future Consideration:

There are two related problems to consider fixing.  First, the controller code is messy and scattered.  For the most part, it is all managed by the state machine and the gameloop.  But there are little helper functions in various places where they shouldn't be, to ease development.  These should be refactored appropriately into a single controller class, which is itself knowledgeable of both the game model, and the state machine (to manage the player's UI).  

More seriously, the game's multiplayer interaction is handled by each client, which is responsible for sending and receiving updates about player locations, size, and collisions.  


	`for (var s in outsideSnakes) {
		var fsnake = outsideSnakes[s];

		fsnake.forEach(function (box) {
			var box = gridModel.grid[box.row][box.col];
			box.collideable = true;
			box.render("orange");
		});
	}`


This is inherently incorrect, and leads to all kinds of problems. Most obviously, this permits the games to fall out of step with one another in time: a snake that hits a foodblock will only grow in another's screen after it has broadcasted the event, and the local browser has received and processed and applied it.  This means things like collision events may be, and often are, missed. 

For now, game design was altered to make multiplayer feasible: instead of a single board with a single piece of food chased by all players, each player has their own food block, about which they alone are aware.  

Theoretically, these problems could both be solved by moving all game state calculations to the central server, which would be responsible for deciding where snakes and food were, and when they had collided, and in what order.  This has other undesirable consequences however, and so for the moment it will not be implemented.


### Tetris: (coming soon...)
