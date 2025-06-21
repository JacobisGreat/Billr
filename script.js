// Firebase Configuration
// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
let auth = null;
let db = null;

// Try to initialize Firebase
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase not loaded, running in demo mode');
    }
} catch (error) {
    console.log('Firebase initialization error:', error);
}

// DOM Elements
const startFreeBtn = document.getElementById('startFreeBtn');
const startTodayBtn = document.getElementById('startTodayBtn');
const loginBtn = document.getElementById('loginBtn');
const faqItems = document.querySelectorAll('.faq-item');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAnimations();
    initializeFAQ();
    initializeMobileMenu();
});

// Event Listeners
function initializeEventListeners() {
    // CTA Buttons
    if (startFreeBtn) {
        startFreeBtn.addEventListener('click', handleSignUp);
    }
    
    if (startTodayBtn) {
        startTodayBtn.addEventListener('click', handleSignUp);
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Sign Up Handler
async function handleSignUp() {
    try {
        if (auth) {
            // Show sign-up modal or redirect to dashboard
            showSignUpModal();
        } else {
            // Demo mode - just show a message
            showDemoMessage();
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showErrorMessage('Something went wrong. Please try again.');
    }
}

// Login Handler
async function handleLogin() {
    try {
        if (auth) {
            // Show login modal
            showLoginModal();
        } else {
            // Demo mode
            showDemoMessage();
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('Something went wrong. Please try again.');
    }
}

// Show Sign Up Modal
function showSignUpModal() {
    const modal = createModal(`
        <div class="modal-content">
            <div class="modal-header">
                <h2>Start Your Free Trial</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="signupForm">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required 
                               placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required 
                               placeholder="Create a secure password">
                    </div>
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" required 
                               placeholder="Your full name">
                    </div>
                    <button type="submit" class="btn-primary modal-btn">
                        Start Free Trial - 5 Invoices Free
                    </button>
                </form>
                <p class="modal-note">No credit card required • Cancel anytime</p>
            </div>
        </div>
    `);
    
    const form = modal.querySelector('#signupForm');
    form.addEventListener('submit', handleSignUpSubmit);
}

// Show Login Modal
function showLoginModal() {
    const modal = createModal(`
        <div class="modal-content">
            <div class="modal-header">
                <h2>Welcome Back</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <input type="email" id="loginEmail" name="email" required 
                               placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" name="password" required 
                               placeholder="Your password">
                    </div>
                    <button type="submit" class="btn-primary modal-btn">
                        Sign In
                    </button>
                </form>
                <p class="modal-note">
                    <a href="#" id="forgotPassword">Forgot your password?</a>
                </p>
            </div>
        </div>
    `);
    
    const form = modal.querySelector('#loginForm');
    form.addEventListener('submit', handleLoginSubmit);
}

// Handle Sign Up Form Submit
async function handleSignUpSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    
    try {
        if (auth) {
            // Create user with Firebase
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });
            
            // Save additional user data to Firestore
            if (db) {
                await db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    freeInvoicesUsed: 0,
                    plan: 'free'
                });
            }
            
            closeModal();
            showSuccessMessage('Account created successfully! Welcome to Billr!');
            
            // Redirect to dashboard (you would implement this)
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
            
        } else {
            // Demo mode
            showDemoMessage();
        }
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Handle Login Form Submit
async function handleLoginSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        if (auth) {
            await auth.signInWithEmailAndPassword(email, password);
            closeModal();
            showSuccessMessage('Welcome back!');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showDemoMessage();
        }
    } catch (error) {
        showErrorMessage(error.message);
    }
}

// Create Modal
function createModal(content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = content;
    
    document.body.appendChild(modalOverlay);
    
    // Add modal styles
    addModalStyles();
    
    // Close modal on overlay click or close button
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    return modalOverlay;
}

// Close Modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Add Modal Styles
function addModalStyles() {
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem 2rem;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .modal-header h2 {
                margin: 0;
                color: #1e293b;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #64748b;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .modal-body {
                padding: 2rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                color: #1e293b;
                font-weight: 500;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #6366f1;
            }
            
            .modal-btn {
                width: 100%;
                margin-bottom: 1rem;
            }
            
            .modal-note {
                text-align: center;
                color: #64748b;
                font-size: 0.9rem;
                margin: 0;
            }
            
            .modal-note a {
                color: #6366f1;
                text-decoration: none;
            }
            
            .modal-note a:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }
}

// Show Demo Message
function showDemoMessage() {
    showSuccessMessage('🎉 This is a demo! In production, you would be redirected to create your account and start invoicing.');
}

// Show Success Message
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

// Show Error Message
function showErrorMessage(message) {
    showNotification(message, 'error');
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    addNotificationStyles();
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add Notification Styles
function addNotificationStyles() {
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10001;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .notification-success {
                background: #10b981;
            }
            
            .notification-error {
                background: #ef4444;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize FAQ
function initializeFAQ() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Initialize Mobile Menu
function initializeMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

// Initialize Animations
function initializeAnimations() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.benefit, .testimonial, .step, .before, .after');
    animateElements.forEach(el => {
        el.classList.add('loading');
        observer.observe(el);
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Add mobile menu styles
function addMobileMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links.active {
                display: flex;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                padding: 1rem 2rem;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                border-top: 1px solid #e2e8f0;
            }
            
            .mobile-menu-toggle.active span:nth-child(1) {
                transform: rotate(-45deg) translate(-5px, 6px);
            }
            
            .mobile-menu-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-toggle.active span:nth-child(3) {
                transform: rotate(45deg) translate(-5px, -6px);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize mobile menu styles
addMobileMenuStyles();

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleSignUp,
        handleLogin,
        showNotification,
        initializeFAQ
    };
} 