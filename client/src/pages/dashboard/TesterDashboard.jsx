import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/ui';
import {
  Bug,
  FolderKanban,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  ClipboardCheck,
  Hourglass,
  AlertTriangle,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Status configuration for tasks in review
const STATUS_CONFIG = {
  submitted: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  design_submitted: { label: 'Design Review', color: 'bg-yellow-100 text-yellow-700', chartColor: '#F59E0B' },
  content_submitted: { label: 'Content Review', color: 'bg-orange-100 text-orange-700', chartColor: '#F97316' },
  development_submitted: { label: 'Dev Review', color: 'bg-blue-100 text-blue-700', chartColor: '#3B82F6' },
  approved_by_tester: { label: 'Approved', color: 'bg-green-100 text-green-700', chartColor: '#10B981' },
  final_approved: { label: 'Final Approved', color: 'bg-emerald-100 text-emerald-700', chartColor: '#059669' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', chartColor: '#EF4444' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', chartColor: '#8B5CF6' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', chartColor: '#6B7280' },
};

// Task type labels
const TASK_TYPE_LABELS = {
  graphic_design: 'Graphic Design',
  video_editing: 'Video Editing',
  content_writing: 'Content Writing',
  content_creation: 'Content Creation',
  landing_page_design: 'Landing Page Design',
  landing_page_development: 'Landing Page Dev',
};

// Stat Card Component (matching Admin dashboard style)
function StatCard({ title, value, change, changeType, icon: Icon, iconBg }) {
  const isPositive = changeType === 'positive';
  return (
    <div className="stat-card-enhanced">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Hourglass size={16} className="text-orange-500" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-orange-600')}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl', iconBg)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Review Task Card Component
function ReviewTaskCard({ task, onReview }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const taskType = TASK_TYPE_LABELS[task.taskType] || task.taskType?.replace(/_/g, ' ') || 'Task';

  return (
    <div className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {taskType}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.creativeName || task.taskTitle || 'Review Task'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {task.projectId?.projectName || task.projectId?.businessName || 'Unknown Project'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={14} />
          <span>{formatDate(task.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(task)}
          >
            <Eye size={14} className="mr-1" />
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}

// Reviewed Task Card Component
function ReviewedTaskCard({ task }) {
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const isApproved = ['approved_by_tester', 'final_approved', 'approved'].includes(task.status);
  const taskType = TASK_TYPE_LABELS[task.taskType] || task.taskType?.replace(/_/g, ' ') || 'Task';

  return (
    <div className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {taskType}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.creativeName || task.taskTitle || 'Task'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {task.projectId?.projectName || task.projectId?.businessName || 'Unknown Project'}
          </p>
        </div>
        <div className="flex-shrink-0">
          {isApproved ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <XCircle size={20} className="text-red-500" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(task.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {}}
            className="text-gray-500"
          >
            View Details
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Dummy data for showcase
const DUMMY_PENDING_REVIEW = [
  {
    _id: 'review-1',
    taskTitle: 'Homepage Banner Design',
    taskType: 'graphic_design',
    creativeName: 'Hero Banner - Summer Sale',
    status: 'design_submitted',
    projectId: { _id: 'proj-1', projectName: 'TechCorp Landing Page', businessName: 'TechCorp' },
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'review-2',
    taskTitle: 'Product Video Edit',
    taskType: 'video_editing',
    creativeName: 'Product Demo Video',
    status: 'submitted',
    projectId: { _id: 'proj-1', projectName: 'TechCorp Landing Page', businessName: 'TechCorp' },
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'review-3',
    taskTitle: 'Blog Content Writing',
    taskType: 'content_writing',
    creativeName: '10 Tips for Better UX',
    status: 'content_submitted',
    projectId: { _id: 'proj-2', projectName: 'Fitness Pro Website', businessName: 'Fitness Pro' },
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'review-4',
    taskTitle: 'Landing Page Code Review',
    taskType: 'landing_page_development',
    creativeName: 'Homepage Implementation',
    status: 'development_submitted',
    projectId: { _id: 'proj-2', projectName: 'Fitness Pro Website', businessName: 'Fitness Pro' },
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'review-5',
    taskTitle: 'Social Media Graphics',
    taskType: 'graphic_design',
    creativeName: 'Instagram Story Templates',
    status: 'design_submitted',
    projectId: { _id: 'proj-3', projectName: 'E-commerce Store', businessName: 'ShopNow' },
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'review-6',
    taskTitle: 'Email Newsletter Design',
    taskType: 'graphic_design',
    creativeName: 'Weekly Newsletter Template',
    status: 'design_submitted',
    projectId: { _id: 'proj-3', projectName: 'E-commerce Store', businessName: 'ShopNow' },
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
];

const DUMMY_RECENTLY_REVIEWED = [
  {
    _id: 'reviewed-1',
    taskTitle: 'Logo Design',
    taskType: 'graphic_design',
    creativeName: 'Company Logo Variations',
    status: 'approved_by_tester',
    projectId: { _id: 'proj-1', projectName: 'TechCorp Landing Page', businessName: 'TechCorp' },
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'reviewed-2',
    taskTitle: 'Hero Image Design',
    taskType: 'graphic_design',
    creativeName: 'Hero Section Images',
    status: 'approved_by_tester',
    projectId: { _id: 'proj-2', projectName: 'Fitness Pro Website', businessName: 'Fitness Pro' },
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'reviewed-3',
    taskTitle: 'Banner Design',
    taskType: 'graphic_design',
    creativeName: 'Promotional Banner',
    status: 'rejected',
    projectId: { _id: 'proj-3', projectName: 'E-commerce Store', businessName: 'ShopNow' },
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'reviewed-4',
    taskTitle: 'Feature Video',
    taskType: 'video_editing',
    creativeName: 'Product Feature Showcase',
    status: 'approved_by_tester',
    projectId: { _id: 'proj-1', projectName: 'TechCorp Landing Page', businessName: 'TechCorp' },
    updatedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
  },
];

const DUMMY_MY_TASKS = [
  {
    _id: 'my-1',
    taskTitle: 'Test Landing Page',
    taskType: 'testing',
    status: 'pending',
    projectId: { _id: 'proj-1', projectName: 'TechCorp Landing Page' },
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'my-2',
    taskTitle: 'Mobile Responsive Test',
    taskType: 'testing',
    status: 'in_progress',
    projectId: { _id: 'proj-2', projectName: 'Fitness Pro Website' },
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

const DUMMY_PROJECTS = [
  {
    _id: 'proj-1',
    projectName: 'TechCorp Landing Page',
    businessName: 'TechCorp',
    customerName: 'John Smith',
    status: 'active',
    isActive: true,
    overallProgress: 65,
  },
  {
    _id: 'proj-2',
    projectName: 'Fitness Pro Website',
    businessName: 'Fitness Pro',
    customerName: 'Sarah Johnson',
    status: 'active',
    isActive: true,
    overallProgress: 80,
  },
  {
    _id: 'proj-3',
    projectName: 'E-commerce Store',
    businessName: 'ShopNow',
    customerName: 'Mike Davis',
    status: 'active',
    isActive: true,
    overallProgress: 45,
  },
];

export default function TesterDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingReview, setPendingReview] = useState([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [useDummyData, setUseDummyData] = useState(false);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalReviewed: 0,
    approvedCount: 0,
    rejectedCount: 0,
    myAssignedTasks: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch pending review tasks, my tasks, and projects in parallel
      const [pendingRes, myTasksRes, projectsRes] = await Promise.all([
        taskService.getPendingReview(),
        taskService.getMyRoleTasks ? taskService.getMyRoleTasks() : taskService.getMyTasks(),
        projectService.getProjects({ limit: 50 }),
      ]);

      const pendingTasks = pendingRes.data || [];
      const assignedTasks = myTasksRes.data || [];
      const allProjects = projectsRes.data || [];

      // Check if we have real data, if not use dummy data
      if (pendingTasks.length === 0) {
        setUseDummyData(true);
        setPendingReview(DUMMY_PENDING_REVIEW);
        setRecentlyReviewed(DUMMY_RECENTLY_REVIEWED);
        setMyTasks(DUMMY_MY_TASKS);
        setProjects(DUMMY_PROJECTS);
        calculateStats(DUMMY_PENDING_REVIEW, DUMMY_RECENTLY_REVIEWED, DUMMY_MY_TASKS);
      } else {
        setPendingReview(pendingTasks);
        setMyTasks(assignedTasks);
        setProjects(allProjects);

        const reviewed = pendingTasks.filter(t =>
          ['approved_by_tester', 'approved', 'rejected'].includes(t.status)
        ).slice(0, 5);
        setRecentlyReviewed(reviewed);
        calculateStats(pendingTasks, reviewed, assignedTasks);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use dummy data on error
      setUseDummyData(true);
      setPendingReview(DUMMY_PENDING_REVIEW);
      setRecentlyReviewed(DUMMY_RECENTLY_REVIEWED);
      setMyTasks(DUMMY_MY_TASKS);
      setProjects(DUMMY_PROJECTS);
      calculateStats(DUMMY_PENDING_REVIEW, DUMMY_RECENTLY_REVIEWED, DUMMY_MY_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pending, reviewed, assigned) => {
    const totalPending = pending.filter(t =>
      ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
    ).length;

    const approvedCount = reviewed.filter(t =>
      ['approved_by_tester', 'approved'].includes(t.status)
    ).length;

    const rejectedCount = reviewed.filter(t =>
      t.status === 'rejected'
    ).length;

    setStats({
      totalPending,
      totalReviewed: reviewed.length,
      approvedCount,
      rejectedCount,
      myAssignedTasks: assigned.length,
    });
  };

  // Prepare pie chart data for review status distribution
  const getReviewStatusData = () => {
    const pending = stats.totalPending;
    const approved = stats.approvedCount;
    const rejected = stats.rejectedCount;

    const data = [
      { name: 'Pending Review', value: pending, color: '#F59E0B' },
      { name: 'Approved', value: approved, color: '#10B981' },
      { name: 'Rejected', value: rejected, color: '#EF4444' },
    ];
    return data.filter(item => item.value > 0);
  };

  // Prepare bar chart data - tasks by type pending review
  const getTasksByTypeData = () => {
    const typeCount = {};

    pendingReview.forEach(task => {
      const type = task.taskType || task.creativeType || 'other';
      const label = TASK_TYPE_LABELS[type] || type.replace(/_/g, ' ');

      if (!typeCount[label]) {
        typeCount[label] = {
          name: label.length > 12 ? label.substring(0, 12) + '...' : label,
          fullName: label,
          count: 0,
        };
      }
      typeCount[label].count++;
    });

    return Object.values(typeCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  // Get pending review tasks grouped by type
  const getPendingByType = () => {
    const grouped = {};
    pendingReview.forEach(task => {
      const type = task.taskType || task.creativeType || 'other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(task);
    });
    return grouped;
  };

  // Handle review action
  const handleReview = (task) => {
    navigate('/tasks/review', { state: { taskId: task._id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const reviewStatusData = getReviewStatusData();
  const tasksByTypeData = getTasksByTypeData();
  const pendingByType = getPendingByType();
  const pendingTasks = pendingReview.filter(t =>
    ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
  ).slice(0, 6);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
            <Bug size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tester Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Tester'}! Review and approve submitted work.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <FolderKanban size={18} className="mr-2" />
            Projects
          </Button>
          <Button onClick={() => navigate('/tasks/review')} className="relative">
            <ClipboardCheck size={18} className="mr-2" />
            Review Queue
            {stats.totalPending > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.totalPending > 9 ? '9+' : stats.totalPending}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Review"
          value={String(stats.totalPending)}
          change={stats.totalPending > 0 ? 'Needs attention' : null}
          changeType="neutral"
          icon={Hourglass}
          iconBg="bg-gradient-to-br from-orange-400 to-orange-600"
        />
        <StatCard
          title="Approved This Week"
          value={String(stats.approvedCount)}
          change={stats.approvedCount > 0 ? 'Approved' : null}
          changeType="positive"
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard
          title="Rejected This Week"
          value={String(stats.rejectedCount)}
          icon={XCircle}
          iconBg="bg-gradient-to-br from-red-400 to-red-600"
        />
        <StatCard
          title="My Assigned Tasks"
          value={String(stats.myAssignedTasks)}
          icon={ClipboardCheck}
          iconBg="bg-gradient-to-br from-blue-400 to-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Review Status Distribution */}
        <div className="lg:col-span-1 chart-container-enhanced">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500">
              <PieChartIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Review Status</h3>
              <p className="text-sm text-gray-500">Distribution overview</p>
            </div>
          </div>

          {/* Custom legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {reviewStatusData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-500">{item.name}</span>
                <span className="text-xs font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          {reviewStatusData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {reviewStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No review data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Tasks by Type */}
        <div className="lg:col-span-2 chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pending by Task Type</h3>
                <p className="text-sm text-gray-500">Tasks awaiting review</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
              <p className="text-sm text-gray-500">Total pending</p>
            </div>
          </div>

          {tasksByTypeData.length > 0 ? (
            <div style={{ height: `${Math.max(tasksByTypeData.length * 42 + 60, 180)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksByTypeData}
                  layout="vertical"
                  barSize={22}
                  margin={{ left: 0, right: 28, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    horizontal={false}
                    vertical={true}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    width={120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} task${value !== 1 ? 's' : ''}`, 'Pending']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 14px',
                      fontSize: '13px',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {tasksByTypeData.map((entry, index) => {
                      const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];
                      return <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No pending reviews</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Review Section */}
      <div className="chart-container-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tasks Pending Review</h3>
              <p className="text-sm text-gray-500">Work submitted and awaiting your approval</p>
            </div>
            {stats.totalPending > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                {stats.totalPending} pending
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks/review')}>
            View All
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        {pendingTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <ReviewTaskCard
                key={task._id}
                task={task}
                onReview={handleReview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h4>
            <p className="text-sm text-gray-500 mb-4">
              No tasks pending review. Great job staying on top of things!
            </p>
            <Button variant="outline" onClick={() => navigate('/tasks')}>
              View All Tasks
            </Button>
          </div>
        )}
      </div>

      {/* Recently Reviewed Section */}
      {recentlyReviewed.length > 0 && (
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-500">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recently Reviewed</h3>
                <p className="text-sm text-gray-500">Your recent review activity</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyReviewed.slice(0, 6).map((task) => (
              <ReviewedTaskCard
                key={task._id}
                task={task}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/tasks/review')}
          className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl text-white text-left hover:shadow-lg transition-all duration-200"
        >
          <ClipboardCheck size={24} className="mb-2" />
          <p className="font-semibold">Review Queue</p>
          <p className="text-sm text-white/80 mt-1">Approve or reject submitted work</p>
          {stats.totalPending > 0 && (
            <Badge className="mt-2 bg-white/20 text-white">
              {stats.totalPending} pending
            </Badge>
          )}
        </button>
        <button
          onClick={() => navigate('/tasks')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <Bug size={24} className="mb-2 text-primary-500" />
          <p className="font-semibold">My Tasks</p>
          <p className="text-sm text-gray-500 mt-1">View your assigned tasks</p>
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <FolderKanban size={24} className="mb-2 text-green-500" />
          <p className="font-semibold">All Projects</p>
          <p className="text-sm text-gray-500 mt-1">Browse project overview</p>
        </button>
      </div>

      {/* Alert for high pending count */}
      {stats.totalPending > 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-orange-900">High Review Queue</p>
              <p className="text-sm text-orange-600">
                You have {stats.totalPending} tasks waiting for review. Consider prioritizing your review queue.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tasks/review')}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Start Reviewing
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}