import { useEffect, useState } from 'react';
import {
  FaBell,
  FaBox,
  FaChartBar,
  FaChartLine,
  FaClipboardList,
  FaShoppingCart,
  FaUsers,
  FaUserTie
} from 'react-icons/fa';
import AccountDropdown from '../../components/AccountDropdown';
import { useAuth } from '../../context/AuthContext';



interface ActivityItem {
  id: number;
  type: string;
  title: string;
  time: string;
  icon: string;
}



export default function ManagerDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    teamMembers: 0,
    activeProducts: 0,
    todaySales: 0,
    performance: 0
  });

    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    console.log('👔 Manager Dashboard loaded for:', user?.email);
    fetchManagerStats();
    fetchRecentActivities();
  }, [user]);

  const fetchManagerStats = async () => {
    try {
      if (!token) return;
      
      const response = await fetch('http://localhost:5000/api/manager/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching manager stats:', error);
      // Set default stats for demo
      setStats({
        teamMembers: 12,
        activeProducts: 156,
        todaySales: 45230,
        performance: 18.5
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      if (!token) return;
      
      const response = await fetch('http://localhost:5000/api/manager/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Set default activities for demo
      setRecentActivities([
        { id: 1, type: 'STAFF_ONBOARD', title: 'New staff member onboarded', time: '2 hours ago', icon: 'user' },
        { id: 2, type: 'INVENTORY_RESTOCK', title: 'Inventory restocked', time: '4 hours ago', icon: 'box' },
        { id: 3, type: 'SALES_REPORT', title: 'Daily sales report generated', time: '6 hours ago', icon: 'chart' }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    MANAGER
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <FaBell size={20} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <AccountDropdown
                userName={user?.name || ''}
                userEmail={user?.email || ''}
                userRole={user?.role || ''}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome, <span className="text-blue-600">{user?.name}</span>
          </h1>
          <p className="text-gray-600">Manage your team and oversee daily operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <FaUsers className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <FaBox className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <FaShoppingCart className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-purple-600">KES {stats.todaySales.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <FaChartLine className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-yellow-600">+{stats.performance}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Recent Activities</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {activity.icon === 'user' && <FaUserTie className="text-blue-500" />}
                      {activity.icon === 'box' && <FaBox className="text-green-500" />}
                      {activity.icon === 'chart' && <FaChartBar className="text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.type === 'STAFF_ONBOARD' ? 'bg-blue-100 text-blue-800' :
                      activity.type === 'INVENTORY_RESTOCK' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {activity.type === 'STAFF_ONBOARD' ? 'Staff' :
                       activity.type === 'INVENTORY_RESTOCK' ? 'Inventory' : 'Sales'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Team Performance */}
            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
              <div className="space-y-3">
                {[
                  { name: 'John Doe', role: 'Senior Staff', sales: 'KES 25,430', progress: 85 },
                  { name: 'Jane Smith', role: 'Staff', sales: 'KES 18,920', progress: 72 },
                  { name: 'Bob Johnson', role: 'Junior Staff', sales: 'KES 12,150', progress: 60 },
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold mr-3">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{member.sales}</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${member.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{member.progress}% target</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center">
                  <FaClipboardList className="mr-3" />
                  View Team Reports
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center">
                  <FaBox className="mr-3" />
                  Manage Inventory
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center">
                  <FaChartBar className="mr-3" />
                  Sales Analytics
                </button>
                <button className="w-full text-left px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition flex items-center">
                  <FaUsers className="mr-3" />
                  Team Schedule
                </button>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Monthly Sales Review</p>
                      <p className="text-sm text-gray-500">Tomorrow, 10:00 AM</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Meeting</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Inventory Audit</p>
                      <p className="text-sm text-gray-500">Friday, 2:00 PM</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Audit</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Team Training</p>
                      <p className="text-sm text-gray-500">Next Monday, 9:00 AM</p>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Training</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Manager Permissions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Your Permissions</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  View and manage team members
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Access sales and inventory reports
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Approve staff schedules
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Generate performance reports
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                  Cannot register new users
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                  Cannot delete users
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}