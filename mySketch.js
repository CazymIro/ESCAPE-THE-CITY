//Visual style and design inspired by Pixelblog #14 by Slynyrd
let gameState = 'ready';
let startBtn;
let stack = [];
let current;
let speed =10;
let direction = 1;
let cameraOffset = 0;
let victory = false;
let ballReadyToFly = false;
let victoryFade = 0;
let hasWon = false;
let cheat = false;
let bgImage;
let platform = {
	x: 400,
	y: 430,
	w: 180,
	h: 20
};
let ball = {
	x: 400,
	y: 0,
	r: 10,
	vx: 0,
	vy: 0,
	onGround: false,
	prevX: 0,
	prevY: 0,
	isFalling: false,
	isPreparingFall: false,
	prepareStartTime: 0
};



function preload() {
	bgImage = loadImage('i.png');
	stImage = loadImage('n.png');
}

function setup() {
	let canvasX = (windowWidth - 800) / 2;
	let canvasY = (windowHeight - 800) / 2;
	let canvas = createCanvas(800, 800);
	canvas.position(canvasX, canvasY);
	background(37, 20, 52);
	document.body.style.backgroundColor = 'rgb(33, 20, 47)';
	rectMode(CENTER);
	textFont('Press Start 2P');
	startBtn = createButton('START');
	startBtn.style('font-family', "'Press Start 2P'");
	startBtn.style('font-size', '10px');
	startBtn.style('background', '#32213C');
	startBtn.style('color', '#e9d0f2');
	startBtn.style('border', '2px solid #e9d0f2');
	startBtn.style('padding', '8px 12px');
	startBtn.style('cursor', 'pointer');
	startBtn.size(platform.w, platform.h + 10);
	startBtn.position(canvasX + platform.x - platform.w / 2, canvasY + platform.y - 10);
	startBtn.mousePressed(startGame);
	noStroke();
}

function startGame() {
	stack = [{
		x: width / 2,
		y: height - 10,
		w: 380,
		h: 20,
		design: 1,
		subdesign: int(random(1, 5))
	}];
	newBlock();
	cameraOffset = 0;
	ball.isFalling = false;
	isPreparingFall = false;
	victory = false;
	ballReadyToFly = false;
	cheat = false;
	prepareStartTime = 0;
	ball.vx = ball.vy = 0;
	gameState = 'playing';
	startBtn.hide();
	loop();
}

function draw() {
	if (gameState !== 'playing') {
		image(stImage, 0, 0);
		textAlign(CENTER, CENTER);
		textSize(15);
		fill('rgb(244,191,243)');
		if (frameCount % 60 < 40) {
			text('Use LEFT,RIGHT,and UP Arrows to Play', width / 2, height / 2 - 265);
			textSize(10);
			text('Click the Screen to Try Before Start', width / 2, height / 2 - 235);
		}
		// rect(platform.x, platform.y+20, platform.w, platform.h);
		textSize(40);
		text('ESCAPE THE CITY', width / 2, height / 2 - 310);


		updateBallIntro();
		fill('rgb(180,150,204)');
		ellipse(ball.x, ball.y - 12, ball.r + 9);
		rect(ball.x, ball.y, ball.r, ball.r * 2)
		rect(ball.x, ball.y + 2, 20, 5);
		return;
	}

	let bgY = height - bgImage.height + cameraOffset;
	background(35, 21, 50);
	image(bgImage, 0, bgY);
	// background(255);
	translate(0, cameraOffset);

	// Draw the placed bricks 绘制已放置的砖块
	for (let b of stack) {
		drawBlock(b);
	}

	// Draw the currently moving brick 绘制当前移动的砖块
	if (current) {
		drawBlock(current);

		if (!ball.isPreparingFall) {
			let dx = (width / 2) - current.x;
			if (stack.length < 2) {
				current.x += constrain(dx, -(speed - 6), (speed - 6));
			} else if (stack.length < 4) {
				current.x += constrain(dx, -(speed - 2.5), (speed - 2.5));
			} else {
				current.x += constrain(dx, -speed, speed);
			}
			if (abs(dx) < 2) {
				checkLanding();
			}
		}
	}

	// Update ball(little guy)更新小球
	updateBall();
	fill('rgb(180,150,204)');
	ellipse(ball.x, ball.y - 12, ball.r + 9);
	rect(ball.x, ball.y, ball.r, ball.r * 2);
	rect(ball.x, ball.y + 2, 20, 5);

	// Move the camera up上移视角
	let topY = stack[stack.length - 1].y;
	if (topY + cameraOffset < 250) {
		cameraOffset += 5;
	}

	// check fall 掉下判定
	if (ball.y - cameraOffset - ball.r > height) {
		gameOver();
	}

	if (victory && ballReadyToFly && ball.y + ball.r < cameraOffset - 100) {
		hasWon = true;
		victoryFade = min(victoryFade + 2, 255);
		push();
		resetMatrix();
		textAlign(CENTER, CENTER);
		textFont('Press Start 2P');
		textSize(24);
		fill(255, victoryFade);
		if (cheat) {
			text('YOU ESCAPED...BUT YOU CHEATED.', width / 2, height / 2 - 50);
			textSize(10);
			text('Press R to Redeem Yourself.', width / 2, height / 2 + 30);
		} else {
			text('YOU ESCAPED', width / 2, height / 2 - 50);
			textSize(14);
			text('The city fades. The sky is yours.', width / 2, height / 2 - 10);
			textSize(10);
			text('Press R to Restart', width / 2, height / 2 + 30);
		}
		pop();
	}
}

function updateBallIntro() {
	if (keyIsDown(LEFT_ARROW)) {
		ball.vx = -5;
	} else if (keyIsDown(RIGHT_ARROW)) {
		ball.vx = 5;
	} else {
		ball.vx = 0;
	}

	ball.x += ball.vx;
	let leftEdge = platform.x - platform.w / 2 + ball.r;
	let rightEdge = platform.x + platform.w / 2 - ball.r;
	ball.x = constrain(ball.x, leftEdge, rightEdge);

	ball.vy += 1.1;
	ball.y += ball.vy;

	let top = platform.y - platform.h / 2;
	if (ball.vy >= 0 && ball.y + ball.r > top && ball.y + ball.r < top + 15) {
		ball.y = top - ball.r;
		ball.vy = 0;
		ball.onGround = true;
	} else {
		ball.onGround = false;
	}
}

function newBlock() {
	direction = random([1, -1]);
	let last = stack[stack.length - 1];
	let style;

	if (stack.length < 10) {
		style = stack.length % 2 === 0 ? 1 : 2;
	} else if (stack.length < 11) {
		style = 5;
	} else if (stack.length < 12) {
		style = 6;
	} else if (stack.length < 19) {
		style = stack.length % 2 === 0 ? 3 : 4;
	} else if (stack.length < 20) {
		style = 7;
	} else if (stack.length < 21) {
		style = 8;
	} else if (stack.length < 32) {
		style = stack.length % 2 === 0 ? 10 : 9;
	} else if (stack.length < 33) {
		style = 11;
	} else if (stack.length < 34) {
		style = 12;
	} else if (stack.length < 35) {
		style = 13;
	} else if (stack.length < 36) {
		style = 16;
	} else if (stack.length < 37) {
		style = 14;
	} else if (stack.length < 38) {
		style = 16;
	} else if (stack.length < 39) {
		style = 15;
	} else if (stack.length < 40) {
		style = 17;
	} else if (stack.length < 46) {
		style = 18;
	} else if (stack.length < 50) {
		style = 19;
	} else if (stack.length < 51) {
		style = 20;
	}

	current = {
		x: direction === 1 ? -100 : width + 100,
		y: last.y - last.h,
		w: last.w,
		h: 20,
		design: style,
		subdesign: style === 1 ? int(random(1, 5)) : style === 4 ? int(random(1, 3)) : style === 9 ? int(random(1, 3)) : style === 10 ? int(random(1, 3)) : null
	};
}

function drawBlock(b) {
	let x = b.x;
	let y = b.y;
	let w = b.w;
	let h = b.h;

	if (b.design === 1) {
		if (b.subdesign === 1) {
			fill(86, 53, 92);
			rect(x, y, w, h);
			fill(31, 21, 40);
			rect(x + 110, y, 160, h);
			fill(184, 149, 112);
			rect(x - 120, y, 20, h);
			fill(184, 149, 112);
			rect(x + 120, y, 20, h);
		} else if (b.subdesign === 2) {
			fill(86, 53, 92);
			rect(x, y, w, h);
			fill(31, 21, 40);
			rect(x + 110, y, 160, h);
			fill(184, 149, 112);
			rect(x - 160, y, 20, h);
			fill(184, 149, 112);
			rect(x - 60, y, 20, h);
			fill(184, 149, 112);
			rect(x - 20, y, 20, h);
		} else if (b.subdesign === 3) {
			fill(86, 53, 92);
			rect(x, y, w, h);
			fill(31, 21, 40);
			rect(x + 110, y, 160, h);
			fill(184, 149, 112);
			rect(x - 160, y, 20, h);
			fill(184, 149, 112);
			rect(x - 120, y, 20, h);
			fill(184, 149, 112);
			rect(x - 80, y, 20, h);
			fill(184, 149, 112);
			rect(x, y, 20, h);
			fill(184, 149, 112);
			rect(x + 60, y, 20, h);
		} else if (b.subdesign === 4) {
			fill(86, 53, 92);
			rect(x, y, w, h);
			fill(31, 21, 40);
			rect(x + 110, y, 160, h);
			fill(184, 149, 112);
			rect(x - 100, y, 20, h);
			fill(184, 149, 112);
			rect(x - 60, y, 20, h);
			fill(184, 149, 112);
			rect(x + 80, y, 20, h);
		}
	} else if (b.design === 2) {
		fill(74, 77, 117);
		rect(x, y, w, h);
		fill(42, 29, 54);
		rect(x + 110, y, 160, h);
	} else if (b.design === 3) {
		fill(117, 74, 110);
		rect(x, y, w, h);
		fill(31, 21, 40);
		rect(x + 110, y, 160, h);
		fill(86, 53, 92);
		rect(x - 140, y, 20, h);
		fill(43, 29, 54);
		rect(x + 160, y, 20, h);
	} else if (b.design === 4) {
		if (b.subdesign === 1) {
			fill(117, 74, 110);
			rect(x, y, w, h);
			fill(31, 21, 40);
			rect(x + 110, y, 160, h);
			fill(74, 77, 117);
			rect(x - 170, y, 40, h);
			fill(74, 77, 117);
			rect(x, y, 60, h);
			fill(86, 53, 92);
			rect(x - 140, y, 20, h);
			fill(74, 77, 117);
			rect(x - 80, y, 20, h);
			fill(184, 149, 112);
			rect(x - 100, y, 20, h);
			fill(43, 29, 54);
			rect(x + 50, y, 40, h);
			fill(43, 29, 54);
			rect(x + 170, y, 40, h);
			fill(184, 149, 112);
			rect(x + 120, y, 20, h);
		} else if (b.subdesign === 2) {
			fill(117, 74, 110);
			rect(x, y, w, h);
			fill(31, 21, 40);
			rect(x + 110, y, 160, h);
			fill(74, 77, 117);
			rect(x - 170, y, 40, h);
			fill(74, 77, 117);
			rect(x, y, 60, h);
			fill(86, 53, 92);
			rect(x - 140, y, 20, h);
			fill(184, 149, 112);
			rect(x - 80, y, 20, h);
			fill(74, 77, 117);
			rect(x - 100, y, 20, h);
			fill(43, 29, 54);
			rect(x + 50, y, 40, h);
			fill(43, 29, 54);
			rect(x + 170, y, 40, h);
			fill(184, 149, 112);
			rect(x + 100, y, 20, h);
			fill(43, 29, 54);
			rect(x + 120, y, 20, h);
		}
	} else if (b.design === 5) {
		fill(117, 74, 110);
		rect(x, y, w, h);
		fill(31, 21, 40);
		rect(x + 110, y, 160, h);
		fill(184, 149, 112);
		rect(x - 80, y, 20, h);
		fill(184, 149, 112);
		rect(x, y, 20, h);
		fill(184, 149, 112);
		rect(x + 100, y, 20, h);
	} else if (b.design === 6) {
		fill(117, 74, 110);
		rect(x, y, w, h);
		fill(31, 21, 40);
		rect(x + 110, y, 160, h);
		fill(74, 77, 117);
		rect(x - 170, y, 40, h);
		fill(74, 77, 117);
		rect(x, y, 60, h);
		fill(86, 53, 92);
		rect(x - 140, y, 20, h);
		fill(43, 29, 54);
		rect(x + 50, y, 40, h);
		fill(43, 29, 54);
		rect(x + 170, y, 40, h);
	} else if (b.design === 7) {
		fill(106, 97, 141);
		rect(x, y, w - 40, h);
		fill(117, 74, 110);
		rect(x + 40, y, 20, h);
		fill(86, 53, 92);
		rect(x + 110, y, 120, h);
	} else if (b.design === 8) {
		fill(106, 97, 141);
		rect(x, y, w - 80, h);
		fill(117, 74, 110);
		rect(x + 20, y, 20, h);
		fill(86, 53, 92);
		rect(x + 90, y, 120, h);
	} else if (b.design === 9) {
		if (b.subdesign === 1) {
			fill(117, 74, 110);
			rect(x, y, w - 120, h);
			fill(31, 21, 40);
			rect(x + 70, y, 120, h);
			fill(86, 53, 92);
			rect(x - 80, y, 20, h);
			fill(43, 29, 54);
			rect(x + 100, y, 20, h);
			fill(184, 149, 112);
			rect(x - 60, y, 20, h);
		} else if (b.subdesign === 2) {
			fill(117, 74, 110);
			rect(x, y, w - 120, h);
			fill(31, 21, 40);
			rect(x + 70, y, 120, h);
			fill(86, 53, 92);
			rect(x - 80, y, 20, h);
			fill(43, 29, 54);
			rect(x + 100, y, 20, h);
			fill(184, 149, 112);
			rect(x - 100, y, 20, h);
		}

	} else if (b.design === 10) {
		if (b.subdesign === 1) {
			fill(117, 74, 110);
			rect(x, y, w - 120, h);
			fill(31, 21, 40);
			rect(x + 70, y, 120, h);
			fill(74, 77, 117);
			rect(x - 110, y, 40, h);
			fill(74, 77, 117);
			rect(x - 10, y, 40, h);
			fill(86, 53, 92);
			rect(x - 80, y, 20, h);
			fill(43, 29, 54);
			rect(x + 30, y, 40, h);
			fill(43, 29, 54);
			rect(x + 110, y, 40, h);
		} else if (b.subdesign === 2) {
			fill(117, 74, 110);
			rect(x, y, w - 120, h);
			fill(31, 21, 40);
			rect(x + 70, y, 120, h);
			fill(74, 77, 117);
			rect(x - 110, y, 40, h);
			fill(74, 77, 117);
			rect(x - 10, y, 40, h);
			fill(86, 53, 92);
			rect(x - 80, y, 20, h);
			fill(43, 29, 54);
			rect(x + 30, y, 40, h);
			fill(43, 29, 54);
			rect(x + 110, y, 40, h);
			fill(184, 149, 112);
			rect(x + 80, y, 20, h);
		}
	} else if (b.design === 11) {
		fill(106, 97, 141);
		rect(x, y, w - 160, h);
		fill(117, 74, 110);
		rect(x + 20, y, 20, h);
		fill(86, 53, 92);
		rect(x + 70, y, 80, h);
	} else if (b.design === 12) {
		fill(106, 97, 141);
		rect(x, y, w - 200, h);
		fill(117, 74, 110);
		rect(x, y, 20, h);
		fill(86, 53, 92);
		rect(x + 50, y, 80, h);
	} else if (b.design === 13) {
		fill(117, 74, 110);
		rect(x, y, w - 240, h);
		fill(31, 21, 40);
		rect(x + 40, y, 60, h);
		fill(86, 53, 92);
		rect(x - 10, y, 40, h);
		fill(184, 149, 112);
		rect(x - 40, y, 20, h);
	} else if (b.design === 14) {
		fill(117, 74, 110);
		rect(x, y, w - 240, h);
		fill(31, 21, 40);
		rect(x + 40, y, 60, h);
		fill(184, 149, 112);
		rect(x - 20, y, 20, h);
		fill(184, 149, 112);
		rect(x + 40, y, 20, h);
	} else if (b.design === 15) {
		fill(117, 74, 110);
		rect(x, y, w - 240, h);
		fill(31, 21, 40);
		rect(x + 40, y, 60, h);
	} else if (b.design === 16) {
		fill(106, 97, 141);
		rect(x, y, w - 240, h);
		fill(43, 29, 54);
		rect(x + 40, y, 60, h);
	} else if (b.design === 17) {
		fill(106, 97, 141);
		rect(x, y, w - 280, h);
		fill(86, 53, 92);
		rect(x + 30, y, 40, h);
	} else if (b.design === 18) {
		fill(117, 74, 110);
		rect(x, y, w - 320, h);
		fill(31, 21, 40);
		rect(x + 20, y, 20, h);
	} else if (b.design === 19) {
		fill(117, 74, 110);
		rect(x, y, w - 360, h);
	} else if (b.design === 20) {
		fill(141, 17, 12);
		rect(x, y, w - 360, h);
	}
}



function checkLanding() {
	let last = stack[stack.length - 1];
	current.x = last.x;
	current.y = last.y - last.h;
	stack.push({
		...current
	});

	// 胜利判断
	if (stack.length >= 51) {
		victory = true;
		ballReadyToFly = false;
		current = null;
	} else {
		newBlock();
	}
}



function updateBall() {
	if (victory) {
		// 胜利时的特别处理
		if (!ballReadyToFly) {
			ball.vy += 0.5;
			ball.y += ball.vy;

			// 检查是否落地
			let lastBrick = stack[stack.length - 1];
			let top = lastBrick.y - lastBrick.h / 2;
			let left = lastBrick.x - lastBrick.w / 2;
			let right = lastBrick.x + lastBrick.w / 2;

			if (ball.vy >= 0 && ball.y + ball.r > top - 1 && ball.x > left && ball.x < right) {
				// 落地判定成功
				ball.y = top - ball.r;
				ball.vy = 0;
				ballReadyToFly = true;
			}
			return;
		} else {
			ball.vy = -1;
			ball.y += ball.vy;
			fill(160, 166, 197, 50);
			rect(width / 2, -cameraOffset, 40, 1600);
			return;
		}
	}

	// 正常游戏逻辑
	if (ball.isPreparingFall) {
		if (millis() - ball.prepareStartTime > 500) {
			ball.isPreparingFall = false;
			ball.isFalling = true;
		} else {
			return;
		}
	}

	if (keyIsDown(LEFT_ARROW)) {
		ball.vx = -5;
	} else if (keyIsDown(RIGHT_ARROW)) {
		ball.vx = 5;
	} else {
		ball.vx = 0;
	}
	ball.x += ball.vx;

	// gravity 重力
	ball.vy += 1.1;
	ball.y += ball.vy;

	ball.onGround = false;

	// Collision detection
	let blocks = stack.slice();
	if (current) {
		blocks.push(current);
	}
	for (let i = 0; i < blocks.length; i++) {
		let b = blocks[i];
		if (checkCollision(b)) {
			return;
		}
	}
}


function checkCollision(b) {
	if (ball.isFalling) return false;

	// boundary 边界
	let visibleW = b.w;
	if (stack.length < 19) {
		visibleW = b.w;
	} else if (stack.length < 20) {
		visibleW = b.w - 40;
	} else if (stack.length < 21) {
		visibleW = b.w - 80;
	} else if (stack.length < 32) {
		visibleW = b.w - 120;
	} else if (stack.length < 33) {
		visibleW = b.w - 160;
	} else if (stack.length < 34) {
		visibleW = b.w - 200;
	} else if (stack.length < 39) {
		visibleW = b.w - 240;
	} else if (stack.length < 40) {
		visibleW = b.w - 280;
	} else if (stack.length < 46) {
		visibleW = b.w - 320;
	} else if (stack.length < 51) {
		visibleW = b.w - 360;
	} else {
		return false
	}

	let left = b.x - visibleW / 2;
	let right = b.x + visibleW / 2;
	let top = b.y - b.h / 2;
	let bottom = b.y + b.h / 2;

	// depth 穿透深度
	let dL = ball.x + ball.r - left;
	let dR = right - (ball.x - ball.r);
	let dT = ball.y + ball.r - top;

	// No overlap no collision 不重叠无碰撞
	if (dL <= 0 || dR <= 0 || dT <= 0) return false;

	// Determine response direction 决定响应方向
	let minPen = min(dL, dR, dT);


	if (minPen === dL || minPen === dR) {
		if (!ball.isPreparingFall && !ball.isFalling) {
			ball.isPreparingFall = true;
			ball.prepareStartTime = millis();
		}
		ball.vy = -8;
		return false;
	} else if (minPen === dT) {
		ball.y -= dT;
		ball.vy = 0;
		ball.onGround = true;
	}

	return false;
}

function keyPressed() {
	if (hasWon && keyCode === 82) {
		startGame();
	}

	if (victory) return;
	if ((keyCode === UP_ARROW || key === ' ') && ball.onGround && gameState === 'ready') {
		ball.vy = -13;
	}
	if (keyCode === UP_ARROW && ball.onGround && gameState === 'playing') {
		ball.vy = -13;
	} else if (key == ' ' && gameState === 'playing') {
		ball.vy = -13;
		cheat = true;
	}
}


function gameOver() {
	let canvasX = (windowWidth - 800) / 2;
	let canvasY = (windowHeight - 800) / 2;
	gameState = 'gameover';
	ball.x = 400;
	ball.y = 0;
	noLoop();

	push();
	resetMatrix();
	fill('red');
	textAlign(CENTER, CENTER);
	textSize(36);
	text('Game Over', width / 2, height / 2 - 80);
	pop();

	startBtn.html('Restart');
	startBtn.position(canvasX + platform.x - platform.w / 2, canvasY + platform.y - 10);
	startBtn.show();
}
