document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');

    // Game settings
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let speed = 7;

    // Game state
    let gameRunning = false;
    let gameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;

    // Snake initial state
    let snake = [
        { x: 10, y: 10 } // Head of the snake
    ];
    let velocityX = 0;
    let velocityY = 0;
    let nextVelocityX = 0;
    let nextVelocityY = 0;

    // Food initial position
    let food = generateFood();

    // Colors
    const snakeColor = '#4CAF50';
    const snakeHeadColor = '#388E3C';
    const foodColor = '#F44336';
    const gridColor = '#333';

    // Game loop
    function gameLoop() {
        if (!gameRunning) return;
        
        if (gameOver) {
            drawGameOver();
            return;
        }

        setTimeout(() => {
            clearCanvas();
            drawGrid();
            moveSnake();
            checkCollision();
            drawFood();
            drawSnake();
            gameLoop();
        }, 1000 / speed);
    }

    // Clear canvas
    function clearCanvas() {
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw grid lines
    function drawGrid() {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }

    // Move snake
    function moveSnake() {
        // Update velocity based on next velocity (prevents multiple turns in a single frame)
        velocityX = nextVelocityX;
        velocityY = nextVelocityY;

        // Move snake body
        for (let i = snake.length - 1; i > 0; i--) {
            snake[i] = { ...snake[i - 1] };
        }

        // Move snake head
        snake[0].x += velocityX;
        snake[0].y += velocityY;

        // Check if snake eats food
        if (snake[0].x === food.x && snake[0].y === food.y) {
            eatFood();
        }
    }

    // Draw snake
    function drawSnake() {
        snake.forEach((segment, index) => {
            // Draw snake segment
            ctx.fillStyle = index === 0 ? snakeHeadColor : snakeColor;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Draw border around segment
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
    }

    // Generate food at random position
    function generateFood() {
        let newFood;
        let foodOnSnake;

        do {
            foodOnSnake = false;
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };

            // Check if food is on snake
            for (let segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);

        return newFood;
    }

    // Draw food
    function drawFood() {
        ctx.fillStyle = foodColor;
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        
        // Draw border around food
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    // Snake eats food
    function eatFood() {
        // Add new segment to snake (it will automatically follow in the next frame)
        snake.push({});
        
        // Generate new food
        food = generateFood();
        
        // Update score
        score++;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Increase speed slightly
        if (speed < 15 && score % 5 === 0) {
            speed += 0.5;
        }
    }

    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            return;
        }
        
        // Self collision (start from index 1 to avoid checking head against itself)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }
    }

    // Draw game over screen
    function drawGameOver() {
        clearCanvas();
        drawGrid();
        drawSnake();
        drawFood();
        
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game over text
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
        
        // Score text
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        
        // Restart instruction
        ctx.font = '16px Arial';
        ctx.fillText('Press the Restart button to play again', canvas.width / 2, canvas.height / 2 + 40);
    }

    // Start game
    function startGame() {
        if (gameRunning) return;
        
        // Reset game state
        snake = [{ x: 10, y: 10 }];
        velocityX = 1;
        velocityY = 0;
        nextVelocityX = 1;
        nextVelocityY = 0;
        food = generateFood();
        score = 0;
        scoreElement.textContent = score;
        speed = 7;
        gameOver = false;
        gameRunning = true;
        
        // Start game loop
        gameLoop();
    }

    // Restart game
    function restartGame() {
        gameRunning = false;
        setTimeout(startGame, 100);
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Prevent arrow keys from scrolling the page
        if ([37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        // Start game on first keypress if not running
        if (!gameRunning && !gameOver) {
            startGame();
            return;
        }
        
        // Skip if game is over
        if (gameOver) return;
        
        // Left arrow
        if (e.keyCode === 37 && velocityX !== 1) {
            nextVelocityX = -1;
            nextVelocityY = 0;
        }
        // Up arrow
        else if (e.keyCode === 38 && velocityY !== 1) {
            nextVelocityX = 0;
            nextVelocityY = -1;
        }
        // Right arrow
        else if (e.keyCode === 39 && velocityX !== -1) {
            nextVelocityX = 1;
            nextVelocityY = 0;
        }
        // Down arrow
        else if (e.keyCode === 40 && velocityY !== -1) {
            nextVelocityX = 0;
            nextVelocityY = 1;
        }
    });

    // Button event listeners
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);

    // Initial render
    clearCanvas();
    drawGrid();
    drawSnake();
    drawFood();
});