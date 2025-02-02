const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const saltRounds = 10;

// Initialize directories
async function initialize() {
    await fs.mkdir('users/watchlists', { recursive: true });
    if (!(await fileExists('users/credentials.json'))) {
        await fs.writeFile('users/credentials.json', '{}');
    }
}

async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

initialize();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/public')));

// API Endpoints
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const sanitizedUsername = username.replace(/[^a-z0-9]/gi, '_');
        const credentials = JSON.parse(await fs.readFile('users/credentials.json'));
        
        if (!credentials[sanitizedUsername] || !await bcrypt.compare(password, credentials[sanitizedUsername])) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const watchlist = await fs.readFile(`users/watchlists/${sanitizedUsername}.json`, 'utf8');
        res.json({ username: sanitizedUsername, watchlist: JSON.parse(watchlist) });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const sanitizedUsername = username.replace(/[^a-z0-9]/gi, '_');
        const credentials = JSON.parse(await fs.readFile('users/credentials.json'));
        
        if (credentials[sanitizedUsername]) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        credentials[sanitizedUsername] = hashedPassword;
        
        await fs.writeFile(`users/watchlists/${sanitizedUsername}.json`, '[]');
        await fs.writeFile('users/credentials.json', JSON.stringify(credentials));
        
        res.json({ success: true });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/save', async (req, res) => {
    try {
        const { username, watchlist } = req.body;
        const sanitizedUsername = username.replace(/[^a-z0-9]/gi, '_');
        
        await fs.writeFile(
            `users/watchlists/${sanitizedUsername}.json`,
            JSON.stringify(watchlist)
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Save failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));