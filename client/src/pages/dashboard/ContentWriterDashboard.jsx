import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Card, CardBody, Badge, Spinner, Button, EmptyState } from '@/components/ui';
import {
  FileText,
  FolderKanban,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  PenTool,
  Sparkles,
  RefreshCw,
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
import { STATUS_CONFIG, getStatusConfig, CHART_COLORS } from '@/constants/taskStatuses';

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
                <ArrowUpRight size={16} className="text-green-500" />
              ) : (
                <ArrowDownRight size={16} className="text-orange-500" />
              )}
              <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-orange-600')}>
                {change}
              </span>
              <span className="text-xs text-gray-400">vs last week</span>
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

// Task Card Component with hover effects
function TaskCard({ task, onClick }) {
  const statusConfig = getStatusConfig(task.status);
  const creativeTypeLabels = {
    BLOG: 'Blog Post',
    AD_COPY: 'Ad Copy',
    EMAIL: 'Email',
    HEADLINE: 'Headline',
    DESCRIPTION: 'Description',
    SCRIPT: 'Video Script',
    SOCIAL: 'Social Media',
    CASE_STUDY: 'Case Study',
  };

  return (
    <div
      onClick={onClick}
      className="project-card-enhanced cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
              {statusConfig.label}
            </Badge>
            {task.creativeType && (
              <Badge variant="outline" className="text-xs">
                {creativeTypeLabels[task.creativeType] || task.creativeType}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {task.creativeName || task.taskTitle || 'Content Task'}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {task.projectId?.projectName || task.projectId?.businessName || 'Unknown Project'}
          </p>
        </div>
      </div>

      {/* Show content preview if available */}
      {task.contentOutput?.headline && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 line-clamp-2">
            <span className="font-medium">Headline:</span> {task.contentOutput.headline}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{formatDate(task.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default function ContentWriterDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingContent: 0,
    completedContent: 0,
    rejectedContent: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks and projects in parallel
      const [tasksRes, projectsRes] = await Promise.all([
        taskService.getMyRoleTasks ? taskService.getMyRoleTasks() : taskService.getMyTasks(),
        projectService.getProjects({ limit: 50 }),
      ]);

      const assignedTasks = tasksRes.data || [];
      const assignedProjects = projectsRes.data || [];

      setTasks(assignedTasks);
      setProjects(assignedProjects);
      calculateStats(assignedTasks);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList) => {
    // Content writer sees tasks in content workflow statuses
    // Pending = needs to start writing (includes todo, in_progress, content_pending)
    const pendingContent = taskList.filter(t =>
      ['content_pending', 'todo', 'in_progress'].includes(t.status)
    ).length;

    // Rejected = needs revision
    const rejectedContent = taskList.filter(t =>
      t.status === 'content_rejected'
    ).length;

    // Completed = writer's work is done (submitted for review, approved, or fully complete)
    const completedContent = taskList.filter(t =>
      ['content_submitted', 'content_final_approved', 'final_approved', 'content_approved', 'approved_by_tester', 'submitted'].includes(t.status)
    ).length;

    setStats({
      totalTasks: taskList.length,
      pendingContent,
      completedContent,
      rejectedContent,
    });
  };

  // Prepare pie chart data for content status (Pending, Completed, Rejected)
  const getTaskStatusData = () => {
    const data = [
      { name: 'Pending', value: stats.pendingContent, color: CHART_COLORS.pending },
      { name: 'Completed', value: stats.completedContent, color: CHART_COLORS.approved },
      { name: 'Rejected', value: stats.rejectedContent, color: CHART_COLORS.rejected },
    ];
    return data;
  };

  // Prepare bar chart data - tasks per project with proper status breakdown
  const getTasksPerProjectData = () => {
    const projectTaskCount = {};

    // Group tasks by project and count by status
    tasks.forEach(task => {
      const projectId = task.projectId?._id || task.projectId;
      const projectName = task.projectId?.projectName || task.projectId?.businessName || 'Unknown';

      if (!projectTaskCount[projectId]) {
        projectTaskCount[projectId] = {
          name: projectName.length > 15 ? projectName.substring(0, 15) + '...' : projectName,
          fullName: projectName,
          total: 0,
          completed: 0,
          pending: 0,
          rejected: 0,
        };
      }

      projectTaskCount[projectId].total++;

      // Categorize by status - from writer's perspective
      if (['content_submitted', 'content_final_approved', 'final_approved', 'content_approved', 'approved_by_tester', 'submitted'].includes(task.status)) {
        // Writer's work is complete (submitted for review or approved)
        projectTaskCount[projectId].completed++;
      } else if (task.status === 'content_rejected') {
        // Needs revision
        projectTaskCount[projectId].rejected++;
      } else {
        // content_pending, todo, in_progress, or other statuses - needs to be written
        projectTaskCount[projectId].pending++;
      }
    });

    // Convert to array and limit to top 5 projects
    return Object.values(projectTaskCount)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        fullName: item.fullName,
        completed: item.completed,
        pending: item.pending,
        rejected: item.rejected,
      }));
  };

  // Get recent tasks for task overview section
  const getRecentTasks = () => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  };

  // Get tasks needing attention (rejected or pending)
  const getTasksNeedingAttention = () => {
    return tasks.filter(t =>
      ['content_rejected', 'content_pending'].includes(t.status)
    ).slice(0, 3);
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
      <div className="space-y-6">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load dashboard"
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

  // Show empty state when no tasks are assigned
  if (tasks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Writer Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Writer'}!
              </p>
            </div>
          </div>
        </div>

        <EmptyState
          icon={FileText}
          title="No content tasks assigned"
          description="You don't have any content writing tasks assigned yet. Tasks will appear here once they're assigned to you."
          action={
            <Button onClick={() => navigate('/projects')}>
              <FolderKanban size={16} className="mr-2" />
              View Projects
            </Button>
          }
        />
      </div>
    );
  }

  const taskStatusData = getTaskStatusData();
  const tasksPerProjectData = getTasksPerProjectData();
  const recentTasks = getRecentTasks();
  const needsAttention = getTasksNeedingAttention();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Writer Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Writer'}! Here's your content creation overview.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <FolderKanban size={18} className="mr-2" />
            Projects
          </Button>
          <Button onClick={() => navigate('/tasks')}>
            <PenTool size={18} className="mr-2" />
            My Tasks
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Content Tasks"
          value={String(stats.totalTasks)}
          icon={FileText}
          iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
        <StatCard
          title="Pending"
          value={String(stats.pendingContent)}
          change={stats.pendingContent > 0 ? `${stats.pendingContent} awaiting` : null}
          changeType="neutral"
          icon={Clock}
          iconBg="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />
        <StatCard
          title="Completed"
          value={String(stats.completedContent)}
          change={stats.completedContent > 0 ? '+this week' : null}
          changeType="positive"
          icon={CheckCircle}
          iconBg="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard
          title="Rejected"
          value={String(stats.rejectedContent)}
          change={stats.rejectedContent > 0 ? 'Needs revision' : null}
          changeType="negative"
          icon={XCircle}
          iconBg="bg-gradient-to-br from-red-400 to-red-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Content Status */}
        <div className="lg:col-span-1 chart-container-enhanced">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500">
              <PieChartIcon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Content Progress</h3>
              <p className="text-sm text-gray-500">Pending, Completed & Rejected</p>
            </div>
          </div>

          {/* Custom legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            {taskStatusData.map((item, i) => (
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

          {stats.totalTasks > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {taskStatusData.filter(item => item.value > 0).map((entry, index) => (
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
                <p>No content progress data</p>
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart - Tasks per Project */}
        <div className="lg:col-span-2 chart-container-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tasks by Project</h3>
                <p className="text-sm text-gray-500">Status breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
                <span className="text-xs text-gray-500">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-500" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span className="text-xs text-gray-500">Rejected</span>
              </div>
            </div>
          </div>

          {tasksPerProjectData.length > 0 ? (
            <div style={{ height: `${Math.max(tasksPerProjectData.length * 42 + 60, 180)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={tasksPerProjectData}
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
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const labels = {
                        completed: 'Completed',
                        pending: 'Pending',
                        rejected: 'Rejected'
                      };
                      return [`${value} task${value !== 1 ? 's' : ''}`, labels[name] || name];
                    }}
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
                  <Bar dataKey="completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rejected" stackId="a" fill="#EF4444" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              <div className="text-center">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No project data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Needing Attention */}
      {needsAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Sparkles size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-900">Tasks Needing Attention</h3>
              <p className="text-sm text-amber-600">
                {stats.rejectedContent > 0 ? `${stats.rejectedContent} rejected, ` : ''}
                {stats.pendingContent} pending content tasks
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {needsAttention.map((task) => {
              const taskStatus = getStatusConfig(task.status);
              return (
                <div
                  key={task._id}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${taskStatus.bgColor} ${taskStatus.textColor}`}>
                      {taskStatus.label}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {task.creativeName || task.taskTitle}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {task.projectId?.projectName || task.projectId?.businessName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Overview Section */}
      <div className="chart-container-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500">
              <PenTool size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recent Content Tasks</h3>
              <p className="text-sm text-gray-500">Your writing assignments</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
            View All Tasks
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        {recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => navigate(`/tasks/${task._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Content Tasks</h4>
            <p className="text-sm text-gray-500 mb-4">
              You haven't been assigned any content tasks yet. Tasks will appear here once they're created.
            </p>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Browse Projects
            </Button>
          </div>
        )}
      </div>

      {/* Content Writing Tips */}
      {/* <div className="chart-container-enhanced">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Content Workflow</h3>
            <p className="text-sm text-gray-500">How your content flows through the team</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <PenTool size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">1. Write Content</p>
              <p className="text-xs text-gray-500">Create compelling copy</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">2. Submit for Review</p>
              <p className="text-xs text-gray-500">Tester reviews content</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">3. Approved</p>
              <p className="text-xs text-gray-500">Passed to designers</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl text-white text-left hover:shadow-lg transition-all duration-200"
        >
          <PenTool size={24} className="mb-2" />
          <p className="font-semibold">View All Tasks</p>
          <p className="text-sm text-white/80 mt-1">See all your writing assignments</p>
        </button>
        <button
          onClick={() => navigate('/projects')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <FolderKanban size={24} className="mb-2 text-primary-500" />
          <p className="font-semibold">My Projects</p>
          <p className="text-sm text-gray-500 mt-1">View assigned projects</p>
        </button>
        <button
          onClick={() => navigate('/tasks?status=pending')}
          className="enhanced-card p-4 text-gray-900 text-left"
        >
          <Edit size={24} className="mb-2 text-yellow-500" />
          <p className="font-semibold">Start Writing</p>
          <p className="text-sm text-gray-500 mt-1">Continue pending content</p>
        </button>
      </div>

      {/* Rejected Content Alert */}
      {stats.rejectedContent > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">Content Needs Revision</p>
              <p className="text-sm text-red-600">
                You have {stats.rejectedContent} piece{stats.rejectedContent !== 1 ? 's' : ''} of content that need{stats.rejectedContent === 1 ? 's' : ''} revision.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tasks?status=rejected')}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            View Revisions
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}