// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize the Express application
const app = express();
const port = 3000;

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse URL-encoded bodies (from form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Hardcoded user credentials for a simple example
const validUsername = 'testuser';
const validPassword = 'password';

// Route to serve the login page from the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route to serve the login page from the /login URL
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Route to handle the login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the provided credentials match the hardcoded ones
  if (username === validUsername && password === validPassword) {
    // If login is successful, send the homepage.html file directly from the public directory
    res.sendFile(path.join(__dirname, '../public/homepage.html'));
  } else {
    // If login fails, redirect back to the login page with an error flag
    res.redirect('/?error=1');
  }
});

// Start the server and listen for requests
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`To test, use username: "${validUsername}" and password: "${validPassword}"`);
});