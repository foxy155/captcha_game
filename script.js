class KrunkerFPSCaptcha {
    constructor() {
        // Game state
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.timerInterval = null;
        this.verificationToken = null;
        this.startTime = null;
        
        // Player position and movement
        this.playerX = 0;
        this.playerY = 0;
        this.playerSpeed = 3;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Mouse/crosshair position
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.crosshairX = window.innerWidth / 2;
        this.crosshairY = window.innerHeight / 2;
        
        // Bot
        this.bot = null;
        this.botX = 0;
        this.botY = 0;
        this.botSpeed = 2;
        this.botAngle = 0;
        this.botAlive = true;
        this.botHealth = 100;
        
        // Animation frame
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.setupMouseControls();
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const retryBtn = document.getElementById('retryBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.resetGame());
        }
        
        // Shooting
        document.addEventListener('click', (e) => {
            if (this.gameActive && !e.target.closest('.start-screen') && !e.target.closest('.success-screen') && !e.target.closest('.fail-screen')) {
                this.shoot();
            }
        });
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
                e.preventDefault();
                this.keys[key] = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
                e.preventDefault();
                this.keys[key] = false;
            }
        });
    }
    
    setupMouseControls() {
        // Mouse look - crosshair follows mouse
        document.addEventListener('mousemove', (e) => {
            if (this.gameActive) {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.updateCrosshair();
            }
        });
        
        // Lock pointer for better FPS experience (optional)
        const fpsView = document.getElementById('fpsView');
        if (fpsView) {
            fpsView.addEventListener('click', () => {
                if (this.gameActive) {
                    fpsView.requestPointerLock = fpsView.requestPointerLock || 
                        fpsView.mozRequestPointerLock || 
                        fpsView.webkitRequestPointerLock;
                    if (fpsView.requestPointerLock) {
                        fpsView.requestPointerLock();
                    }
                }
            });
        }
    }
    
    updateCrosshair() {
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.style.left = this.mouseX + 'px';
            crosshair.style.top = this.mouseY + 'px';
            this.crosshairX = this.mouseX;
            this.crosshairY = this.mouseY;
        }
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = 30;
        this.startTime = Date.now();
        this.botAlive = true;
        this.botHealth = 100;
        
        // Reset positions
        this.playerX = window.innerWidth / 2;
        this.playerY = window.innerHeight / 2;
        this.crosshairX = window.innerWidth / 2;
        this.crosshairY = window.innerHeight / 2;
        
        // Hide start screen, show game
        const startScreen = document.getElementById('startScreen');
        const fpsView = document.getElementById('fpsView');
        const successScreen = document.getElementById('successScreen');
        const failScreen = document.getElementById('failScreen');
        
        if (startScreen) startScreen.style.display = 'none';
        if (fpsView) fpsView.classList.add('active');
        if (successScreen) successScreen.style.display = 'none';
        if (failScreen) failScreen.style.display = 'none';
        
        // Initialize bot
        this.spawnBot();
        
        // Start timer
        this.startTimer();
        
        // Start game loop
        this.gameLoop();
        
        // Update UI
        this.updateUI();
    }
    
    spawnBot() {
        const gameWorld = document.getElementById('gameWorld');
        if (!gameWorld) return;
        
        // Remove existing bot
        const existingBot = document.getElementById('bot');
        if (existingBot) {
            existingBot.remove();
        }
        
        // Create bot
        this.bot = document.createElement('div');
        this.bot.id = 'bot';
        this.bot.className = 'bot';
        
        // Random starting position
        this.botX = 200 + Math.random() * (window.innerWidth - 400);
        this.botY = 200 + Math.random() * (window.innerHeight - 400);
        
        this.bot.style.left = this.botX + 'px';
        this.bot.style.top = this.botY + 'px';
        
        gameWorld.appendChild(this.bot);
        
        // Start bot movement
        this.botAngle = Math.random() * Math.PI * 2;
    }
    
    gameLoop() {
        if (!this.gameActive) return;
        
        this.updatePlayer();
        this.updateBot();
        this.updateUI();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    updatePlayer() {
        // Movement
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys.w) moveY -= this.playerSpeed;
        if (this.keys.s) moveY += this.playerSpeed;
        if (this.keys.a) moveX -= this.playerSpeed;
        if (this.keys.d) moveX += this.playerSpeed;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        this.playerX += moveX;
        this.playerY += moveY;
        
        // Keep player in bounds
        this.playerX = Math.max(0, Math.min(window.innerWidth, this.playerX));
        this.playerY = Math.max(0, Math.min(window.innerHeight, this.playerY));
        
        // Update camera/view based on player position (optional visual effect)
        const fpsView = document.getElementById('fpsView');
        if (fpsView) {
            const offsetX = (this.playerX / window.innerWidth - 0.5) * 20;
            const offsetY = (this.playerY / window.innerHeight - 0.5) * 20;
            fpsView.style.backgroundPosition = `${50 + offsetX}% ${50 + offsetY}%`;
        }
    }
    
    updateBot() {
        if (!this.bot || !this.botAlive) return;
        
        // Bot moves in a pattern
        this.botAngle += 0.02;
        
        // Circular movement with some randomness
        const radius = 100;
        this.botX += Math.cos(this.botAngle) * this.botSpeed;
        this.botY += Math.sin(this.botAngle) * this.botSpeed;
        
        // Bounce off walls
        if (this.botX < 50 || this.botX > window.innerWidth - 150) {
            this.botAngle = Math.PI - this.botAngle;
        }
        if (this.botY < 50 || this.botY > window.innerHeight - 150) {
            this.botAngle = -this.botAngle;
        }
        
        // Keep bot in bounds
        this.botX = Math.max(50, Math.min(window.innerWidth - 150, this.botX));
        this.botY = Math.max(50, Math.min(window.innerHeight - 150, this.botY));
        
        // Update bot position
        if (this.bot) {
            this.bot.style.left = this.botX + 'px';
            this.bot.style.top = this.botY + 'px';
        }
    }
    
    shoot() {
        if (!this.gameActive || !this.botAlive) return;
        
        // Muzzle flash
        this.showMuzzleFlash();
        
        // Check if crosshair is over bot
        const botRect = this.bot.getBoundingClientRect();
        const botCenterX = botRect.left + botRect.width / 2;
        const botCenterY = botRect.top + botRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(this.crosshairX - botCenterX, 2) + 
            Math.pow(this.crosshairY - botCenterY, 2)
        );
        
        // Hit detection (within 60px of bot center)
        if (distance < 60) {
            this.hitBot();
        } else {
            // Miss - show impact effect
            this.showBulletImpact(this.crosshairX, this.crosshairY);
        }
    }
    
    hitBot() {
        this.botHealth -= 25;
        this.score += 10;
        
        // Show hit effect
        this.showBulletImpact(this.botX + 75, this.botY + 75);
        
        // Bot hit animation
        if (this.bot) {
            this.bot.classList.add('hit');
            setTimeout(() => {
                if (this.bot) {
                    this.bot.classList.remove('hit');
                }
            }, 200);
        }
        
        // Check if bot is dead
        if (this.botHealth <= 0) {
            this.killBot();
        }
        
        this.updateUI();
    }
    
    killBot() {
        this.botAlive = false;
        this.score += 50;
        
        if (this.bot) {
            this.bot.classList.add('dead');
            setTimeout(() => {
                if (this.bot) {
                    this.bot.style.opacity = '0';
                }
            }, 500);
        }
        
        // Win!
        setTimeout(() => {
            this.endGame(true);
        }, 1000);
    }
    
    showMuzzleFlash() {
        const flash = document.getElementById('muzzleFlash');
        if (flash) {
            flash.style.left = this.crosshairX + 'px';
            flash.style.top = this.crosshairY + 'px';
            flash.classList.add('active');
            setTimeout(() => {
                flash.classList.remove('active');
            }, 100);
        }
    }
    
    showBulletImpact(x, y) {
        const impact = document.getElementById('bulletImpact');
        if (impact) {
            impact.style.left = x + 'px';
            impact.style.top = y + 'px';
            impact.classList.add('active');
            setTimeout(() => {
                impact.classList.remove('active');
            }, 300);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            } else if (this.timeLeft <= 10) {
                const timerEl = document.getElementById('timerValue');
                if (timerEl) {
                    timerEl.classList.add('warning');
                }
            }
        }, 1000);
    }
    
    updateUI() {
        const scoreEl = document.getElementById('scoreValue');
        const botStatusEl = document.getElementById('botStatus');
        const timerEl = document.getElementById('timerValue');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (botStatusEl) {
            botStatusEl.textContent = this.botAlive ? 'ALIVE' : 'DEAD';
            botStatusEl.style.color = this.botAlive ? '#ff4444' : '#4ecdc4';
        }
        if (timerEl) timerEl.textContent = this.timeLeft;
    }
    
    endGame(won) {
        this.gameActive = false;
        this.botAlive = false;
        
        // Stop intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Hide game view
        const fpsView = document.getElementById('fpsView');
        if (fpsView) {
            fpsView.classList.remove('active');
        }
        
        if (won) {
            // Generate token
            const completionTime = Date.now() - this.startTime;
            this.verificationToken = this.generateToken(completionTime);
            
            // Show success screen
            const successScreen = document.getElementById('successScreen');
            const finalScoreEl = document.getElementById('finalScore');
            const timeRemainingEl = document.getElementById('timeRemaining');
            const tokenEl = document.getElementById('verificationToken');
            
            if (successScreen) successScreen.style.display = 'flex';
            if (finalScoreEl) finalScoreEl.textContent = this.score;
            if (timeRemainingEl) timeRemainingEl.textContent = this.timeLeft + 's';
            if (tokenEl) tokenEl.textContent = this.verificationToken;
        } else {
            // Show fail screen
            const failScreen = document.getElementById('failScreen');
            if (failScreen) failScreen.style.display = 'flex';
        }
    }
    
    generateToken(completionTime) {
        const randomData = Math.random().toString(36).substring(2, 15);
        const timeData = completionTime.toString(36);
        const scoreData = this.score.toString(36);
        const hash = btoa(randomData + timeData + scoreData + Date.now().toString()).substring(0, 32);
        return hash.toUpperCase();
    }
    
    resetGame() {
        // Reset all state
        this.gameActive = false;
        this.score = 0;
        this.timeLeft = 30;
        this.botAlive = true;
        this.botHealth = 100;
        
        // Stop intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Reset keys
        this.keys = { w: false, a: false, s: false, d: false };
        
        // Hide all screens
        const fpsView = document.getElementById('fpsView');
        const successScreen = document.getElementById('successScreen');
        const failScreen = document.getElementById('failScreen');
        const startScreen = document.getElementById('startScreen');
        const timerEl = document.getElementById('timerValue');
        
        if (fpsView) fpsView.classList.remove('active');
        if (successScreen) successScreen.style.display = 'none';
        if (failScreen) failScreen.style.display = 'none';
        if (startScreen) startScreen.style.display = 'flex';
        if (timerEl) timerEl.classList.remove('warning');
        
        // Remove bot
        const bot = document.getElementById('bot');
        if (bot) bot.remove();
        
        this.updateUI();
    }
}

// Initialize when page loads
let gameInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    gameInstance = new KrunkerFPSCaptcha();
    console.log('Game initialized');
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!gameInstance) {
            gameInstance = new KrunkerFPSCaptcha();
        }
    });
} else {
    if (!gameInstance) {
        gameInstance = new KrunkerFPSCaptcha();
    }
}

// Prevent right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
