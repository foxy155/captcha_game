class KrunkerCaptcha {
    constructor() {
        this.currentStep = 0;
        this.targetOrder = [];
        this.clickedOrder = [];
        this.totalTargets = 5;
        this.isComplete = false;
        this.startTime = null;
        this.verificationToken = null;
        
        this.init();
    }
    
    init() {
        this.generateChallenge();
        this.setupEventListeners();
        this.startTime = Date.now();
    }
    
    generateChallenge() {
        // Generate random order for targets 1-5
        this.targetOrder = this.shuffleArray([1, 2, 3, 4, 5]);
        this.clickedOrder = [];
        this.currentStep = 0;
        this.isComplete = false;
        
        const grid = document.getElementById('targetsGrid');
        grid.innerHTML = '';
        
        // Create targets with shuffled positions
        this.targetOrder.forEach((num, index) => {
            const target = document.createElement('div');
            target.className = 'target';
            target.textContent = num;
            target.dataset.number = num;
            target.dataset.index = index;
            target.addEventListener('click', () => this.handleTargetClick(target));
            grid.appendChild(target);
        });
        
        this.updateProgress();
        this.updateStatus('');
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    handleTargetClick(target) {
        if (this.isComplete || target.classList.contains('clicked')) {
            return;
        }
        
        const clickedNumber = parseInt(target.dataset.number);
        const expectedNumber = this.currentStep + 1;
        
        if (clickedNumber === expectedNumber) {
            // Correct click
            target.classList.add('clicked');
            this.clickedOrder.push(clickedNumber);
            this.currentStep++;
            
            this.updateProgress();
            
            if (this.currentStep === this.totalTargets) {
                this.completeChallenge();
            } else {
                this.updateStatus(`Good! Click ${this.currentStep + 1} next.`, 'success');
            }
        } else {
            // Wrong click
            target.classList.add('wrong');
            this.updateStatus('Wrong order! Try again.', 'error');
            
            setTimeout(() => {
                this.resetChallenge();
            }, 1000);
        }
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalTargets) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
    }
    
    updateStatus(message, type = '') {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = 'status ' + type;
    }
    
    completeChallenge() {
        this.isComplete = true;
        const completionTime = Date.now() - this.startTime;
        
        // Generate verification token
        this.verificationToken = this.generateToken(completionTime);
        
        // Hide challenge, show success
        document.getElementById('challengeContainer').style.display = 'none';
        document.getElementById('successScreen').style.display = 'block';
        document.getElementById('verificationToken').textContent = this.verificationToken;
        document.getElementById('resetBtn').style.display = 'inline-block';
        
        // Add completion animation
        setTimeout(() => {
            document.getElementById('captchaBox').style.animation = 'slideIn 0.5s ease-out';
        }, 100);
    }
    
    generateToken(completionTime) {
        // Generate a unique token based on completion time and random data
        const randomData = Math.random().toString(36).substring(2, 15);
        const timeData = completionTime.toString(36);
        const hash = btoa(randomData + timeData + Date.now().toString()).substring(0, 32);
        return hash.toUpperCase();
    }
    
    resetChallenge() {
        // Reset all targets
        const targets = document.querySelectorAll('.target');
        targets.forEach(target => {
            target.classList.remove('clicked', 'wrong');
        });
        
        this.currentStep = 0;
        this.clickedOrder = [];
        this.updateProgress();
        this.updateStatus('');
    }
    
    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetUI();
        });
    }
    
    resetUI() {
        // Reset everything for a new challenge
        document.getElementById('challengeContainer').style.display = 'block';
        document.getElementById('successScreen').style.display = 'none';
        document.getElementById('resetBtn').style.display = 'none';
        this.startTime = Date.now();
        this.generateChallenge();
    }
}

// Initialize captcha when page loads
document.addEventListener('DOMContentLoaded', () => {
    new KrunkerCaptcha();
});

// Optional: Add some anti-bot measures
let clickCount = 0;
let lastClickTime = 0;

document.addEventListener('click', (e) => {
    const currentTime = Date.now();
    clickCount++;
    
    // Detect suspicious patterns (too fast clicks)
    if (currentTime - lastClickTime < 50 && clickCount > 10) {
        console.warn('Suspicious activity detected');
    }
    
    lastClickTime = currentTime;
});

// Prevent right-click context menu (optional anti-bot measure)
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
