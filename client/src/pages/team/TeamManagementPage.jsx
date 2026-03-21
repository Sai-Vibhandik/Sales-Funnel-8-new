import { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'sonner';
import { authService, projectService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner, Button, Badge, Input } from '@/components/ui';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Shield,
  TrendingUp,
  FileText,
  Image,
  Video,
  Layout,
  Code,
  CheckCircle,
  Crown,
  ChevronDown,
  Filter,
  XCircle,
  Check,
  Sparkles,
  UserCheck,
  Clock,
  ArrowUpRight,
  Mail,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Role options with icons and colors
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', icon: Crown, color: 'bg-gradient-to-br from-red-500 to-rose-600', lightColor: 'bg-red-50 text-red-600' },
  { value: 'performance_marketer', label: 'Performance Marketer', icon: TrendingUp, color: 'bg-gradient-to-br from-blue-500 to-indigo-600', lightColor: 'bg-blue-50 text-blue-600' },
  { value: 'content_writer', label: 'Content Writer', icon: FileText, color: 'bg-gradient-to-br from-emerald-500 to-teal-600', lightColor: 'bg-emerald-50 text-emerald-600' },
  { value: 'ui_ux_designer', label: 'UI/UX Designer', icon: Layout, color: 'bg-gradient-to-br from-purple-500 to-violet-600', lightColor: 'bg-purple-50 text-purple-600' },
  { value: 'graphic_designer', label: 'Graphic Designer', icon: Image, color: 'bg-gradient-to-br from-pink-500 to-rose-600', lightColor: 'bg-pink-50 text-pink-600' },
  { value: 'video_editor', label: 'Video Editor', icon: Video, color: 'bg-gradient-to-br from-cyan-500 to-teal-600', lightColor: 'bg-cyan-50 text-cyan-600' },
  { value: 'developer', label: 'Developer', icon: Code, color: 'bg-gradient-to-br from-green-500 to-emerald-600', lightColor: 'bg-green-50 text-green-600' },
  { value: 'tester', label: 'Tester', icon: CheckCircle, color: 'bg-gradient-to-br from-orange-500 to-amber-600', lightColor: 'bg-orange-50 text-orange-600' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', color: 'bg-emerald-500', dotColor: 'bg-emerald-500' },
  { value: 'busy', label: 'Busy', color: 'bg-amber-500', dotColor: 'bg-amber-500' },
  { value: 'offline', label: 'Offline', color: 'bg-gray-400', dotColor: 'bg-gray-400' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', icon: Check },
  { value: 'inactive', label: 'Inactive', icon: XCircle },
];

// Premium Search Input Component
function PremiumSearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300" />
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-20 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400
                     focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                     transition-all duration-200"
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg border border-gray-200">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  );
}

// Premium Select Dropdown
function PremiumSelect({ value, onChange, options, placeholder, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                   hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                   transition-all duration-200 min-w-[140px]"
      >
        {selectedOption ? (
          <>
            {selectedOption.icon && (
              <selectedOption.icon size={16} className="text-gray-500" />
            )}
            <span className="text-gray-700 font-medium">{selectedOption.label}</span>
          </>
        ) : (
          <>
            {Icon && <Icon size={16} className="text-gray-400" />}
            <span className="text-gray-500">{placeholder}</span>
          </>
        )}
        <ChevronDown size={16} className="ml-auto text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 animate-fadeIn">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors",
                  value === option.value
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {option.icon && <option.icon size={16} />}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Enhanced Team Member Row Component
function TeamMemberRow({ member, onEdit, onDelete, onActivate, index = 0 }) {
  const roleConfig = ROLE_OPTIONS.find(r => r.value === member.role) || ROLE_OPTIONS[0];
  const Icon = roleConfig.icon;

  return (
    <div
      className={cn(
        "team-member-card-enhanced group",
        member.isActive ? "" : "opacity-60"
      )}
    >
      {/* Fixed grid: avatar | info | role | specialization | status | actions */}
      <div className="grid items-center gap-3" style={{ gridTemplateColumns: '44px 1fr 180px 1fr auto auto' }}>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg",
            "bg-gradient-to-br",
            member.isActive ? "from-primary-400 to-primary-600" : "from-gray-400 to-gray-500"
          )}>
            {member.name?.charAt(0).toUpperCase()}
          </div>
          {/* Availability dot */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
            AVAILABILITY_OPTIONS.find(a => a.value === member.availability)?.dotColor || "bg-gray-400"
          )} />
        </div>

        {/* Member Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
            {!member.isActive && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                Deactivated
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate mt-0.5">{member.email}</p>
        </div>

        {/* Role Badge — fixed 180px column, always left-aligned */}
        <div className="flex items-center">
          <span className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap",
            roleConfig.lightColor
          )}>
            <Icon size={14} />
            {roleConfig.label}
          </span>
        </div>

        {/* Specialization */}
        <div className="hidden xl:block min-w-0">
          <span className="text-sm text-gray-500 truncate block">
            {member.specialization || <span className="text-gray-400 italic">Not specified</span>}
          </span>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <span className={cn(
            "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap",
            member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
          )}>
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {member.isActive ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50
                         transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Edit member"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50
                         transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Deactivate member"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onActivate(member); }}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                         transition-all duration-200 text-xs font-medium"
              >
                Activate
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50
                         transition-all duration-200"
                title="Delete permanently"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal Portal
function ModalPortal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

// Premium Modal
function TeamMemberModal({ isOpen, onClose, member, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'performance_marketer',
    specialization: '',
    availability: 'available',
    projectId: '',
    projectRole: '',
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects({ limit: 100 });
        setProjects(response.data || []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (member) {
        setFormData({
          name: member.name || '',
          email: member.email || '',
          password: '',
          role: member.role || 'performance_marketer',
          specialization: member.specialization || '',
          availability: member.availability || 'available',
          projectId: '',
          projectRole: '',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'performance_marketer',
          specialization: '',
          availability: 'available',
          projectId: '',
          projectRole: '',
        });
      }
    }
  }, [isOpen, member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!member && !formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    if (!member && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      const errorMessage = error?.message || error?.errors?.[0] || 'Failed to save team member';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoleConfig = ROLE_OPTIONS.find(r => r.value === formData.role) || ROLE_OPTIONS[0];
  const SelectedIcon = selectedRoleConfig.icon;

  return (
    <ModalPortal>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient accent */}
          <div className="relative px-6 py-5 border-b border-gray-100">
            <div className={cn("absolute top-0 left-0 right-0 h-1", selectedRoleConfig.color)} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selectedRoleConfig.lightColor)}>
                  {member ? <Edit size={20} /> : <UserPlus size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {member ? 'Edit Team Member' : 'Add Team Member'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {member ? 'Update member information' : 'Create a new team member account'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6">
            <form id="team-member-form" onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full"
                  />
                </div>
              </div>

              {!member && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password * (min 6 characters)</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: option.value })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                          formData.role === option.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-lg", option.lightColor)}>
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 text-center">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Facebook Ads, React Development"
                  className="w-full"
                />
              </div> */}

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="flex gap-2">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, availability: option.value })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200",
                        formData.availability === option.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                    >
                      <div className={cn("w-2.5 h-2.5 rounded-full", option.dotColor)} />
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div> */}

              {!member && (
                <div className="border-t border-gray-100 pt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Project <span className="text-gray-400">(Optional)</span>
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.projectName || project.businessName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="team-member-form" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">{member ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  {member ? 'Update Member' : 'Create Member'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, onClose, member, onDeactivate, onPermanentDelete }) {
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeactivate = async () => {
    setDeactivating(true);
    setError('');
    try {
      await onDeactivate();
      onClose();
    } catch (error) {
      setError(error?.message || 'Failed to deactivate team member');
    } finally {
      setDeactivating(false);
    }
  };

  const handlePermanentDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await onPermanentDelete();
      onClose();
    } catch (error) {
      setError(error?.message || 'Failed to permanently delete team member');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
          {/* Warning header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Trash2 size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Remove Team Member</h3>
            <p className="text-white/80">
              <strong>{member.name}</strong> ({member.email})
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-600 mb-6 text-center">
              Choose how you want to remove this team member:
            </p>

            <div className="space-y-3">
              {/* Deactivate Option */}
              <button
                onClick={handleDeactivate}
                disabled={deactivating || deleting}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all",
                  deactivating && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Shield size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">Deactivate</h4>
                    <p className="text-sm text-gray-500">User loses access but data is preserved</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {deactivating ? 'Deactivating...' : 'Select'}
                </span>
              </button>

              {/* Permanent Delete Option */}
              <button
                onClick={handlePermanentDelete}
                disabled={deactivating || deleting}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-all",
                  deleting && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <Trash2 size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-red-900">Permanent Delete</h4>
                    <p className="text-sm text-red-700">All data will be permanently removed</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {deleting ? 'Deleting...' : 'Delete'}
                </span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                disabled={deactivating || deleting}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// Empty State Component
function EmptyState({ onAddMember }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center">
          <Users size={40} className="text-primary-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
          <UserPlus size={16} className="text-white" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No team members yet</h3>
      <p className="text-gray-500 mb-6 max-w-sm text-center">
        Start building your team by adding your first member. They'll receive an invitation to join.
      </p>
      <Button onClick={onAddMember}>
        <UserPlus size={18} className="mr-2" />
        Add Your First Member
      </Button>
    </div>
  );
}

// Main Component
export default function TeamManagementPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const response = await authService.getTeamMembers(params);
      let members = response.data || [];

      // Apply status filter on client side
      if (statusFilter) {
        members = members.filter(m =>
          statusFilter === 'active' ? m.isActive : !m.isActive
        );
      }

      setTeamMembers(members);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const activeMembers = teamMembers.filter(m => m.isActive);
    const totalActive = activeMembers.length;
    const totalInactive = teamMembers.filter(m => !m.isActive).length;

    return {
      totalActive,
      totalInactive,
      total: teamMembers.length,
      activePercentage: teamMembers.length > 0 ? Math.round((totalActive / teamMembers.length) * 100) : 0,
    };
  }, [teamMembers]);

  const handleCreateMember = async (formData) => {
    try {
      const apiData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        specialization: formData.specialization || '',
        availability: formData.availability || 'available',
      };

      if (formData.projectId) {
        apiData.projectId = formData.projectId;
        apiData.projectRole = formData.role;
      }

      const response = await authService.createTeamMember(apiData);
      toast.success(response.message || 'Team member created successfully');
      fetchTeamMembers();
    } catch (error) {
      const errorMessage = error?.message || error?.errors?.[0] || 'Failed to create team member';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateMember = async (formData) => {
    try {
      const apiData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        specialization: formData.specialization || '',
        availability: formData.availability || 'available',
      };

      await authService.updateTeamMember(selectedMember._id, apiData);
      toast.success('Team member updated successfully');
      fetchTeamMembers();
    } catch (error) {
      const errorMessage = error?.message || error?.errors?.[0] || 'Failed to update team member';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteMember = async () => {
    try {
      await authService.deleteTeamMember(selectedMember._id);
      toast.success('Team member deactivated successfully');
      fetchTeamMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to deactivate team member');
      throw error;
    }
  };

  const handleActivateMember = async (member) => {
    try {
      await authService.updateTeamMember(member._id, { isActive: true });
      toast.success('Team member activated successfully');
      fetchTeamMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to activate team member');
    }
  };

  const handlePermanentDeleteMember = async () => {
    try {
      await authService.permanentDeleteTeamMember(selectedMember._id);
      toast.success('Team member permanently deleted');
      fetchTeamMembers();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to permanently delete team member';
      toast.error(errorMessage);
      throw error;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm || roleFilter || statusFilter;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setSelectedMember(null); setIsModalOpen(true); }}>
            <UserPlus size={18} className="mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card-enhanced">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm font-medium text-green-600">{stats.activePercentage}%</span>
                <span className="text-xs text-gray-400">active rate</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Active Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalActive}</p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-400 to-green-600">
              <UserCheck size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Inactive Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInactive}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-gray-500">Deactivated</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Team Roles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {new Set(teamMembers.filter(m => m.isActive).map(m => m.role)).size}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-sm text-gray-500">Different roles</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600">
              <Shield size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Members & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2">
          {/* Filter Bar */}
          <div className="enhanced-card p-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <PremiumSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by name or email..."
                />
              </div>

              <PremiumSelect
                value={roleFilter}
                onChange={setRoleFilter}
                options={[{ value: '', label: 'All Roles', icon: Shield }, ...ROLE_OPTIONS]}
                placeholder="Role"
                icon={Shield}
              />

              <PremiumSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS]}
                placeholder="Status"
                icon={Filter}
              />

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XCircle size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="enhanced-card overflow-hidden">
            {teamMembers.length === 0 ? (
              <EmptyState onAddMember={() => { setSelectedMember(null); setIsModalOpen(true); }} />
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Team Members ({teamMembers.length})
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      Active
                    </span>
                    <span className="flex items-center gap-1 ml-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full" />
                      Inactive
                    </span>
                  </div>
                </div>

                {teamMembers.map((member, index) => (
                  <TeamMemberRow
                    key={member._id}
                    member={member}
                    index={index}
                    onEdit={(m) => { setSelectedMember(m); setIsModalOpen(true); }}
                    onDelete={(m) => { setSelectedMember(m); setIsDeleteModalOpen(true); }}
                    onActivate={handleActivateMember}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team by Role */}
        <div className="chart-container-enhanced">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500">
                <Star size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Distribution</h3>
                <p className="text-sm text-gray-500">Members by role</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {ROLE_OPTIONS.slice(0, 5).map((role) => {
              const count = teamMembers.filter(m => m.role === role.value && m.isActive).length;
              const Icon = role.icon;
              return (
                <div key={role.value} className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", role.lightColor)}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{role.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", role.color)}
                        style={{ width: `${stats.totalActive > 0 ? (count / stats.totalActive) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Active</span>
              <span className="text-lg font-bold text-gray-900">{stats.totalActive}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSave={selectedMember ? handleUpdateMember : handleCreateMember}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        member={selectedMember}
        onDeactivate={handleDeleteMember}
        onPermanentDelete={handlePermanentDeleteMember}
      />
    </div>
  );
}