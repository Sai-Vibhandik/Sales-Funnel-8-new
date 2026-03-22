/**
 * Task Status Constants
 * =====================
 *
 * Centralized status definitions for the task workflow system.
 * This file serves as the single source of truth for all task statuses in the frontend.
 *
 * Import this file instead of defining STATUS_CONFIG locally in components.
 */

import {
  ClipboardList,
  Play,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Layout,
  Code
} from 'lucide-react';

// Task Status Values
// ==================

export const TASK_STATUS_VALUES = {
  // Common statuses
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',

  // Content workflow
  CONTENT_PENDING: 'content_pending',
  CONTENT_SUBMITTED: 'content_submitted',
  CONTENT_FINAL_APPROVED: 'content_final_approved',
  CONTENT_REJECTED: 'content_rejected',

  // Design workflow
  DESIGN_PENDING: 'design_pending',
  DESIGN_SUBMITTED: 'design_submitted',
  DESIGN_APPROVED: 'design_approved',
  DESIGN_REJECTED: 'design_rejected',

  // Development workflow
  DEVELOPMENT_PENDING: 'development_pending',
  DEVELOPMENT_SUBMITTED: 'development_submitted',
  DEVELOPMENT_APPROVED: 'development_approved',

  // Final status
  FINAL_APPROVED: 'final_approved',
  REJECTED: 'rejected',

  // Legacy statuses (for backward compatibility - deprecated)
  SUBMITTED: 'submitted',
  APPROVED_BY_TESTER: 'approved_by_tester',
  CONTENT_APPROVED: 'content_approved'
};

// Array of all valid statuses
export const TASK_STATUSES = [
  // Common
  'todo',
  'in_progress',

  // Content workflow
  'content_pending',
  'content_submitted',
  'content_final_approved',
  'content_rejected',

  // Design workflow
  'design_pending',
  'design_submitted',
  'design_approved',
  'design_rejected',

  // Development workflow
  'development_pending',
  'development_submitted',
  'development_approved',

  // Final status
  'final_approved',
  'rejected',

  // Legacy (deprecated)
  'submitted',
  'approved_by_tester',
  'content_approved'
];

// Status Groups (for filtering and categorization)
// ================================================

// Tasks that are pending work (not yet submitted for review)
export const PENDING_STATUSES = [
  'todo',
  'in_progress',
  'content_pending',
  'design_pending',
  'development_pending'
];

// Tasks submitted for review
export const SUBMITTED_STATUSES = [
  'content_submitted',
  'design_submitted',
  'development_submitted',
  'submitted' // legacy
];

// Tasks approved by tester (awaiting marketer approval)
export const APPROVED_STATUSES = [
  'approved_by_tester', // legacy
  'content_approved', // legacy
  'design_approved',
  'development_approved',
  'content_final_approved'
];

// Tasks fully approved (completed)
export const FINAL_STATUSES = ['final_approved'];

// Tasks rejected (need revision)
export const REJECTED_STATUSES = [
  'rejected',
  'content_rejected',
  'design_rejected'
];

// Active statuses (not completed or rejected)
export const ACTIVE_STATUSES = [
  'todo',
  'in_progress',
  'content_pending',
  'content_submitted',
  'content_rejected',
  'design_pending',
  'design_submitted',
  'design_rejected',
  'development_pending',
  'development_submitted'
];

// Status Configuration with Tailwind classes and Lucide icons
// ==========================================================

export const STATUS_CONFIG = {
  // Common statuses
  todo: {
    label: 'To Do',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    chartColor: '#6B7280',
    icon: ClipboardList,
    group: 'common',
    description: 'Task created, not started'
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    chartColor: '#3B82F6',
    icon: Play,
    group: 'common',
    description: 'Assigned user is working on it'
  },

  // Content workflow
  content_pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    chartColor: '#F97316',
    icon: FileText,
    group: 'content',
    description: 'Awaiting content creator'
  },
  content_submitted: {
    label: 'In Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    chartColor: '#F59E0B',
    icon: Send,
    group: 'content',
    description: 'Content submitted for tester review'
  },
  content_final_approved: {
    label: 'Approved',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    chartColor: '#10B981',
    icon: CheckCircle,
    group: 'content',
    description: 'Content approved by tester, ready for design'
  },
  content_rejected: {
    label: 'Revision Needed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    chartColor: '#EF4444',
    icon: XCircle,
    group: 'content',
    description: 'Content rejected, needs revision'
  },

  // Design workflow
  design_pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    chartColor: '#F97316',
    icon: Layout,
    group: 'design',
    description: 'Awaiting designer'
  },
  design_submitted: {
    label: 'In Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    chartColor: '#F59E0B',
    icon: Send,
    group: 'design',
    description: 'Design submitted for tester review'
  },
  design_approved: {
    label: 'Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    chartColor: '#8B5CF6',
    icon: CheckCircle,
    group: 'design',
    description: 'Design approved by tester, awaiting marketer review'
  },
  design_rejected: {
    label: 'Revision Needed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    chartColor: '#EF4444',
    icon: XCircle,
    group: 'design',
    description: 'Design rejected, needs revision'
  },

  // Development workflow
  development_pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    chartColor: '#F97316',
    icon: Code,
    group: 'development',
    description: 'Awaiting developer'
  },
  development_submitted: {
    label: 'In Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    chartColor: '#F59E0B',
    icon: Send,
    group: 'development',
    description: 'Development submitted for tester review'
  },
  development_approved: {
    label: 'Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    chartColor: '#8B5CF6',
    icon: CheckCircle,
    group: 'development',
    description: 'Development approved by tester, awaiting marketer review'
  },

  // Final status
  final_approved: {
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    chartColor: '#059669',
    icon: CheckCircle,
    group: 'final',
    description: 'Fully approved by performance marketer'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    chartColor: '#EF4444',
    icon: XCircle,
    group: 'final',
    description: 'Rejected with notes'
  },

  // Legacy statuses (deprecated - keep for backward compatibility)
  submitted: {
    label: 'Submitted',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    chartColor: '#F59E0B',
    icon: Send,
    group: 'legacy',
    deprecated: true,
    description: 'Work submitted for review (legacy status)'
  },
  approved_by_tester: {
    label: 'Tester Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    chartColor: '#8B5CF6',
    icon: CheckCircle,
    group: 'legacy',
    deprecated: true,
    description: 'Tester approved, awaiting marketer review (legacy status)'
  },
  content_approved: {
    label: 'Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    chartColor: '#8B5CF6',
    icon: CheckCircle,
    group: 'legacy',
    deprecated: true,
    description: 'Content approved (legacy status)'
  }
};

// Helper Functions
// ================

/**
 * Get status configuration by status value
 * @param {string} status - The status value
 * @returns {object} Status configuration object
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.todo;
}

/**
 * Get status label
 * @param {string} status - The status value
 * @returns {string} Status label
 */
export function getStatusLabel(status) {
  const config = STATUS_CONFIG[status];
  return config ? config.label : status;
}

/**
 * Get status badge classes (Tailwind)
 * @param {string} status - The status value
 * @returns {string} Tailwind classes for badge
 */
export function getStatusBadgeClasses(status) {
  const config = STATUS_CONFIG[status];
  if (!config) return 'bg-gray-100 text-gray-800';
  return `${config.bgColor} ${config.textColor}`;
}

/**
 * Get status chart color
 * @param {string} status - The status value
 * @returns {string} Chart color (hex)
 */
export function getStatusChartColor(status) {
  const config = STATUS_CONFIG[status];
  return config ? config.chartColor : '#6B7280';
}

/**
 * Get status icon component
 * @param {string} status - The status value
 * @returns {React.Component} Lucide icon component
 */
export function getStatusIcon(status) {
  const config = STATUS_CONFIG[status];
  return config ? config.icon : ClipboardList;
}

/**
 * Check if a status is deprecated
 * @param {string} status - The status value
 * @returns {boolean} True if status is deprecated
 */
export function isLegacyStatus(status) {
  return STATUS_CONFIG[status]?.deprecated === true;
}

/**
 * Get status group (content, design, development, common, final, legacy)
 * @param {string} status - The status value
 * @returns {string} Status group
 */
export function getStatusGroup(status) {
  return STATUS_CONFIG[status]?.group || 'common';
}

/**
 * Get the initial status for a task type
 * @param {string} taskType - The task type
 * @returns {string} Initial status
 */
export function getInitialStatus(taskType) {
  switch (taskType) {
    case 'content_creation':
      return 'content_pending';
    case 'graphic_design':
    case 'video_editing':
      return 'design_pending';
    case 'landing_page_design':
      return 'design_pending';
    case 'landing_page_development':
      return 'development_pending';
    default:
      return 'todo';
  }
}

/**
 * Check if a status allows submission
 * @param {string} status - The status value
 * @returns {boolean} True if task can be submitted
 */
export function canSubmit(status) {
  return PENDING_STATUSES.includes(status) ||
         status === 'rejected' ||
         status === 'content_rejected' ||
         status === 'design_rejected';
}

/**
 * Check if a status can be reviewed by tester
 * @param {string} status - The status value
 * @returns {boolean} True if task can be reviewed by tester
 */
export function canBeReviewedByTester(status) {
  return SUBMITTED_STATUSES.includes(status);
}

/**
 * Check if a status can be approved by marketer
 * @param {string} status - The status value
 * @returns {boolean} True if task can be approved by marketer
 */
export function canBeApprovedByMarketer(status) {
  return status === 'design_approved' ||
         status === 'development_approved' ||
         status === 'approved_by_tester'; // legacy
}

// Project Status Constants
// ========================

export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

export const PROJECT_STATUS_VALUES = ['active', 'paused', 'completed', 'archived'];

export const PROJECT_STATUS_CONFIG = {
  active: {
    label: 'Active',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    chartColor: '#10B981',
    description: 'Project is active'
  },
  paused: {
    label: 'Paused',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    chartColor: '#F59E0B',
    description: 'Project is paused'
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    chartColor: '#3B82F6',
    description: 'Project is completed'
  },
  archived: {
    label: 'Archived',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    chartColor: '#6B7280',
    description: 'Project is archived'
  }
};

// Chart Colors - Centralized colors for use in dashboard charts
// =============================================================

/**
 * Standard chart colors for status categories
 * Use these for consistent chart styling across dashboards
 */
export const CHART_COLORS = {
  // Status category colors
  pending: '#F59E0B',     // Amber/Yellow
  submitted: '#3B82F6',   // Blue
  inReview: '#F59E0B',    // Amber/Yellow
  approved: '#10B981',    // Green
  rejected: '#EF4444',    // Red
  completed: '#059669',  // Emerald

  // Workflow-specific approved colors
  contentApproved: '#10B981',    // Green for content
  designApproved: '#8B5CF6',     // Purple for design
  developmentApproved: '#8B5CF6', // Purple for development

  // Common status colors
  todo: '#6B7280',        // Gray
  inProgress: '#3B82F6',  // Blue

  // Chart color palettes
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Red
  info: '#06B6D4',       // Cyan
  neutral: '#6B7280',    // Gray
};

/**
 * Chart color palette for multi-series charts
 * Use for consistent colors when showing multiple data series
 */
export const CHART_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
];

/**
 * Generate chart data from status counts
 * @param {Object} statusCounts - Object with status values as keys and counts as values
 * @param {Array} statusOrder - Optional array of statuses in desired order
 * @returns {Array} Array of { name, value, color } objects for charts
 */
export function generateChartData(statusCounts, statusOrder = null) {
  const order = statusOrder || Object.keys(statusCounts);
  return order
    .filter(status => statusCounts[status] > 0)
    .map(status => ({
      name: getStatusLabel(status),
      value: statusCounts[status],
      color: getStatusChartColor(status)
    }));
}

/**
 * Get pie chart colors for standard dashboard stats
 * Returns colors for: pending, submitted, approved, rejected
 */
export function getStandardPieChartColors() {
  return {
    pending: CHART_COLORS.pending,
    submitted: CHART_COLORS.submitted,
    approved: CHART_COLORS.approved,
    rejected: CHART_COLORS.rejected,
  };
}

/**
 * Get bar chart colors for completed vs pending breakdown
 */
export function getStandardBarChartColors() {
  return {
    completed: CHART_COLORS.completed,
    pending: CHART_COLORS.pending,
  };
}

/**
 * Get project status configuration
 * @param {string} status - The project status value
 * @returns {object} Status configuration object
 */
export function getProjectStatusConfig(status) {
  return PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG.active;
}

/**
 * Get project status label
 * @param {string} status - The project status value
 * @returns {string} Status label
 */
export function getProjectStatusLabel(status) {
  const config = PROJECT_STATUS_CONFIG[status];
  return config ? config.label : status;
}

// Default export for convenience
export default {
  // Status Values
  TASK_STATUS_VALUES,
  TASK_STATUSES,

  // Status Groups
  PENDING_STATUSES,
  SUBMITTED_STATUSES,
  APPROVED_STATUSES,
  FINAL_STATUSES,
  REJECTED_STATUSES,
  ACTIVE_STATUSES,

  // Status Configuration
  STATUS_CONFIG,

  // Chart Colors
  CHART_COLORS,
  CHART_PALETTE,
  generateChartData,
  getStandardPieChartColors,
  getStandardBarChartColors,

  // Helper Functions
  getStatusConfig,
  getStatusLabel,
  getStatusBadgeClasses,
  getStatusChartColor,
  getStatusIcon,
  isLegacyStatus,
  getStatusGroup,
  getInitialStatus,
  canSubmit,
  canBeReviewedByTester,
  canBeApprovedByMarketer,

  // Project Statuses
  PROJECT_STATUSES,
  PROJECT_STATUS_VALUES,
  PROJECT_STATUS_CONFIG,
  getProjectStatusConfig,
  getProjectStatusLabel
};