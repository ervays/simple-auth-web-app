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
    const adminPanel = document.getElementById('admin-panel');
    const addUserForm = document.getElementById('add-user-form');
    const userFormMessage = document.getElementById('user-form-message');
    
    // API endpoint - using the proxy path instead of direct hostname
    const API_URL = '/api';  // This will be proxied by our server to the auth-api container
    
    // Check if user is already logged in
    checkSession();
    
    // Toggle password visibility
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        setLoading(loginButton, true);
        
        try {
            // Call login API
            const response = await fetch(`${API_URL}/login`, {
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
            setLoading(loginButton, false);
        }
    });

    // Handle add user form submission (for admin users)
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get the submit button
            const submitButton = addUserForm.querySelector('.submit-btn');
            
            // Show loading state
            setLoading(submitButton, true);
            
            // Get form data
            const formData = {
                username: document.getElementById('new-username').value,
                password: document.getElementById('new-password').value,
                email: document.getElementById('new-email').value,
                first_name: document.getElementById('new-first-name').value,
                last_name: document.getElementById('new-last-name').value,
                is_admin: document.getElementById('is-admin').checked
            };
            
            try {
                // Get auth token
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('You must be logged in to add users');
                }
                
                // Call API to create user
                const response = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create user');
                }
                
                // Show success message
                showUserFormMessage('User created successfully!', 'success');
                
                // Reset form
                addUserForm.reset();
                
            } catch (error) {
                // Show error message
                showUserFormMessage(error.message || 'An error occurred while creating the user', 'error');
            } finally {
                // Hide loading state
                setLoading(submitButton, false);
            }
        });
    }
    
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
            const response = await fetch(`${API_URL}/user`, {
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
            
            // Check if user is admin and show admin panel if they are
            if (user.roles.includes('admin') && adminPanel) {
                adminPanel.classList.remove('hidden');
            }
            
            return user;
        } catch (error) {
            throw error;
        }
    }
    
    // Show error message for login form
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('active');
        }, 5000);
    }
    
    // Show message for user form (add user)
    function showUserFormMessage(message, type) {
        userFormMessage.textContent = message;
        userFormMessage.classList.remove('error', 'success');
        userFormMessage.classList.add(type);
        
        // Hide after 5 seconds
        setTimeout(() => {
            userFormMessage.classList.remove(type);
            userFormMessage.textContent = '';
        }, 5000);
    }
    
    // Set loading state for any button
    function setLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
});