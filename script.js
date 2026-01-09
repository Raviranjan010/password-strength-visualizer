document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const crackTime = document.getElementById('crackTime');
    const toggleBtn = document.getElementById('toggleVisibility');
    const copyBtn = document.getElementById('copyPassword');
    const themeToggle = document.getElementById('themeToggle');
    const mainCard = document.getElementById('mainCard');

    // State
    let isPasswordVisible = false;

    // 1. Core Logic: Strength Calculation
    const calculateStrength = (pwd) => {
        let score = 0;
        if (!pwd) return 0;

        // Length impact
        score += Math.min(pwd.length * 4, 25);

        // Variety impact
        if (/[A-Z]/.test(pwd)) score += 15;
        if (/[a-z]/.test(pwd)) score += 15;
        if (/[0-9]/.test(pwd)) score += 20;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

        // Pattern Penalty (Repeated characters)
        if (/(.)\1{2,}/.test(pwd)) score -= 10;

        return Math.max(0, Math.min(score, 100));
    };

    // 2. UI Updates
    const updateUI = () => {
        const pwd = passwordInput.value;
        const score = calculateStrength(pwd);
        
        // Update Meter
        strengthBar.style.width = `${score}%`;
        
        let color = 'var(--danger)';
        let text = 'Very Weak';

        if (score > 80) {
            color = 'var(--success)';
            text = 'Very Strong';
            mainCard.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.2)';
        } else if (score > 60) {
            color = '#84cc16';
            text = 'Strong';
        } else if (score > 40) {
            color = 'var(--warning)';
            text = 'Medium';
        } else if (score > 20) {
            color = '#f97316';
            text = 'Weak';
        } else {
            mainCard.style.boxShadow = '';
        }

        strengthBar.style.backgroundColor = color;
        strengthText.innerText = text;
        strengthText.style.color = color;

        // Shake if very weak and typing
        if (pwd.length > 5 && score < 30) {
            mainCard.classList.add('shake');
            setTimeout(() => mainCard.classList.remove('shake'), 400);
        }

        updateRules(pwd);
        estimateCrackTime(pwd, score);
    };

    const updateRules = (pwd) => {
        const rules = {
            length: pwd.length >= 8,
            upper: /[A-Z]/.test(pwd),
            lower: /[a-z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[^A-Za-z0-9]/.test(pwd)
        };

        Object.keys(rules).forEach(rule => {
            const el = document.querySelector(`[data-rule="${rule}"]`);
            rules[rule] ? el.classList.add('valid') : el.classList.remove('valid');
        });
    };

    // 3. Crack Time Simulation
    const estimateCrackTime = (pwd, score) => {
        if (!pwd) {
            crackTime.innerText = 'N/A';
            return;
        }

        // Simple Entropy calculation
        let charsetSize = 0;
        if (/[a-z]/.test(pwd)) charsetSize += 26;
        if (/[A-Z]/.test(pwd)) charsetSize += 26;
        if (/[0-9]/.test(pwd)) charsetSize += 10;
        if (/[^A-Za-z0-9]/.test(pwd)) charsetSize += 33;

        const entropy = pwd.length * Math.log2(charsetSize || 1);
        
        if (entropy < 25) crackTime.innerText = 'Instantly';
        else if (entropy < 35) crackTime.innerText = 'Minutes';
        else if (entropy < 45) crackTime.innerText = 'Days';
        else if (entropy < 55) crackTime.innerText = 'Months';
        else if (entropy < 65) crackTime.innerText = 'Years';
        else crackTime.innerText = 'Centuries';
    };

    // 4. Event Listeners
    passwordInput.addEventListener('input', () => {
        // Debounce for performance if needed, but for simple logic, direct call is smoother
        updateUI();
    });

    toggleBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        toggleBtn.style.color = isPasswordVisible ? 'var(--accent)' : 'var(--text-secondary)';
    });

    copyBtn.addEventListener('click', () => {
        if (!passwordInput.value) return;
        navigator.clipboard.writeText(passwordInput.value);
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
        
        // Haptic Feedback
        if (window.navigator.vibrate) window.navigator.vibrate(50);
    });

    // Theme Management
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
});
