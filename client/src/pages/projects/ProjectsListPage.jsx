import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/api';
import { Spinner, Badge } from '@/components/ui';
import {
  FolderKanban,
  Search,
  Plus,
  Trash2,
  Calendar,
  Briefcase,
  ChevronRight,
  Grid3x3,
  List,
  Filter,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

// Stage configuration
const STAGE_ICONS = {
  marketResearch: Search,
  offerEngineering: 'Gift',
  trafficStrategy: 'TrendingUp',
  landingPage: 'FileText',
  creativeStrategy: 'Lightbulb',
};

const STAGE_NAMES = {
  onboarding: 'Onboarding',
  marketResearch: 'Market Research',
  offerEngineering: 'Offer Engineering',
  trafficStrategy: 'Traffic Strategy',
  landingPage: 'Landing Page',
  creativeStrategy: 'Creative Strategy',
};

// All roles now navigate to project details page
// The project details page handles role-specific views internally

// Project Card Component
function ProjectCard({ project, onDelete, isAdmin, navigate }) {
  const stageKeys = ['onboarding', 'marketResearch', 'offerEngineering', 'trafficStrategy', 'landingPage', 'creativeStrategy'];
  const completedStages = stageKeys.filter(key => project.stages?.[key]?.isCompleted).length;
  const progressPercent = (completedStages / stageKeys.length) * 100;

  // Get status badge
  const getStatusBadge = () => {
    switch (project.status) {
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', dot: 'bg-green-500' };
      case 'paused':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused', dot: 'bg-yellow-500' };
      case 'archived':
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archived', dot: 'bg-gray-400' };
      case 'active':
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active', dot: 'bg-blue-500' };
    }
  };

  // Get current stage
  const getCurrentStage = () => {
    for (let i = 0; i < stageKeys.length; i++) {
      if (!project.stages?.[stageKeys[i]]?.isCompleted) {
        return { key: stageKeys[i], name: STAGE_NAMES[stageKeys[i]], index: i + 1 };
      }
    }
    return { key: 'creativeStrategy', name: 'Creative Strategy', index: 6 };
  };

  const status = getStatusBadge();
  const currentStage = getCurrentStage();

  // Navigate to project details - all roles see the same project details page
  // which internally shows role-specific content
  const handleClick = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="project-card-enhanced"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
            <Briefcase size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{project.projectName || project.businessName}</h3>
            <p className="text-sm text-gray-500 truncate">{project.customerName}</p>
          </div>
        </div>
        <Badge className={cn(status.bg, status.text, 'flex-shrink-0')}>
          <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status.dot)} />
          {status.label}
        </Badge>
      </div>

      {/* Industry Tag */}
      {project.industry && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
            {project.industry}
          </span>
        </div>
      )}

      {/* Strategy Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Strategy Progress</span>
          <span className="font-medium text-gray-900">{completedStages}/{stageKeys.length} stages</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 100
                ? '#10B981'
                : 'linear-gradient(90deg, #FFC107 0%, #FFD54F 100%)'
            }}
          />
        </div>
        {progressPercent < 100 && (
          <p className="text-xs text-gray-500 mt-1.5">
            Current: {currentStage.name}
          </p>
        )}
        {progressPercent === 100 && (
          <p className="text-xs text-gray-500 mt-1.5">
            ✓ Strategy complete, awaiting execution
          </p>
        )}
      </div>

      {/* Team Avatars (Admin only) */}
      {isAdmin && project.assignedTeam && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-500">Team:</span>
          <div className="flex -space-x-2">
            {project.assignedTeam.performanceMarketer && (
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                {project.assignedTeam.performanceMarketer.name?.charAt(0)}
              </div>
            )}
            {project.assignedTeam.uiUxDesigner && (
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                {project.assignedTeam.uiUxDesigner.name?.charAt(0)}
              </div>
            )}
            {project.assignedTeam.graphicDesigner && (
              <div className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                {project.assignedTeam.graphicDesigner.name?.charAt(0)}
              </div>
            )}
            {project.assignedTeam.developer && (
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                {project.assignedTeam.developer.name?.charAt(0)}
              </div>
            )}
            {project.assignedTeam.tester && (
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                {project.assignedTeam.tester.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={14} />
          <span>{formatDate(project.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete project"
            >
              <Trash2 size={16} />
            </button>
          )}
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteModal({ isOpen, projectId, projectName, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <span className="font-medium text-gray-900">{projectName}</span>? This action cannot be undone.
        </p>
        <ul className="text-sm text-gray-500 mb-6 space-y-1">
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            All project data and settings
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            All tasks and strategy documents
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            All landing pages and assets
          </li>
        </ul>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProjects();
  }, [status]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects({ status, search });
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleDeleteClick = (projectId) => {
    setShowDeleteModal(projectId);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await projectService.deleteProject(showDeleteModal);
      setProjects(projects.filter(p => p._id !== showDeleteModal));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
      setShowDeleteModal(null);
    }
  };

  const projectToDelete = projects.find(p => p._id === showDeleteModal);

  // Filter counts
  const statusCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    completed: projects.filter(p => p.status === 'completed').length,
    archived: projects.filter(p => p.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!showDeleteModal}
        projectId={showDeleteModal}
        projectName={projectToDelete?.projectName || projectToDelete?.businessName}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(null)}
        isDeleting={deleting}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'All Projects' : 'My Projects'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'Manage all client projects' : 'Projects assigned to you'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
          >
            <Plus size={18} />
            New Project
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.04)] p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500 mr-2">Filter:</span>
          {[
            { value: '', label: 'All', count: statusCounts.all },
            { value: 'active', label: 'Active', count: statusCounts.active },
            { value: 'paused', label: 'Paused', count: statusCounts.paused },
            { value: 'completed', label: 'Completed', count: statusCounts.completed },
            { value: 'archived', label: 'Archived', count: statusCounts.archived },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                status === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={cn('ml-1.5 text-xs', status === filter.value ? 'text-white/80' : 'text-gray-400')}>
                  ({filter.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FolderKanban size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isAdmin ? 'No projects found' : 'No assigned projects'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {isAdmin
              ? 'Get started by creating your first project.'
              : "You haven't been assigned to any projects yet. Contact your administrator."}
          </p>
          {isAdmin && (
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
            >
              <Plus size={18} />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={handleDeleteClick}
              isAdmin={isAdmin}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}