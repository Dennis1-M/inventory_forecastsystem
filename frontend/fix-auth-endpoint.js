const fs = require('fs');
const path = require('path');

console.log("Fixing AuthContext.tsx to use /api/auth/me instead of /api/auth/verify...\n");

const filePath = path.join(__dirname, 'src/context/AuthContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Count occurrences
const verifyCount = (content.match(/auth\/verify/g) || []).length;
const meCount = (content.match(/auth\/me/g) || []).length;

console.log(`Found ${verifyCount} occurrences of 'auth/verify'`);
console.log(`Found ${meCount} occurrences of 'auth/me'`);

// Replace auth/verify with auth/me
const newContent = content.replace(/auth\/verify/g, 'auth/me');

if (content !== newContent) {
    // Backup
    fs.writeFileSync(filePath + '.backup', content);
    // Write new content
    fs.writeFileSync(filePath, newContent);
    console.log("✅ Fixed! Backup saved as AuthContext.tsx.backup");
    
    // Show the changed lines
    const oldLines = content.split('\n');
    const newLines = newContent.split('\n');
    
    console.log("\nChanges made:");
    for (let i = 0; i < Math.min(oldLines.length, newLines.length); i++) {
        if (oldLines[i] !== newLines[i]) {
            console.log(`Line ${i+1}:`);
            console.log(`  Was: ${oldLines[i]}`);
            console.log(`  Now: ${newLines[i]}`);
        }
    }
} else {
    console.log("❌ No changes needed - already using /auth/me");
}
