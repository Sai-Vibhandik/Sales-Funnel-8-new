/**
 * Task Status Constants
 * =====================
 *
 * Centralized status definitions for the task workflow system.
 * This file serves as the single source of truth for all task statuses.
 */

// Task Status Values
// ==================

const TASK_STATUS_VALUES = {
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

// Array of all valid statuses (for mongoose enum)
const TASK_STATUSES = [
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
const PENDING_STATUSES = [
  'todo',
  'in_progress',
  'content_pending',
  'design_pending',
  'development_pending'
];

// Tasks submitted for review
const SUBMITTED_STATUSES = [
  'content_submitted',
  'design_submitted',
  'development_submitted',
  'submitted' // legacy
];

// Tasks approved by tester (awaiting marketer approval)
// Note: content_final_approved goes directly to designer, NOT to marketer
const APPROVED_STATUSES = [
  'approved_by_tester', // legacy
  'design_approved',       // Design approved by tester, awaiting marketer
  'development_approved'   // Development approved by tester, awaiting marketer
];

// Tasks fully approved (completed)
const FINAL_STATUSES = ['final_approved'];

// Tasks rejected (need revision)
const REJECTED_STATUSES = [
  'rejected',
  'content_rejected',
  'design_rejected'
];

// Active statuses (not completed or rejected)
const ACTIVE_STATUSES = [
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

// Status Configuration (labels, colors, icons)
// =============================================

const STATUS_CONFIG = {
  // Common statuses
  todo: {
    label: 'To Do',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: 'ClipboardList',
    group: 'common',
    description: 'Task created, not started'
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'Play',
    group: 'common',
    description: 'Assigned user is working on it'
  },

  // Content workflow
  content_pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'FileText',
    group: 'content',
    description: 'Awaiting content creator'
  },
  content_submitted: {
    label: 'In Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'Send',
    group: 'content',
    description: 'Content submitted for tester review'
  },
  content_final_approved: {
    label: 'Approved',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'CheckCircle',
    group: 'content',
    description: 'Content approved by tester, ready for design'
  },
  content_rejected: {
    label: 'Revision Needed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'XCircle',
    group: 'content',
    description: 'Content rejected, needs revision'
  },

  // Design workflow
  design_pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'Layout',
    group: 'design',
    description: 'Awaiting designer'
  },
  design_submitted: {
    label: 'In Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'Send',
    group: 'design',
    description: 'Design submitted for tester review'
  },
  design_approved: {
    label: 'Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'CheckCircle',
    group: 'design',
    description: 'Design approved by tester, awaiting marketer review'
  },
  design_rejected: {
    label: 'Revision Needed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'XCircle',
    group: 'design',
    description: 'Design rejected, needs revision'
  },

  // Development workflow
  development_pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'Code',
    group: 'development',
    description: 'Awaiting developer'
  },
  development_submitted: {
    label: 'In Review',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'Send',
    group: 'development',
    description: 'Development submitted for tester review'
  },
  development_approved: {
    label: 'Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'CheckCircle',
    group: 'development',
    description: 'Development approved by tester, awaiting marketer review'
  },

  // Final status
  final_approved: {
    label: 'Completed',
    color: 'green',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    icon: 'CheckCircle',
    group: 'final',
    description: 'Fully approved by performance marketer'
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'XCircle',
    group: 'final',
    description: 'Rejected with notes'
  },

  // Legacy statuses (deprecated - keep for backward compatibility)
  submitted: {
    label: 'Submitted',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'Send',
    group: 'legacy',
    deprecated: true,
    description: 'Work submitted for review (legacy status)'
  },
  approved_by_tester: {
    label: 'Tester Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'CheckCircle',
    group: 'legacy',
    deprecated: true,
    description: 'Tester approved, awaiting marketer review (legacy status)'
  },
  content_approved: {
    label: 'Approved',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'CheckCircle',
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
function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.todo;
}

/**
 * Check if a status is deprecated
 * @param {string} status - The status value
 * @returns {boolean} True if status is deprecated
 */
function isLegacyStatus(status) {
  return STATUS_CONFIG[status]?.deprecated === true;
}

/**
 * Get status group (content, design, development, common, final, legacy)
 * @param {string} status - The status value
 * @returns {string} Status group
 */
function getStatusGroup(status) {
  return STATUS_CONFIG[status]?.group || 'common';
}

/**
 * Get the initial status for a task type
 * @param {string} taskType - The task type
 * @returns {string} Initial status
 */
function getInitialStatus(taskType) {
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
function canSubmit(status) {
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
function canBeReviewedByTester(status) {
  return SUBMITTED_STATUSES.includes(status);
}

/**
 * Check if a status can be approved by marketer
 * @param {string} status - The status value
 * @returns {boolean} True if task can be approved by marketer
 */
function canBeApprovedByMarketer(status) {
  return status === 'design_approved' ||
         status === 'development_approved' ||
         status === 'approved_by_tester'; // legacy
}

// Workflow Transitions
// =====================

/**
 * Get valid status transitions for a given status and task type
 * @param {string} currentStatus - Current status value
 * @param {string} taskType - Task type
 * @returns {string[]} Array of valid next statuses
 */
function getValidTransitions(currentStatus, taskType) {
  // Landing page design has a different workflow - goes to development after approval
  if (taskType === 'landing_page_design') {
    const landingPageDesignTransitions = {
      design_pending: ['design_submitted'],
      design_submitted: ['design_approved', 'design_rejected'],
      // After marketer approval, goes to development_pending (not rejected)
      design_approved: ['development_pending'],
      design_rejected: ['design_submitted']
    };
    return landingPageDesignTransitions[currentStatus] || [];
  }

  // Landing page development workflow
  if (taskType === 'landing_page_development') {
    const landingPageDevTransitions = {
      development_pending: ['development_submitted'],
      development_submitted: ['development_approved', 'development_pending'],
      // After marketer approval, goes to final_approved (not rejected)
      development_approved: ['final_approved']
    };
    return landingPageDevTransitions[currentStatus] || [];
  }

  const transitions = {
    // Standard creative workflow (legacy)
    todo: ['in_progress'],
    in_progress: ['submitted'],
    submitted: ['approved_by_tester', 'rejected'],
    approved_by_tester: ['final_approved', 'rejected'],
    rejected: ['in_progress', 'submitted'],
    final_approved: [],

    // Content creation workflow
    content_pending: ['content_submitted'],
    content_submitted: ['content_final_approved', 'content_rejected'],
    content_approved: ['content_final_approved', 'content_rejected'], // Legacy
    content_rejected: ['content_submitted'],
    // Content approved by tester -> ready for design
    content_final_approved: ['design_pending'],

    // Design workflow (for graphic design/video tasks after content approval)
    design_pending: ['design_submitted'],
    design_submitted: ['design_approved', 'design_rejected'],
    // Design approved by tester -> marketer can approve or reject
    design_approved: ['final_approved', 'design_rejected'],
    design_rejected: ['design_submitted'],

    // Landing page development (fallback)
    development_pending: ['development_submitted'],
    development_submitted: ['development_approved', 'development_pending'],
    development_approved: ['final_approved', 'rejected']
  };

  return transitions[currentStatus] || [];
}

// Project Status Constants
// ========================

const PROJECT_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

const PROJECT_STATUS_VALUES = ['active', 'paused', 'completed', 'archived'];

const PROJECT_STATUS_CONFIG = {
  active: {
    label: 'Active',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    description: 'Project is active'
  },
  paused: {
    label: 'Paused',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    description: 'Project is paused'
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    description: 'Project is completed'
  },
  archived: {
    label: 'Archived',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    description: 'Project is archived'
  }
};

// User Availability Status
// =========================

const USER_AVAILABILITY_STATUSES = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

module.exports = {
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

  // Helper Functions
  getStatusConfig,
  isLegacyStatus,
  getStatusGroup,
  getInitialStatus,
  canSubmit,
  canBeReviewedByTester,
  canBeApprovedByMarketer,
  getValidTransitions,

  // Project Statuses
  PROJECT_STATUSES,
  PROJECT_STATUS_VALUES,
  PROJECT_STATUS_CONFIG,

  // User Availability
  USER_AVAILABILITY_STATUSES
};