const fs = require('fs');
const path = require('path');

console.log("Applying complete auth fix...\n");

const filePath = path.join(__dirname, 'src/context/AuthContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace verify with me
content = content.replace(/auth\/verify/g, 'auth/me');

// 2. Fix response handling - remove "data.user ||" since /auth/me returns user directly
// Look for pattern: return data.user || data;
const lines = content.split('\n');
let changed = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('return data.user || data;')) {
        console.log(`Found line ${i+1}: ${lines[i]}`);
        lines[i] = lines[i].replace('return data.user || data;', 'return data;');
        changed = true;
        console.log(`Changed to: ${lines[i]}`);
    }
}

if (changed) {
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath + '.backup2', fs.readFileSync(filePath, 'utf8'));
    fs.writeFileSync(filePath, newContent);
    console.log("\n✅ Response handling fixed!");
} else {
    console.log("\n⚠️  Response handling already correct or pattern not found");
}

console.log("\nUpdated checkAuth function should look like:");
console.log(`
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data; // /api/auth/me returns user object directly
      }
      return null;
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  };
`);
