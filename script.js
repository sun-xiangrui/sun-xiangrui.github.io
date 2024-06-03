const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const paddleHeight = 10;
const paddleWidth = 150;
let paddleX = (canvas.width - paddleWidth) / 2;

const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const brickRowCount = 8;
const brickColumnCount = 10;
const brickWidth = (canvas.width - (brickColumnCount + 1) * 10) / brickColumnCount;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 10;

// 定义砖块图片
const brickImage = new Image();
brickImage.src = 'brick.png';

// 定义球的图片
const ballImage = new Image();
ballImage.src = 'ball.png';

// 定义背景音乐
const bgm = new Audio('bgm.mp3');
bgm.loop = true;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let rightPressed = false;
let leftPressed = false;
let interval;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('DOMContentLoaded', tryPlayAudio);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function drawBall() {
    ctx.drawImage(ballImage, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                }
            }
        }
    }
}

function checkWin() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x - ballRadius < 0) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            gameOver("很遗憾，就差一点点了");
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    if (checkWin()) {
        gameOver("恭喜你，游戏获胜");
    }
}

function gameOver(message) {
    clearInterval(interval);
    bgm.pause();
    document.getElementById("message").innerText = message;
    document.getElementById("replayButton").style.display = "block";
}

function replayGame() {
    document.location.reload();
}

let imagesLoaded = 0;
function imageLoaded() {
    imagesLoaded += 1;
    if (imagesLoaded === 2) { // 修改为2，因为我们不改变板子的形状
        console.log('All images loaded, starting game');
        tryPlayAudio();
        interval = setInterval(draw, 10);
    }
}

function tryPlayAudio() {
    bgm.play().catch(error => {
        console.log('Autoplay was prevented. Click anywhere on the page to start the audio.');
        document.body.addEventListener('click', () => {
            bgm.play();
        }, { once: true });
    });
}

brickImage.onload = function() {
    console.log("Brick image loaded");
    imageLoaded();
};

ballImage.onload = function() {
    console.log("Ball image loaded");
    imageLoaded();
};

// 检查 BGM 是否加载成功
bgm.addEventListener('canplaythrough', () => {
    console.log('Background music can play through without interruption.');
}, false);

bgm.addEventListener('error', (e) => {
    console.log('Error loading background music:', e);
}, false);
