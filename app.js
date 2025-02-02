let currentUser = null;

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        currentUser = data.username;
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser;
        loadWatchlist(data.watchlist);
    } catch (error) {
        alert(error.message);
    }
}

async function signup() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Signup failed');
        }

        alert('Account created successfully! Please login');
        showLogin();
    } catch (error) {
        alert(error.message);
    }
}

async function saveWatchlist() {
    try {
        const items = Array.from(document.querySelectorAll('#watchList li'))
            .map(li => ({ title: li.textContent }));
            
        await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: currentUser,
                watchlist: items
            })
        });
    } catch (error) {
        alert('Failed to save watchlist');
    }
}

function loadWatchlist(items) {
    const list = document.getElementById('watchList');
    list.innerHTML = items.map(item => `
        <li>${item.title}</li>
    `).join('');
}

function addItem() {
    const titleInput = document.getElementById('titleInput');
    const title = titleInput.value.trim();
    
    if (title) {
        const list = document.getElementById('watchList');
        list.innerHTML += `<li>${title}</li>`;
        titleInput.value = '';
        saveWatchlist();
    }
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function logout() {
    currentUser = null;
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('appContainer').style.display = 'none';
}