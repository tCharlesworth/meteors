var GameObjects = [];
var HighScores = [];
var StartingAsteroidCount = 3;//Remember to subtract one for level
var NumLives = 3;
var Score = 0;
var ResetPlayer = false;
var ContinuePlaying = false;
var Screen = {width: 600, height: 600};
var Level = 1;
var ShowLocal = true;

var Canvas = document.getElementById('myCanvas');
var GamePosition = 0;
function run() {
	
	switch(GamePosition) {
		case 0:
			PreGame();
			break;
		case 1:
			InGame();
			break;
		case 2:
			PostGame();
			break;
	}
	window.requestAnimationFrame(run);
}

function PreGame() {
	//Draw a menu
	var context = Canvas.getContext("2d");
	context.font = '20pt Ariel';
	context.fillStyle = 'white';
	context.fillText("Press Enter To Start a new Game", 10,50);
	//when you click on 'Start'
	if(Keyboard.onPress.enter || ContinuePlaying) {
		GameSetup();
		GamePosition = 1;//Move to InGame function from now on
		ContinuePlaying = false;
	}	
}

function GameSetup() {
	if(!ContinuePlaying) {
		Score = 0;
		NumLives = 3;
		Level = 1;
	}
	//Create Asteroids
	GameObjects = [];
	var nums = StartingAsteroidCount + Level;
	for(var i = 0; i < nums; i++) {
		GameObjects.push(RandomAsteroid());
		console.info("New Asteroid");	
	}	
	//Create Player
	ResetPlayer = true;
}

function InGame() {
	//Update Objects
	UpdateGameObjects();
	//Draw Objects
	var context = Canvas.getContext("2d");
	context.clearRect(0,0,Screen.width,Screen.height);
	DrawGameObjects(context);	
	//Have I Won or Have I Died?
	CheckEnding();
}

function PostGame() {
	//High Scores Screen
	var context = Canvas.getContext("2d");
	context.clearRect(0,0,Screen.width, Screen.height);
	DrawHighScores(context);
	//Play Again
	context.fillStyle = 'white';
	context.font = '20pt Ariel';
	context.fillText("To Play Again, press enter.",10,60);
	if(Keyboard.isDown.enter) {
		//Start again
		GamePosition = 0;
		Level = 0;
	}
}

function DrawHighScores(context) {
	var boxWide = 200;
	var boxTall = 350;
	context.fillStyle = 'black';
	context.fillRect((Screen.width/2-boxWide/2),(Screen.height/2-boxTall/2),boxWide, boxTall);
	// context.strokeStyle = 'white';
	// context.strokeRect((Screen.width/2-boxWide/2),(Screen.height/2-boxTall/2),boxWide, boxTall);
	var x = (Screen.width/2-boxWide/2) + 20;//40 is the margin(padding)
	var y = (Screen.height/2-boxTall/2) + 20;//40 is the margin(padding)
	context.fillStyle = 'white';
	context.fillText("Local High Scores", x, y);
	y += 25;
	for(var i = 0 ; i < HighScores.length; i++) {
		var str= (i+1)+") "+HighScores[i].score +" : "+HighScores[i].name;
		context.fillText(str, x, y);
		y += 25;
	}
}

function Box(x,y,width,height) {
	return {
		Left: x,
		Top: y,
		Right: x+width,
		Bot: y+height	
	};
}

function CheckCollision(obj1, obj2) {
	//check horizontal
	var A = Box(obj1.X, obj1.Y, obj1.Width, obj1.Height);
	var B = Box(obj2.X, obj2.Y, obj2.Width, obj2.Height);
	if((A.Left > B.Left && A.Left < B.Right) || (A.Right > B.Left && A.Right < B.Right)) {
		//Horizontal Passed
		if((A.Top > B.Top && A.Top < B.Bot) || (A.Bot > B.Top && A.Bot < B.Bot)) {
			//Vertical Passed
			return true;
		}
	}
	return false;
}

function UpdateGameObjects() {
	GameObjects.forEach(function(item) {
		item.Update();
	});
	//Do I need to reset player?
	if(ResetPlayer) {
		AttemptResetPlayer();
	}
}

function AttemptResetPlayer() {
	var isClear = true;
	var clearWidth = 150;
	var clearHeight = 150;
	var landingZone = {X: (Screen.width/2-clearWidth/2), Y: (Screen.height/2-clearHeight/2), Width: clearWidth, Height: clearHeight};
	GameObjects.forEach(function(obj) {
		if(CheckCollision(obj, landingZone)) {
			isClear = false;
		}
	});
	if(isClear) {	
		GameObjects.push(NewPlayer());
		ResetPlayer = false;
	}
}

function DrawGameObjects(context) {
	GameObjects.forEach(function(item) {
		item.Draw(context);
	});
	//Draw Menu
	context.fillStyle = 'white';
	context.fillText("Lives: "+NumLives,10,20);
	context.fillText("Score: "+Score,Screen.width/3,20);
	context.fillText("Level: "+Level,Screen.width/3*2,20);
}

function RemoveGameObject(obj) {
	var ix = GameObjects.indexOf(obj);
	GameObjects.splice(ix,1);
}

function CheckEnding() {
	//Have I Won?
	if(GameObjects.length === 1) {
		//Just ME!!!
		console.info("YOU WIN");
		//Start Another Round
		GamePosition = 0;
		ContinuePlaying = true;
		Level++;
	}
	//Have I Died?
	if(NumLives <= 0) {
		//GAME OVER! POSTGAME
		GamePosition = 2;
		CheckHighScore();
	}
}

function CheckHighScore() {
	if(HighScores.length === 0 || HighScores.length < 10 || Score > HighScores[HighScores.length-1].score) {
		//New High Score!
		var name = prompt("You got a Local high score! Please enter your name");
		if(!name)
			name = 'Ghost';
		HighScores.push({name: name, score: Score});
		HighScores.sort(function(a, b) {
			if(a.score > b.score)
				return -1;
			if(a.score < b.score)
				return 1;
			return 0;
		});
		while(HighScores.length > 10) {
			HighScores.pop();
		}
		SaveScores();
	}
}

function LoadScores() {
	///Local Scores
	var data = localStorage.getItem('AsteroidsHighScores');
	if(data) {
		HighScores = JSON.parse(data);
		console.info("Local Scores Loaded");
	} else {
		console.info("No local data");
	}
}


function SaveScores() {
	var data = JSON.stringify(HighScores);
	localStorage.setItem('AsteroidsHighScores',data);
	console.info("Scores Saved Locally");
}

//Once we are really ready, Lets do all the INITIALIZATION
document.addEventListener('DOMContentLoaded', function(event) {
	//Load Scores
	LoadScores();
	//Interval
	setInterval(function() {ShowLocal = !ShowLocal;}, 5000);
	//Begin game
	run();
}); 