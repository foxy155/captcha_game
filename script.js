class FPSCaptcha {
    constructor() {
        this.score = 0;
        this.targetsHit = 0;
        this.targetsNeeded = 5;
        this.timeLeft = 30;
        this.gameActive = false;
        this.timerInterval = null;
        this.targetSpawnInterval = null;
        this.targets = [];
        this.verificationToken = null;
        this.startTime = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMouseTracking();
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const retryBtn = document.getElementById('retryBtn');
        const targetsArea = document.getElementById('targetsArea');
        
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
        if (targetsArea) {
            targetsArea.addEventListener('click', (e) => {
                if (this.gameActive && e.target.classList.contains('target')) {
                    this.shootTarget(e.target, e);
                }
            });
        }
    }
    
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            if (this.gameActive) {
                // Optional: Add slight camera movement effect
                const fpsView = document.getElementById('fpsView');
                const x = (e.clientX / window.innerWidth - 0.5) * 10;
                const y = (e.clientY / window.innerHeight - 0.5) * 10;
                fpsView.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    }
    
    startGame() {
        console.log('Starting game...');
        this.gameActive = true;
        this.score = 0;
        this.targetsHit = 0;
        this.timeLeft = 30;
        this.startTime = Date.now();
        
        // Hide start screen, show game
        const startScreen = document.getElementById('startScreen');
        const fpsView = document.getElementById('fpsView');
        const successScreen = document.getElementById('successScreen');
        const failScreen = document.getElementById('failScreen');
        
        if (startScreen) startScreen.style.display = 'none';
        if (fpsView) fpsView.classList.add('active');
        if (successScreen) successScreen.style.display = 'none';
        if (failScreen) failScreen.style.display = 'none';
        
        // Clear existing targets
        this.clearTargets();
        
        // Start timer
        this.startTimer();
        
        // Start spawning targets
        setTimeout(() => {
            this.spawnTarget();
            this.targetSpawnInterval = setInterval(() => {
                if (this.targets.length < 3 && this.gameActive) {
                    this.spawnTarget();
                }
            }, 2000);
        }, 100);
        
        // Update UI
        this.updateUI();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame(false);
            } else if (this.timeLeft <= 10) {
                document.getElementById('timerValue').classList.add('warning');
            }
        }, 1000);
    }
    
    spawnTarget() {
        if (!this.gameActive) return;
        
        const target = document.createElement('div');
        target.className = 'target';
        
        // Random position (avoid edges)
        const margin = 100;
        const x = margin + Math.random() * (window.innerWidth - margin * 2);
        const y = margin + Math.random() * (window.innerHeight - margin * 2);
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        
        // Random movement
        const speed = 1 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        target.vx = Math.cos(angle) * speed;
        target.vy = Math.sin(angle) * speed;
        
        // Add to DOM
        document.getElementById('targetsArea').appendChild(target);
        this.targets.push(target);
        
        // Move target
        this.moveTarget(target);
        
        // Remove after 5 seconds if not hit
        setTimeout(() => {
            if (target.parentNode && !target.classList.contains('hit')) {
                this.removeTarget(target);
            }
        }, 5000);
    }
    
    moveTarget(target) {
        if (!this.gameActive || !target.parentNode || target.classList.contains('hit')) {
            return;
        }
        
        const rect = target.getBoundingClientRect();
        let x = parseFloat(target.style.left) + target.vx;
        let y = parseFloat(target.style.top) + target.vy;
        
        // Bounce off walls
        if (x <= 50 || x >= window.innerWidth - 130) {
            target.vx *= -1;
            x = Math.max(50, Math.min(window.innerWidth - 130, x));
        }
        if (y <= 50 || y >= window.innerHeight - 130) {
            target.vy *= -1;
            y = Math.max(50, Math.min(window.innerHeight - 130, y));
        }
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        
        // Continue moving
        requestAnimationFrame(() => this.moveTarget(target));
    }
    
    shootTarget(target, event) {
        if (target.classList.contains('hit')) return;
        
        // Mark as hit
        target.classList.add('hit');
        this.targetsHit++;
        this.score += 10;
        
        // Muzzle flash effect
        this.showMuzzleFlash(event);
        
        // Score popup
        this.showHitEffect(event);
        
        // Remove target
        setTimeout(() => {
            this.removeTarget(target);
        }, 300);
        
        // Check win condition
        if (this.targetsHit >= this.targetsNeeded) {
            this.endGame(true);
        }
        
        // Spawn new target if needed
        if (this.targets.length < 2) {
            setTimeout(() => this.spawnTarget(), 500);
        }
        
        this.updateUI();
    }
    
    showMuzzleFlash(event) {
        const flash = document.getElementById('muzzleFlash');
        flash.style.left = event.clientX + 'px';
        flash.style.top = event.clientY + 'px';
        flash.classList.add('active');
        
        setTimeout(() => {
            flash.classList.remove('active');
        }, 100);
    }
    
    showHitEffect(event) {
        const effect = document.createElement('div');
        effect.className = 'hit-effect';
        effect.style.left = event.clientX + 'px';
        effect.style.top = event.clientY + 'px';
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }
    
    removeTarget(target) {
        if (target.parentNode) {
            target.parentNode.removeChild(target);
        }
        const index = this.targets.indexOf(target);
        if (index > -1) {
            this.targets.splice(index, 1);
        }
    }
    
    clearTargets() {
        this.targets.forEach(target => {
            if (target.parentNode) {
                target.parentNode.removeChild(target);
            }
        });
        this.targets = [];
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('targetsLeft').textContent = this.targetsNeeded - this.targetsHit;
        document.getElementById('timerValue').textContent = this.timeLeft;
    }
    
    endGame(won) {
        this.gameActive = false;
        
        // Stop intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.targetSpawnInterval) {
            clearInterval(this.targetSpawnInterval);
        }
        
        // Clear targets
        this.clearTargets();
        
        // Hide game view
        document.getElementById('fpsView').classList.remove('active');
        
        if (won) {
            // Generate token
            const completionTime = Date.now() - this.startTime;
            this.verificationToken = this.generateToken(completionTime);
            
            // Show success screen
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('timeRemaining').textContent = this.timeLeft + 's';
            document.getElementById('verificationToken').textContent = this.verificationToken;
            document.getElementById('successScreen').style.display = 'flex';
        } else {
            // Show fail screen
            document.getElementById('failScreen').style.display = 'flex';
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
        this.targetsHit = 0;
        this.timeLeft = 30;
        
        // Stop intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.targetSpawnInterval) {
            clearInterval(this.targetSpawnInterval);
        }
        
        // Clear targets
        this.clearTargets();
        
        // Reset UI
        document.getElementById('fpsView').classList.remove('active');
        document.getElementById('successScreen').style.display = 'none';
        document.getElementById('failScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('timerValue').classList.remove('warning');
        
        this.updateUI();
    }
}

// Initialize when page loads
let gameInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    gameInstance = new FPSCaptcha();
    console.log('Game initialized');
});

// Fallback initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!gameInstance) {
            gameInstance = new FPSCaptcha();
        }
    });
} else {
    // DOM already loaded
    if (!gameInstance) {
        gameInstance = new FPSCaptcha();
    }
}

// Prevent right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Anti-bot: Track mouse movement patterns
let mouseMovements = [];
document.addEventListener('mousemove', (e) => {
    mouseMovements.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    if (mouseMovements.length > 50) {
        mouseMovements.shift();
    }
});
