const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const colorButtonsContainer = document.getElementById('colorButtons');

const colors = ['#DD2E44', '#32CD32', '#4169E1', '#D2691E'];
let player, platforms, currentColor, score, gameLoop, speed, gravity;

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createColorButtons() {
    colors.forEach(color => {
        const button = document.createElement('button');
        button.className = 'colorButton';
        button.style.backgroundColor = color;
        button.onclick = () => checkColor(color);
        colorButtonsContainer.appendChild(button);
    });
}

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    colorButtonsContainer.innerHTML = '';
    createColorButtons();
    platforms = [];
    for (let i = 0; i < 5; i++) {
        platforms.push(createPlatform(i * 120));
    }
    player = {
        x: platforms[2].x + platforms[2].width / 2 - 15,
        y: platforms[2].y - 30,
        width: 30,
        height: 30,
        vy: 0,
        jumpStrength: -10,
        isJumping: false
    };
    currentColor = getRandomColor();
    score = 0;
    speed = 2;
    gravity = 0.4;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 1000 / 60);
}

function createPlatform(y) {
    const platformWidth = 80;
    const margin = 100;
    return {
        x: Math.random() * (canvas.width - 2 * margin - platformWidth) + margin,
        y: y,
        width: platformWidth,
        height: 10
    };
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function checkColor(clickedColor) {
    if (clickedColor === currentColor && !player.isJumping) {
        moveToNextPlatform();
        score++;
        currentColor = getRandomColor();
        if (score % 5 === 0) speed += 0.1;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, clickedColor);
    } else if (clickedColor !== currentColor) {
        gameOver();
    }
}

function moveToNextPlatform() {
    let nextPlatform = null;
    let minDistance = Infinity;

    platforms.forEach(platform => {
        if (platform.y < player.y) {
            let distance = Math.abs(platform.x - player.x) + Math.abs(platform.y - player.y);
            if (distance < minDistance) {
                minDistance = distance;
                nextPlatform = platform;
            }
        }
    });

    if (nextPlatform) {
        player.x = nextPlatform.x + nextPlatform.width / 2 - player.width / 2;
        player.y = nextPlatform.y - player.height;
        player.isJumping = false;
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.y += player.vy;
    player.vy += gravity;

    platforms.forEach((platform, index) => {
        platform.y += speed;
        if (platform.y > canvas.height) {
            platforms[index] = createPlatform(0);
        }
    });

    platforms.forEach(platform => {
        if (player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.vy >= 0) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.isJumping = false;
        }
    });

    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    platforms.forEach(platform => {
        ctx.fillStyle = '#666';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    ctx.fillStyle = currentColor;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(30, 30, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 70);

    updateParticles();

    if (player.y > canvas.height) {
        gameOver();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameOverScreen.style.display = 'block';
    document.getElementById('finalScore').textContent = score;
}

let particles = [];

function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 - 2,
            radius: Math.random() * 3 + 1,
            color: color,
            life: 30
        });
    }
}

function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
            particles.splice(index, 1);
        } else {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 30;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    });
}

createColorButtons();
startScreen.style.display = 'block';