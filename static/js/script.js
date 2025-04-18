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
    const userPanel = document.getElementById('user-panel');
    const addUserForm = document.getElementById('add-user-form');
    const userFormMessage = document.getElementById('user-form-message');
    
    // Tab elements
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Task and request elements
    const addTaskForm = document.getElementById('add-task-form');
    const addRequestForm = document.getElementById('add-request-form');
    const taskFormMessage = document.getElementById('task-form-message');
    const requestFormMessage = document.getElementById('request-form-message');
    const tasksList = document.getElementById('tasks-list');
    const requestsList = document.getElementById('requests-list');
    const taskOwnersSelect = document.getElementById('task-owners');
    
    // API endpoint - using the proxy path instead of direct hostname
    const API_URL = '/api';  // This will be proxied by our server to the auth-api container
    
    // Check if user is already logged in
    checkSession();
    
    // Toggle password visibility
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Handle login form submission
    if (loginForm) {
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
    }

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
                showMessage(userFormMessage, 'User created successfully!', 'success');
                
                // Reset form
                addUserForm.reset();
                
            } catch (error) {
                // Show error message
                showMessage(userFormMessage, error.message || 'An error occurred while creating the user', 'error');
            } finally {
                // Hide loading state
                setLoading(submitButton, false);
            }
        });
    }
    
    // Handle add task form submission
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = addTaskForm.querySelector('.submit-btn');
            setLoading(submitButton, true);
            
            const description = document.getElementById('task-description').value;
            
            // Get selected owners
            const ownerSelect = document.getElementById('task-owners');
            const selectedOwners = Array.from(ownerSelect.selectedOptions).map(option => parseInt(option.value));
            
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('You must be logged in to add tasks');
                }
                
                const response = await fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        description: description,
                        owner_ids: selectedOwners
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create task');
                }
                
                showMessage(taskFormMessage, 'Task created successfully!', 'success');
                addTaskForm.reset();
                
                // Refresh tasks list
                loadTasks();
                
            } catch (error) {
                showMessage(taskFormMessage, error.message || 'An error occurred while creating the task', 'error');
            } finally {
                setLoading(submitButton, false);
            }
        });
    }
    
    // Handle add request form submission
    if (addRequestForm) {
        addRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitButton = addRequestForm.querySelector('.submit-btn');
            setLoading(submitButton, true);
            
            const description = document.getElementById('request-description').value;
            
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('You must be logged in to submit requests');
                }
                
                const response = await fetch(`${API_URL}/requests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        description: description
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to submit request');
                }
                
                showMessage(requestFormMessage, 'Request submitted successfully!', 'success');
                addRequestForm.reset();
                
                // Refresh requests list
                loadRequests();
                
            } catch (error) {
                showMessage(requestFormMessage, error.message || 'An error occurred while submitting the request', 'error');
            } finally {
                setLoading(submitButton, false);
            }
        });
    }
    
    // Tab switching functionality
    if (tabItems && tabItems.length > 0) {
        tabItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                
                // Remove active class from all tabs
                tabItems.forEach(tab => tab.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding pane
                item.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
    
    // Handle logout button click
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            welcomeScreen.classList.add('hidden');
            document.querySelector('.container').style.display = 'flex';
            if (loginForm) loginForm.reset();
        });
    }
    
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
            
            // Check roles and show appropriate panel
            if (user.roles.includes('admin') && adminPanel) {
                adminPanel.classList.remove('hidden');
            } else if (userPanel) {
                userPanel.classList.remove('hidden');
                // Load task owners, tasks and requests for regular users
                loadUsers();
                loadTasks();
                loadRequests();
            }
            
            return user;
        } catch (error) {
            throw error;
        }
    }
    
    // Load all users for task owners select
    async function loadUsers() {
        if (!taskOwnersSelect) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const response = await fetch(`${API_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load users');
            }
            
            const data = await response.json();
            
            // Clear current options
            taskOwnersSelect.innerHTML = '';
            
            // Add each user as an option
            data.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name || user.username;
                taskOwnersSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    // Load tasks for current user
    async function loadTasks() {
        if (!tasksList) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load tasks');
            }
            
            const data = await response.json();
            
            // Clear current tasks
            tasksList.innerHTML = '';
            
            if (data.tasks.length === 0) {
                tasksList.innerHTML = '<div class="empty-message">No tasks found</div>';
                return;
            }
            
            // Add each task to the list
            data.tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'item';
                
                const ownerNames = task.owners.map(owner => owner.name || owner.username).join(', ');
                const createdAt = new Date(task.created_at).toLocaleString();
                
                taskElement.innerHTML = `
                    <div class="item-header">
                        <div class="item-title">Task #${task.id}</div>
                        <div class="item-meta">${createdAt}</div>
                    </div>
                    <div class="item-description">${task.description}</div>
                    <div class="item-owners">Owners: ${ownerNames}</div>
                `;
                
                tasksList.appendChild(taskElement);
            });
            
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasksList.innerHTML = '<div class="empty-message">Failed to load tasks</div>';
        }
    }
    
    // Load requests for current user
    async function loadRequests() {
        if (!requestsList) return;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            
            const response = await fetch(`${API_URL}/requests`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load requests');
            }
            
            const data = await response.json();
            
            // Clear current requests
            requestsList.innerHTML = '';
            
            if (data.requests.length === 0) {
                requestsList.innerHTML = '<div class="empty-message">No requests found</div>';
                return;
            }
            
            // Add each request to the list
            data.requests.forEach(request => {
                const requestElement = document.createElement('div');
                requestElement.className = 'item';
                
                const createdAt = new Date(request.created_at).toLocaleString();
                
                requestElement.innerHTML = `
                    <div class="item-header">
                        <div class="item-title">Request #${request.id}</div>
                        <div class="item-meta">${createdAt}</div>
                    </div>
                    <div class="item-description">${request.description}</div>
                    <div class="item-owners">Solicitor: ${request.solicitor.name || request.solicitor.username}</div>
                `;
                
                requestsList.appendChild(requestElement);
            });
            
        } catch (error) {
            console.error('Error loading requests:', error);
            requestsList.innerHTML = '<div class="empty-message">Failed to load requests</div>';
        }
    }
    
    // Show error message for login form
    function showError(message) {
        if (!errorMessage) return;
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('active');
        }, 5000);
    }
    
    // Show message for any form
    function showMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.classList.remove('error', 'success');
        element.classList.add(type);
        
        // Hide after 5 seconds
        setTimeout(() => {
            element.classList.remove(type);
            element.textContent = '';
        }, 5000);
    }
    
    // Set loading state for any button
    function setLoading(button, isLoading) {
        if (!button) return;
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
});