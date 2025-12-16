// src/pages/manager/AssignTask.tsx - SIMPLE VERSION
import { useEffect, useState } from 'react';
import { managerApi } from '../../services/managerApi';

import { FaCheckCircle, FaCalendar, FaClock, FaPlus, FaUser } from 'react-icons/fa';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
}

interface Task {
  id: number;
  title: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
}

export default function AssignTask() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members
      const staff = await managerApi.getStaff();
      const members: TeamMember[] = staff.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }));
      setTeamMembers(members);
      
      // Fetch existing tasks
      const tasksData = await managerApi.getTasks();
      const formattedTasks: Task[] = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        assignedTo: task.assignedToName,
        status: task.status as 'pending' | 'in_progress' | 'completed',
        dueDate: task.dueDate
      }));
      setTasks(formattedTasks);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const activeMembers = teamMembers.filter(m => m.isActive);
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Task Assignment</h1>
        <p className="text-gray-600">View and manage tasks for team members</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUser className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Team Members</p>
              <p className="text-xl font-semibold">{activeMembers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaClock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Tasks</p>
              <p className="text-xl font-semibold">{pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Tasks</p>
              <p className="text-xl font-semibold">{completedTasks}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Members Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <span className="text-sm text-gray-500">{activeMembers.length} active</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMembers.slice(0, 6).map((member) => {
              const memberTasks = tasks.filter(t => 
                t.assignedTo.toLowerCase().includes(member.name.toLowerCase())
              );
              
              return (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="font-medium text-gray-700">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Assigned Tasks:</span>
                      <span className="font-medium">{memberTasks.length}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        memberTasks.length > 0 ? 
                        (memberTasks.some(t => t.status === 'pending') ? 'pending' : 'in_progress') : 
                        'completed'
                      )}`}>
                        {memberTasks.length > 0 ? 'Has Tasks' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {activeMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaUser className="mx-auto text-gray-300 mb-2" size={48} />
              <p>No active team members found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Tasks Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Task</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Assigned To</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Due Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 5).map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium">{task.title}</div>
                    </td>
                    <td className="py-3 text-gray-600">{task.assignedTo}</td>
                    <td className="py-3">
                      <div className="flex items-center text-gray-600">
                        <FaCalendar size={14} className="mr-1" />
                        {formatDate(task.dueDate)}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaClock className="mx-auto text-gray-300 mb-2" size={48} />
                <p>No tasks found</p>
              </div>
            )}
          </div>
          
          {tasks.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                View All Tasks →
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Simple Action Button */}
      <div className="flex justify-center">
        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FaPlus size={20} />
          <span>Create New Task</span>
        </button>
      </div>
    </div>
  );
}