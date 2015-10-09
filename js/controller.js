var Keyboard = {
	isDown:{
		arrowLeft: false,
		arrowRight: false,
		arrowUp: false,
		arrowDown: false,
		space: false,
		enter: false},
	onPress:{
		arrowLeft: false,
		arrowRight: false,
		arrowUp: false,
		arrowDown: false,
		space: false,
		enter: false}
};



///Listeners
window.addEventListener('keydown', function(event) {
	switchKey(event.keyCode, true);
});

window.addEventListener('keyup', function(event) {
	switchKey(event.keyCode, false);
});


//Key mapping
function switchKey(keyCode, setOn) {
	switch (event.keyCode) {
		case 13:
			if(!Keyboard.isDown.enter) {
				Keyboard.onPress.enter = true;
			} else {
				Keyboard.onPress.enter = false;
			}
			Keyboard.isDown.enter = setOn;
			break;
		case 32:
			if(!Keyboard.isDown.space) {
				Keyboard.onPress.space = true;
			} else {
				Keyboard.onPress.space = false;
			}
			Keyboard.isDown.space = setOn;
			break;
		case 37:
			if(!Keyboard.isDown.arrowLeft) {
				Keyboard.onPress.arrowLeft = true;
			} else {
				Keyboard.onPress.arrowLeft = false;
			}
			Keyboard.isDown.arrowLeft = setOn;
			break;
		case 38:
			if(!Keyboard.isDown.arrowUp) {
				Keyboard.onPress.arrowUp = true;
			} else {
				Keyboard.onPress.arrowUp = false;
			}
			Keyboard.isDown.arrowUp = setOn;
			break;
		case 39:
			if(!Keyboard.isDown.arrowRight) {
				Keyboard.onPress.arrowRight = true;
			} else {
				Keyboard.onPress.arrowRight = false;
			}
			Keyboard.isDown.arrowRight = setOn;
			break;
		case 40:
			if(!Keyboard.isDown.arrowDown) {
				Keyboard.onPress.arrowDown = true;
			} else {
				Keyboard.onPress.arrowDown = false;
			}
			Keyboard.isDown.arrowDown = setOn;
			break;
		default:
			break;
	}
}
