/**
 * Migration script to set originalAssignedTo for existing tasks
 * Run with: node scripts/fixOriginalAssignedTo.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../src/models/Task');

async function fixOriginalAssignedTo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all tasks without originalAssignedTo
    const tasks = await Task.find({ originalAssignedTo: { $exists: false } });
    console.log(`Found ${tasks.length} tasks without originalAssignedTo`);

    let updated = 0;
    let skipped = 0;

    for (const task of tasks) {
      let originalAssignedTo = null;

      // Determine original assignee based on task type and status
      const creatorRoles = ['content_writer', 'graphic_designer', 'video_editor', 'ui_ux_designer', 'developer'];
      const pendingStatuses = ['content_pending', 'design_pending', 'development_pending', 'todo', 'in_progress'];
      const rejectedStatuses = ['content_rejected', 'design_rejected'];
      const submittedStatuses = ['content_submitted', 'design_submitted', 'development_submitted'];
      const approvedStatuses = ['content_final_approved', 'design_approved', 'development_approved', 'final_approved'];

      if (pendingStatuses.includes(task.status) || rejectedStatuses.includes(task.status)) {
        // Task is still pending or rejected - current assignedTo is the original creator
        if (creatorRoles.includes(task.assignedRole)) {
          originalAssignedTo = task.assignedTo;
        }
      } else if (submittedStatuses.includes(task.status) || approvedStatuses.includes(task.status)) {
        // Task was submitted - look at revision history to find who submitted it
        // The person who changed status to "submitted" is likely the original creator
        if (task.revisionHistory && task.revisionHistory.length > 0) {
          // Find the revision where status changed to submitted
          for (const revision of task.revisionHistory) {
            if (submittedStatuses.includes(revision.status)) {
              originalAssignedTo = revision.changedBy;
              break;
            }
          }
        }
      }

      // Update the task if we found an original assignee
      if (originalAssignedTo) {
        await Task.findByIdAndUpdate(task._id, { originalAssignedTo });
        updated++;
        console.log(`✓ Updated task ${task._id} (status: ${task.status}): originalAssignedTo = ${originalAssignedTo}`);
      } else {
        skipped++;
        console.log(`✗ Skipped task ${task._id} (status: ${task.status}, assignedRole: ${task.assignedRole})`);
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`  Updated: ${updated} tasks`);
    console.log(`  Skipped: ${skipped} tasks`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

fixOriginalAssignedTo();