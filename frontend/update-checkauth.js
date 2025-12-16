const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/context/AuthContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the checkAuth function
const start = content.indexOf('const checkAuth = async () => {');
if (start === -1) {
    console.log('Could not find checkAuth function');
    process.exit(1);
}

// Find the end of the function
let braceCount = 0;
let end = start;
for (let i = start; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            end = i + 1;
            break;
        }
    }
}

const oldFunction = content.substring(start, end);
console.log('Current checkAuth function:');
console.log(oldFunction);

// Create new function
const newFunction = `  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // Verify token with backend using /api/auth/me
        const response = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': \`Bearer \${storedToken}\`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Token is valid
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
    setLoading(false);
  };`;

// Replace the function
const newContent = content.substring(0, start) + newFunction + content.substring(end);
fs.writeFileSync(filePath + '.new', newContent);
console.log('\n✅ Created updated file: AuthContext.tsx.new');
console.log('\nReplace the old file with the new one, or manually update checkAuth function.');
