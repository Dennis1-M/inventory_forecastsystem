// src/pages/manager/Dashboard.tsx - WITH REAL API CALLS
import { useEffect, useState } from 'react';
import {
    FaArrowDown,
    FaArrowUp,
    FaBox,
    FaCalendarAlt,
    FaClipboardList,
    FaExclamationTriangle,
    FaShoppingCart,
    FaSpinner,
    FaSync,
    FaTasks, FaUsers, FaWarehouse
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { managerApi } from '../../services/managerApi';

interface DashboardStats {
  pendingOrders: number;
  lowStockItems: number;
  activeStaff: number;
  totalStaff: number;
  pendingTasks: number;
  todayShipments: number;
  warehouseUtilization: number;
  orderAccuracy: number;
  totalSales: number;
  totalInventoryValue: number;
}

interface Task {

    id: number;
    title: string;
    type: string;
    priority: 'high' | 'medium' | 'low' | 'urgent';
    dueDate: string;
    assignedTo?: string;
    status: string;
}

interface StaffMember {
  id: number;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'off';
  currentTasks: number;
}   



interface UrgentTask {
  id: number;
  title: string;
  type: 'stock_request' | 'staff_assignment' | 'inventory_check' | 'order_issue';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  assignedTo?: string;
  status: string;
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Fetch all data in parallel
    const [statsData, tasksData, staffData] = await Promise.all([
      managerApi.getDashboardStats().catch(err => {
        console.error('Error fetching stats:', err);
        return {
          pendingOrders: 0,
          lowStockItems: 0,
          activeStaff: 0,
          totalStaff: 0,
          pendingTasks: 0,
          todayShipments: 0,
          warehouseUtilization: 0,
          orderAccuracy: 0,
          totalSales: 0,
          totalInventoryValue: 0
        } as DashboardStats;
      }),
      managerApi.getTasks().catch(err => {
        console.error('Error fetching tasks:', err);
        return [];
      }),
      managerApi.getStaff().catch(err => {
        console.error('Error fetching staff:', err);
        return [];
      })
    ]);
    
    setStats(statsData);
    
    // Calculate task counts per staff
    const taskCounts = new Map<number, number>();
    tasksData.forEach(task => {
      if (task.assignedTo) {
        const count = taskCounts.get(task.assignedTo) || 0;
        taskCounts.set(task.assignedTo, count + 1);
      }
    });
    
    // Convert User[] to ExtendedStaffMember[]
    const extendedStaff = staffData.map((member) => ({  
        id: member.id,
        name: member.name,
        role: member.role,
        currentTasks: taskCounts.get(member.id) || 0,
    }));
    
    // Create urgent tasks (only high priority)
    const highPriorityTasks = tasksData.filter(task => task.priority === 'high');
    const urgent: UrgentTask[] = highPriorityTasks
      .slice(0, 4)
      .map(task => {
        // Find assigned staff name
        const assignedStaff = staffData.find(s => s.id === task.assignedTo);
        
        return {
          id: task.id,
          title: task.title || 'Untitled Task',
          type: getTaskType(task.taskType),
          priority: task.priority as 'high',
          dueDate: formatDate(task.dueDate || new Date().toISOString()),
          assignedTo: assignedStaff?.name || task.assignedToName || 'Unassigned',
          status: task.status || 'pending'
        };
      });
    
    setUrgentTasks(urgent);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // You might want to show an error message to the user
    alert('Failed to load dashboard data. Please try again.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

    const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    };
 const getTaskType = (taskType: string): UrgentTask['type'] => {
  // If taskType is undefined or empty, return a default
  if (!taskType) return 'staff_assignment';
  
  const normalizedType = taskType.toLowerCase().replace('_', ' ').replace('-', ' ');
  
  if (normalizedType.includes('inventory') || normalizedType.includes('stock') || normalizedType.includes('check')) {
    return 'inventory_check';
  }
  if (normalizedType.includes('purchase') || normalizedType.includes('order') || normalizedType.includes('stock request')) {
    return 'stock_request';
  }
  if (normalizedType.includes('staff') || normalizedType.includes('assignment') || normalizedType.includes('team')) {
    return 'staff_assignment';
  }
  if (normalizedType.includes('order') || normalizedType.includes('issue') || normalizedType.includes('problem')) {
    return 'order_issue';
  }
  
  return 'staff_assignment'; // Default fallback
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'stock_request': return <FaBox className="text-red-500" />;
      case 'staff_assignment': return <FaUsers className="text-blue-500" />;
      case 'inventory_check': return <FaWarehouse className="text-green-500" />;
      case 'order_issue': return <FaShoppingCart className="text-yellow-500" />;
      default: return <FaTasks className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeStaff = staff.filter(s => s.status === 'available').length;
  const totalStaff = staff.length;

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-green-600 text-2xl" />
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="bg-linear-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50"
              >
                <FaSync className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
            <p className="text-gray-600 mt-1">Real-time operations overview</p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/manager/tasks/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaTasks />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Orders */}
        <Link to="/manager/orders" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.pendingOrders || 0}
                </h3>
                <div className="flex items-center mt-1">
                  {stats && stats.pendingOrders > 20 ? (
                    <FaArrowUp className="text-red-500 text-xs mr-1" />
                  ) : (
                    <FaArrowDown className="text-green-500 text-xs mr-1" />
                  )}
                  <span className="text-xs text-gray-500">
                    {stats && stats.pendingOrders > 20 ? 'High volume' : 'Normal'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaShoppingCart className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </Link>

        {/* Low Stock Items */}
        <Link to="/manager/inventory/low-stock" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">
                  {stats?.lowStockItems || 0}
                </h3>
                <p className="text-xs text-red-600 mt-1">Needs attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </Link>

        {/* Active Staff */}
        <Link to="/manager/team" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {activeStaff}/{totalStaff}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {totalStaff > 0 ? `${Math.round((activeStaff / totalStaff) * 100)}% present` : 'No data'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Tasks */}
        <Link to="/manager/tasks" className="block">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {tasks.length}
                </h3>
                <div className="flex items-center mt-1">
                  {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length > 0 ? (
                    <FaExclamationTriangle className="text-red-500 text-xs mr-1" />
                  ) : (
                    <FaArrowDown className="text-green-500 text-xs mr-1" />
                  )}
                  <span className="text-xs text-gray-500">
                    {tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length} urgent
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaClipboardList className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Urgent Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Urgent Tasks</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {urgentTasks.length} urgent tasks
              </span>
              <Link to="/manager/tasks" className="text-sm text-green-600 hover:text-green-700">
                View All Tasks
              </Link>
            </div>
          </div>
        </div>
        <div className="p-6">
          {urgentTasks.length > 0 ? (
            <div className="space-y-4">
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {getTaskTypeIcon(task.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                        {task.assignedTo && (
                          <span className="text-sm text-gray-500">Assigned to: {task.assignedTo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/manager/tasks/${task.id}`)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Handle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No urgent tasks at the moment
            </div>
          )}
        </div>
      </div>

      {/* Staff Availability & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Availability */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Staff Availability</h3>
          <div className="space-y-4">
            {staff.slice(0, 4).map((member) => (
              <div key={member.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-medium">{member.name.charAt(0)}</span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'available' ? 'bg-green-500' :
                      member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{member.currentTasks} tasks</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        member.currentTasks >= 5 ? 'bg-red-600' :
                        member.currentTasks >= 3 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(member.currentTasks * 20, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/manager/team"
            className="block w-full mt-4 py-2 text-center text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            View All Staff
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/manager/stock/request')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition"
            >
              <div className="p-3 bg-red-100 rounded-full mb-2">
                <FaBox className="text-red-600 text-xl" />
              </div>
              <span className="font-medium">Request Stock</span>
              <span className="text-sm text-gray-500">Order new inventory</span>
            </button>

            <button
              onClick={() => navigate('/manager/tasks/assign')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
            >
              <div className="p-3 bg-blue-100 rounded-full mb-2">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <span className="font-medium">Assign Task</span>
              <span className="text-sm text-gray-500">To staff member</span>
            </button>

            <button
              onClick={() => navigate('/manager/inventory/movement')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition"
            >
              <div className="p-3 bg-green-100 rounded-full mb-2">
                <FaWarehouse className="text-green-600 text-xl" />
              </div>
              <span className="font-medium">Track Movement</span>
              <span className="text-sm text-gray-500">Inventory flow</span>
            </button>

            <button
              onClick={() => navigate('/manager/orders')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition"
            >
              <div className="p-3 bg-yellow-100 rounded-full mb-2">
                <FaShoppingCart className="text-yellow-600 text-xl" />
              </div>
              <span className="font-medium">Process Orders</span>
              <span className="text-sm text-gray-500">Review & approve</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}