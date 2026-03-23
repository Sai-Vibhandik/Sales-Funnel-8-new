import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { projectService, taskService } from '@/services/api';
import { Spinner, Badge, Button, EmptyState } from '@/components/ui';
import {
  FolderKanban,
  Search,
  Gift,
  TrendingUp,
  FileText,
  Lightbulb,
  ChevronRight,
  AlertCircle,
  Calendar,
  Briefcase,
  Activity,
  Clock,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Layers,
  ArrowRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { getProjectStatusConfig, getStatusConfig, STATUS_CONFIG } from '@/constants/taskStatuses';

// ============================================
// DESIGN SYSTEM CONSTANTS
// ============================================

const STAGE_ICONS = {
  marketResearch: Search,
  offerEngineering: Gift,
  trafficStrategy: TrendingUp,
  landingPage: FileText,
  creativeStrategy: Lightbulb,
};

const STAGE_NAMES = {
  marketResearch: 'Market Research',
  offerEngineering: 'Offer Engineering',
  trafficStrategy: 'Traffic Strategy',
  landingPage: 'Landing Page',
  creativeStrategy: 'Creative Strategy',
};

const STAGE_PATHS = {
  marketResearch: '/market-research',
  offerEngineering: '/offer-engineering',
  trafficStrategy: '/traffic-strategy',
  landingPage: '/landing-pages',
  creativeStrategy: '/creative-strategy',
};

const COLORS = {
  primary: '#FFC107',
  secondary: '#FFD54F',
  success: '#10B981',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  orange: '#F97316',
  red: '#EF4444',
};

// ============================================
// COMPONENTS
// ============================================

// Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, iconBg, onClick, clickable }) {
  return (
    <div
      className={cn(
        'stat-card-enhanced group',
        clickable && 'cursor-pointer hover:shadow-lg transition-shadow'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-2xl', iconBg)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Pending Approval Task Card
function PendingApprovalCard({ task, onApprove, onReject }) {
  const statusConfig = getStatusConfig(task.status);
  const taskTypeLabels = {
    graphic_design: 'Graphic Design',
    video_editing: 'Video Editing',
    content_writing: 'Content Writing',
    landing_page_design: 'Landing Page Design',
    landing_page_development: 'Landing Page Development',
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.taskTitle}</h4>
          <p className="text-sm text-gray-500 mt-0.5">
            {task.projectId?.projectName || task.projectId?.businessName}
          </p>
        </div>
        <Badge className={cn(statusConfig.bgColor, statusConfig.textColor)}>
          {taskTypeLabels[task.taskType] || task.taskType}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <CheckCircle size={12} className="text-green-500" />
          Tester Approved
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatDate(task.testerReviewedAt || task.updatedAt)}
        </span>
      </div>

      {task.creativeName && (
        <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
          <span className="font-medium">{task.creativeName}</span>
          {task.creativeOutputType && (
            <span className="ml-2 text-gray-400">({task.creativeOutputType})</span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onApprove(task._id)}
          className="flex-1"
        >
          <CheckCircle size={14} className="mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onReject(task._id)}
          className="flex-1"
        >
          <XCircle size={14} className="mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, getNextStage, getStageProgress, navigate }) {
  const nextStage = getNextStage(project);
  const progress = getStageProgress(project);
  const progressPercent = (progress.completed / progress.total) * 100;

  const statusConfig = getProjectStatusConfig(project.status);

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="project-card-enhanced"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.projectName || project.businessName}</h3>
            <p className="text-sm text-gray-500">{project.customerName}</p>
          </div>
        </div>
        <Badge className={cn(statusConfig.bgColor, statusConfig.textColor)}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Strategy Progress</span>
          <span className="font-semibold text-gray-900">{progress.completed}/{progress.total} stages</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
      </div>

      {/* Stage Progress Pills */}
      {/* <div className="flex gap-1 mb-4">
        {['Onboarding', 'Research', 'Offer', 'Traffic', 'Landing', 'Creative'].map((stage, i) => {
          const isCompleted = i < progress.completed;
          const isCurrent = i === progress.completed;
          return (
            <div
              key={stage}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all',
                isCompleted ? 'bg-gradient-to-r from-primary-400 to-primary-500' :
                isCurrent ? 'bg-primary-200' : 'bg-gray-100'
              )}
            />
          );
        })}
      </div> */}

      {/* Next Stage Card */}
      {nextStage && (
        <div
          className="p-4 bg-gradient-to-r from-primary-50 via-amber-50 to-yellow-50 rounded-xl border border-primary-100/50"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${STAGE_PATHS[nextStage.key]}?projectId=${project._id}`);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                {(() => {
                  const Icon = STAGE_ICONS[nextStage.key] || Search;
                  return <Icon size={18} className="text-primary-600" />;
                })()}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Next Stage</p>
                <p className="font-semibold text-gray-900">{nextStage.name}</p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-white text-sm font-medium text-gray-700 rounded-xl hover:shadow-md transition-all flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`${STAGE_PATHS[nextStage.key]}?projectId=${project._id}`);
              }}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={14} />
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </div>
  );
}

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 p-3">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PerformanceMarketerDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pendingApproval: 0,
    strategyComplete: 0,
    completed: 0,
    paused: 0,
  });

  // Stage completion data for charts
  const [stageStats, setStageStats] = useState({
    marketResearch: 0,
    offerEngineering: 0,
    trafficStrategy: 0,
    landingPage: 0,
    creativeStrategy: 0,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsRes, pendingRes] = await Promise.all([
        projectService.getProjects({ limit: 50 }),
        taskService.getPendingMarketerApproval(),
      ]);

      const assignedProjects = projectsRes.data || [];
      const pendingTasks = pendingRes.data || [];

      setProjects(assignedProjects);
      setPendingApprovals(pendingTasks);

      // Calculate stats
      const total = assignedProjects.length;
      const active = assignedProjects.filter(p => p.status === 'active').length;
      const completed = assignedProjects.filter(p => p.status === 'completed').length;
      const paused = assignedProjects.filter(p => p.status === 'paused').length;
      const strategyComplete = assignedProjects.filter(p => p.overallProgress === 100 && p.status !== 'completed').length;

      // Stage completion stats
      const stageKeys = ['marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];
      const stageCounts = {};
      stageKeys.forEach(key => {
        stageCounts[key] = assignedProjects.filter(p => p.stages?.[key]?.isCompleted).length;
      });

      setStats({
        total,
        active,
        pendingApproval: pendingTasks.length,
        strategyComplete,
        completed,
        paused,
      });
      setStageStats(stageCounts);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      await taskService.marketerReview(taskId, { approved: true });
      toast.success('Task approved successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to approve task');
    }
  };

  const handleRejectTask = async (taskId) => {
    try {
      await taskService.marketerReview(taskId, { approved: false });
      toast.success('Task rejected');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to reject task');
    }
  };

  const getNextStage = (project) => {
    const stageKeys = ['onboarding', 'marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];

    for (let i = 1; i < stageKeys.length; i++) {
      const key = stageKeys[i];
      const prevKey = stageKeys[i - 1];
      const prevCompleted = project.stages?.[prevKey]?.isCompleted;

      if (!project.stages?.[key]?.isCompleted && prevCompleted) {
        return { key, name: STAGE_NAMES[key], index: i };
      }
    }

    for (let i = 1; i < stageKeys.length; i++) {
      const key = stageKeys[i];
      if (!project.stages?.[key]?.isCompleted) {
        let canAccess = true;
        for (let j = 1; j < i; j++) {
          if (!project.stages?.[stageKeys[j]]?.isCompleted) {
            canAccess = false;
            break;
          }
        }
        if (canAccess) {
          return { key, name: STAGE_NAMES[key], index: i };
        }
      }
    }
    return null;
  };

  const getStageProgress = (project) => {
    const stageKeys = ['onboarding', 'marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];
    const completed = stageKeys.filter(key => project.stages?.[key]?.isCompleted).length;
    return { completed, total: 6 };
  };

  // Projects needing strategy work (incomplete stages)
  const projectsNeedingStrategy = projects.filter(p => {
    if (p.status !== 'active') return false;
    const progress = getStageProgress(p);
    return progress.completed < progress.total;
  });

  // Chart data
  const projectStatusData = [
    { name: 'Active', value: stats.active, color: COLORS.info },
    { name: 'Strategy Done', value: stats.strategyComplete, color: COLORS.primary },
    { name: 'Completed', value: stats.completed, color: COLORS.success },
    { name: 'Paused', value: stats.paused, color: COLORS.orange },
  ].filter(d => d.value > 0);

  const stageCompletionData = [
    { name: 'Market Research', value: stageStats.marketResearch, color: COLORS.info },
    { name: 'Offer Engineering', value: stageStats.offerEngineering, color: COLORS.purple },
    { name: 'Traffic Strategy', value: stageStats.trafficStrategy, color: COLORS.primary },
    { name: 'Landing Page', value: stageStats.landingPage, color: COLORS.success },
    { name: 'Creative Strategy', value: stageStats.creativeStrategy, color: COLORS.pink },
  ];

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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Marketer'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={String(stats.total)}
          icon={FolderKanban}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active"
          value={String(stats.active)}
          subtitle={`${projectsNeedingStrategy.length} need strategy`}
          icon={Activity}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          clickable
          onClick={() => navigate('/projects?status=active')}
        />
        <StatCard
          title="Pending Approval"
          value={String(stats.pendingApproval)}
          subtitle="Tasks ready for review"
          icon={ClipboardCheck}
          iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
          clickable
          onClick={() => navigate('/tasks/approval')}
        />
        <StatCard
          title="Completed"
          value={String(stats.completed)}
          icon={Award}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Tasks Pending Approval Section */}
      {pendingApprovals.length > 0 && (
        <div className="stat-card-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500">
                <FileCheck size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tasks Awaiting Your Approval</h3>
                <p className="text-sm text-gray-500">Reviewed by tester, needs your sign-off</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/tasks/approval')}>
              View All
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApprovals.slice(0, 6).map(task => (
              <PendingApprovalCard
                key={task._id}
                task={task}
                onApprove={handleApproveTask}
                onReject={handleRejectTask}
              />
            ))}
          </div>

          {pendingApprovals.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => navigate('/tasks/approval')}>
                View All {pendingApprovals.length} Tasks
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Pie Chart */}
        <div className="stat-card-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500">
                <PieChartIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Project Status</h3>
                <p className="text-sm text-gray-500">Distribution by status</p>
              </div>
            </div>
          </div>

          {projectStatusData.length > 0 ? (
            <>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                {projectStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <div className="text-center">
                <PieChartIcon size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No projects yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Stage Completion Bar Chart */}
        <div className="stat-card-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Layers size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Strategy Completion</h3>
                <p className="text-sm text-gray-500">Projects per stage</p>
              </div>
            </div>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageCompletionData} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 193, 7, 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stageCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Needing Strategy Section */}
      {projectsNeedingStrategy.length > 0 && (
        <div className="stat-card-enhanced">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Projects Needing Strategy</h3>
                <p className="text-sm text-gray-500">Continue working on strategy stages</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
              View All
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {projectsNeedingStrategy.slice(0, 3).map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                getNextStage={getNextStage}
                getStageProgress={getStageProgress}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Projects Section */}
      <div className="stat-card-enhanced">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800">
              <FolderKanban size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Projects</h3>
              <p className="text-sm text-gray-500">Manage and track your work</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All
            <ArrowRight size={14} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FolderKanban size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">No projects yet</h4>
            <p className="text-gray-500 mt-1">Your assigned projects will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 4).map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                getNextStage={getNextStage}
                getStageProgress={getStageProgress}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}