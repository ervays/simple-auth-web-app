document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginButton = document.querySelector('.login-btn');
    const togglePasswordButton = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const welcomeScreen = document.getElementById('welcome-screen');
    const userName = document.getElementById('user-name');
    const userRoles = document.getElementById('user-roles');
    const logoutButton = document.getElementById('logout-btn');
    
    // API endpoint - can be overridden with environment variable
    const API_URL = window.API_URL || 'http://localhost:5000';
    
    // Check if user is already logged in
    checkSession();
    
    // Toggle password visibility
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        setLoading(true);
        
        try {
            // Call login API
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store session token in local storage
            localStorage.setItem('authToken', data.session_token);
            localStorage.setItem('userId', data.user_id);
            
            // Get user details
            await getUserDetails(data.session_token);
            
        } catch (error) {
            // Show error message
            showError(error.message || 'An error occurred during login. Please try again.');
        } finally {
            // Hide loading state
            setLoading(false);
        }
    });
    
    // Handle logout button click
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        welcomeScreen.classList.add('hidden');
        document.querySelector('.container').style.display = 'flex';
        loginForm.reset();
    });
    
    // Check if user has a valid session
    async function checkSession() {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            try {
                await getUserDetails(token);
            } catch (error) {
                // Token is invalid, remove it
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
            }
        }
    }
    
    // Get user details with token
    async function getUserDetails(token) {
        try {
            const response = await fetch(`${API_URL}/api/user`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });
            
            if (!response.ok) {
                throw new Error('Invalid session');
            }
            
            const user = await response.json();
            
            // Show welcome screen
            userName.textContent = user.first_name || user.username;
            userRoles.textContent = user.roles.join(', ');
            welcomeScreen.classList.remove('hidden');
            document.querySelector('.container').style.display = 'none';
            
            return user;
        } catch (error) {
            throw error;
        }
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('active');
        }, 5000);
    }
    
    // Set loading state
    function setLoading(isLoading) {
        if (isLoading) {
            loginButton.classList.add('loading');
            loginButton.disabled = true;
        } else {
            loginButton.classList.remove('loading');
            loginButton.disabled = false;
        }
    }
});