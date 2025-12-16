#!/bin/bash
echo "Fixing endpoint URLs in SuperAdminDashboard.tsx..."

# Create backup
cp src/pages/SuperAdminDashboard.tsx src/pages/SuperAdminDashboard.tsx.backup

# Fix fetchUsers endpoint
sed -i "s|fetch('http://localhost:5001/api/users'|fetch('http://localhost:5001/api/admin/users'|g" src/pages/SuperAdminDashboard.tsx

# Fix setUsers and calculateStats to use data.data
sed -i "s|setUsers(data);|setUsers(data.data \|\| data);|g" src/pages/SuperAdminDashboard.tsx
sed -i "s|calculateStats(data);|calculateStats(data.data \|\| data);|g" src/pages/SuperAdminDashboard.tsx

echo "✅ Fix applied!"
echo "Backup saved as: src/pages/SuperAdminDashboard.tsx.backup"
