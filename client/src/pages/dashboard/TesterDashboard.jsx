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
import { STATUS_CONFIG, getStatusConfig, CHART_COLORS, CHART_PALETTE } from '@/constants/taskStatuses';
import { EmptyState } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

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
  const statusConfig = getStatusConfig(task.status);
  const taskType = TASK_TYPE_LABELS[task.taskType] || task.taskType?.replace(/_/g, ' ') || 'Task';

  return (
    <div className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
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
  const statusConfig = getStatusConfig(task.status);
  // Approved statuses: tester approved (ready for marketer) or fully approved
  const isApproved = ['approved_by_tester', 'final_approved', 'design_approved', 'development_approved', 'content_final_approved'].includes(task.status);
  const taskType = TASK_TYPE_LABELS[task.taskType] || task.taskType?.replace(/_/g, ' ') || 'Task';

  return (
    <div className="project-card-enhanced">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
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

export default function TesterDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReview, setPendingReview] = useState([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [projects, setProjects] = useState([]);
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
      setError(null);

      // Fetch pending review tasks, my tasks, and projects in parallel
      const [pendingRes, myTasksRes, projectsRes] = await Promise.all([
        taskService.getPendingReview(),
        taskService.getMyRoleTasks ? taskService.getMyRoleTasks() : taskService.getMyTasks(),
        projectService.getProjects({ limit: 50 }),
      ]);

      const pendingTasks = pendingRes.data || [];
      const assignedTasks = myTasksRes.data || [];
      const allProjects = projectsRes.data || [];

      setPendingReview(pendingTasks);
      setMyTasks(assignedTasks);
      setProjects(allProjects);

      // Tasks that have been reviewed by this tester
      // These are tasks where testerReviewedBy equals the current user
      const currentUserId = user?._id;
      const reviewed = assignedTasks.filter(t =>
        t.testerReviewedBy?._id === currentUserId ||
        t.testerReviewedBy === currentUserId ||
        ['approved_by_tester', 'content_final_approved', 'design_approved', 'development_approved', 'content_rejected', 'design_rejected'].includes(t.status)
      ).slice(0, 5);
      setRecentlyReviewed(reviewed);

      calculateStats(pendingTasks, assignedTasks, reviewed);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (pendingTasks, assignedTasks, reviewedTasks) => {
    // Tasks waiting for tester review (submitted statuses)
    const totalPending = pendingTasks.filter(t =>
      ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
    ).length;

    // Tasks approved by tester
    const approvedCount = assignedTasks.filter(t =>
      ['approved_by_tester', 'content_final_approved', 'design_approved', 'development_approved'].includes(t.status)
    ).length;

    // Tasks rejected by tester
    const rejectedCount = assignedTasks.filter(t =>
      ['content_rejected', 'design_rejected', 'rejected'].includes(t.status)
    ).length;

    setStats({
      totalPending,
      totalReviewed: reviewedTasks.length,
      approvedCount,
      rejectedCount,
      myAssignedTasks: assignedTasks.length,
    });
  };

  // Prepare pie chart data for review status distribution
  const getReviewStatusData = () => {
    // Count by actual task status
    const pending = pendingReview.filter(t =>
      ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
    ).length;

    const approved = myTasks.filter(t =>
      ['approved_by_tester', 'content_final_approved', 'design_approved', 'development_approved'].includes(t.status)
    ).length;

    const rejected = myTasks.filter(t =>
      ['content_rejected', 'design_rejected', 'rejected'].includes(t.status)
    ).length;

    const data = [
      { name: 'Pending Review', value: pending, color: CHART_COLORS.pending },
      { name: 'Approved', value: approved, color: CHART_COLORS.approved },
      { name: 'Rejected', value: rejected, color: CHART_COLORS.rejected },
    ];

    // Always show all categories, even if 0
    return data;
  };

  // Prepare bar chart data - tasks by type pending review
  const getTasksByTypeData = () => {
    const typeCount = {};

    // Filter to only submitted tasks awaiting review
    const submittedTasks = pendingReview.filter(t =>
      ['submitted', 'design_submitted', 'content_submitted', 'development_submitted'].includes(t.status)
    );

    submittedTasks.forEach(task => {
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

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Dashboard"
          description={error}
          action={
            <Button onClick={fetchDashboardData}>
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  const reviewStatusData = getReviewStatusData();
  const tasksByTypeData = getTasksByTypeData();
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

          {stats.totalPending > 0 || stats.approvedCount > 0 || stats.rejectedCount > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewStatusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {reviewStatusData.filter(item => item.value > 0).map((entry, index) => (
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
                      return <Cell key={`bar-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />;
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