var LargeImage = new Image();
var SmallImage = new Image();
var ShipImage = new Image();
var ShipOnImage = new Image();
var WrappPadding = 5;

LargeImage.src='images/asteroid-large.png';
SmallImage.src='images/asteroid-small.png';
ShipImage.src='images/ship.png';
ShipOnImage.src='images/ship_on.png';
var ShootSound = document.getElementById("phaserSound");
var BoomSound = document.getElementById("boomSound");
var EngineSound = document.getElementById("engineSound");
EngineSound.loop = true;

function PlaySound(sound) {
	if(!sound.paused) {
		sound.currentTime = 0;
	} 
	sound.play();	
}

function StopSound(sound) {
	sound.pause();
}


var PointsForSmallAsteroid = 5;
var PointsForLargeAsteroid = 10;


function Asteroid(x, y, xvel, yvel, image, size, wide, tall) {
	this.Type = size,
	this.X = x;
	this.Y = y;
	this.Width = wide;
	this.Height = tall;
	this.VelX = xvel;
	this.VelY = yvel;
	this.Image = image;
	
	this.GetPosition = function() {
		return {X: this.X, 
				Y: this.Y,
				Width: this.Width,
				Height: this.Height};
	}

	this.Update = function() {
		this.X += this.VelX;
		this.Y += this.VelY;
		if(this.X > Screen.width+this.Width) {
			this.X = -this.Width;
		}else if(this.X < -this.Width) {
			this.X = Screen.width;
		}
		if(this.Y >= Screen.height) {
			this.Y = -this.Height;
		} else if(this.Y  < -this.Height) {
			this.Y = Screen.height;
		}
	}
	
	this.Draw = function(context) {
		context.drawImage(this.Image, this.X, this.Y, this.Width, this.Height);
	}
};

function Missile(x,y,xvel,yvel) {
	this.Type = 'Missile',
	this.X = x;
	this.Y = y;
	this.Width = 2;
	this.Height = 2;
	this.VelX = xvel*4;
	this.VelY = yvel*4;	
	
	this.DestroyMe = function() {
		//If i am off the screen, destroy me
		if(this.X < 0 || this.X > Screen.width || this.Y < 0 || this.Y > Screen.height){
			RemoveGameObject(this);
		}
	}
	
	this.Update = function() {
		this.X += this.VelX;
		this.Y += this.VelY;
		this.DestroyMe();
		//Did I hit an asteroid?
		var died = false;
		for(var i = 0; i < GameObjects.length && !died; i++) {
			var other = GameObjects[i];
			if(other.Type === 'Asteroid') {
				if(CheckCollision(this, other)) {
					//Direct Hit!
					PlaySound(BoomSound);
					died=true;
					Score += PointsForLargeAsteroid;
					RemoveGameObject(other);
					var x = this.X;
					var y = this.Y;
					for(var j = 0; j < 3; j++) {
						GameObjects.push(RandomMiniAsteroid(x, y));
					}
				}
			} else if(other.Type === 'MiniAsteroid') {
				if(CheckCollision(this, other)) {
					PlaySound(BoomSound);
					died=true;
					Score += PointsForSmallAsteroid;
					RemoveGameObject(other);
				}
			}
		}
		
		if(died)
			RemoveGameObject(this);
	}
	
	this.Draw = function(context) {
		context.fillStyle = 'white';
		context.fillRect(this.X, this.Y, this.Width, this.Height);
	}
}

function SpaceShip(x, y, xvel, yvel, image) {
	this.Type = 'Ship',
	this.X = x;
	this.Y = y;
	this.Width = 30;
	this.Height = 20;
	this.VelX = xvel;
	this.VelY = yvel;
	this.VelZ = 0;
	this.Image = image;
	this.Angle = 0;
	this.BrakePower = 0.1;
	this.CanShoot = true;
	
	this.GetPosition = function() {
		return {X: this.X, 
				Y: this.Y,
				Width: this.Width,
				Height: this.Height};
	}

	this.Update = function() {
		//Check keyboard input
		//Check Spin
		if(Keyboard.isDown.arrowLeft && this.VelZ > -5) {
			this.VelZ -= 1;
		} else if(Keyboard.isDown.arrowRight && this.VelZ < 5) {
			this.VelZ += 1;
		} else {
			this.VelZ = 0;
		}
		if(this.Angle < 0)
			this.Angle = 360;
		if(this.Angle > 360)
			this.Angle = 0;
		//Calculate Thruster Influence
		if(Keyboard.isDown.arrowUp) {
			//Thrusters
			PlaySound(EngineSound);
			//Which way am i facing?
			this.CalculateThrust(this.Angle);
			this.Image = ShipOnImage;
		} else {
			this.Image = ShipImage;
			StopSound(EngineSound);
		}
		if(Keyboard.isDown.arrowDown) {
			this.CalculateBrake();
		}
		if(Keyboard.isDown.space) {
			// Fire!
			this.ShootMissile();
		}
		
		
		//Apply Velocity
		this.Angle += this.VelZ;
		this.X += this.VelX;
		this.Y += this.VelY;
		this.CalculateWrap();
		
		//Check Collision
		GameObjects.forEach(function(other) {
			if(CheckCollision(this, other) && (other.Type === 'MiniAsteroid' || other.Type === 'Asteroid')) {
				//NOOO
				PlaySound(BoomSound);
				console.info("Player has died");
				NumLives --;
				RemoveGameObject(this);
				ResetPlayer = true;
			}
		}.bind(this));
	}
	
	this.ShootMissile = function() {
		if(this.CanShoot) {
			//Create Missile
			console.log("BOOM");
			var x = this.X;
			var y = this.Y;
			var ang = this.Angle;
			PlaySound(ShootSound);
			GameObjects.push(new Missile(x,y,Math.cos(ang*Math.PI/180), Math.sin(ang*Math.PI/180)));
			this.CanShoot = false;
			window.setTimeout(function(){this.CanShoot = true;}.bind(this),300);//only shoot so fast		
		}
	}
	
	this.CalculateWrap = function() {
		if(this.X > Screen.width+this.Width) {
			this.X = -this.Width;
		}else if(this.X < -this.Width) {
			this.X = Screen.width;
		}
		if(this.Y >= Screen.height) {
			this.Y = -this.Height;
		} else if(this.Y  < -this.Height) {
			this.Y = Screen.height;
		}
	}
	
	this.CalculateThrust = function(dir) {
		this.VelX += Math.cos(dir*Math.PI/180)*0.15;
		this.VelY += Math.sin(dir*Math.PI/180)*0.15;
		var max = 2.5;
		if(this.VelX > max)
			this.VelX = max;
		if(this.VelX < -max)
			this.VelX = -max;
		if(this.VelY > max)
			this.VelY = max;
		if(this.VelY < -max)
			this.VelY = -max;
	}
	this.CalculateBrake = function() {
		if(this.VelY > 0) {
			this.VelY -= this.BrakePower;
		} else {
			this.VelY += this.BrakePower
		}
		if(this.VelX > 0) {
			this.VelX -= this.BrakePower;
		} else {
			this.VelX += this.BrakePower;
		}
	}
	
	this.Draw = function(context) {
		context.save();
		context.translate(this.X,this.Y);
		context.rotate(this.Angle*Math.PI/180)
		context.drawImage(this.Image, -(this.Width/2), -(this.Height/2), this.Width, this.Height);
		context.restore();
	}
};



function NewPlayer() {	
	return new SpaceShip(Screen.width/2, Screen.height/2,0,0,ShipImage);
}

function RandomAsteroid() {
	var x = RandomNum(0, 600, false);
	var y = RandomNum(0, 600, false);
	var xvel = RandomNum(1, 3, true);
	var yvel = RandomNum(1, 3, true);
	return new Asteroid(x,y,xvel,yvel, LargeImage, 'Asteroid', 85, 85);
}

function RandomMiniAsteroid(x, y) {
	var xvel = RandomNum(1, 3, true);
	var yvel = RandomNum(1, 3, true);
	return new Asteroid(x,y,xvel, yvel,SmallImage,'MiniAsteroid', 40, 40);
}

function RandomNum(min, max, negative) {
	var num = Math.floor(Math.random()*(max-min)+min);
	if(negative) {
		if(Math.floor(Math.random() * 1000)%2 == 0) {
			//if a random number between 0 and 1000 is even, lets
			//make it a negative number
			return num*-1;
		}
	}
	return num;
}