import * as backupService from './backup.service.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

export async function listBackups(req, res, next) {
  try {
    const { institutionId } = req.params;
    const backups = await backupService.listBackupJobs(institutionId);
    res.json({ success: true, data: backups });
  } catch (err) {
    next(err);
  }
}

export async function createBackup(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { name, provider, type, metadata } = req.body;
    const backup = await backupService.createBackupJob({ institutionId, name, provider, type, metadata });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_backup_job', details: backup.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: backup });
  } catch (err) {
    next(err);
  }
}

export async function getBackup(req, res, next) {
  try {
    const { backupId } = req.params;
    const backup = await backupService.getBackupJob(backupId);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup job not found' });
    res.json({ success: true, data: backup });
  } catch (err) {
    next(err);
  }
}

export async function updateBackup(req, res, next) {
  try {
    const { backupId } = req.params;
    const { status, downloadUrl, completedAt, sizeMb, metadata } = req.body;
    const backup = await backupService.updateBackupJob(backupId, {
      status,
      downloadUrl,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      sizeMb,
      metadata,
    });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_backup_job', details: backupId, performedBy: req.user.id });
    res.json({ success: true, data: backup });
  } catch (err) {
    next(err);
  }
}

export async function deleteBackup(req, res, next) {
  try {
    const { backupId } = req.params;
    await backupService.deleteBackupJob(backupId);
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_backup_job', details: backupId, performedBy: req.user.id });
    res.json({ success: true, message: 'Backup deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listBackupSchedules(req, res, next) {
  try {
    const { institutionId } = req.params;
    const schedules = await backupService.listBackupSchedules(institutionId);
    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
}

export async function createBackupSchedule(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { name, cronExpression, provider, nextRunAt } = req.body;
    const schedule = await backupService.createBackupSchedule({
      institutionId,
      name,
      cronExpression,
      provider,
      nextRunAt: new Date(nextRunAt),
    });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_backup_schedule', details: schedule.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function updateBackupSchedule(req, res, next) {
  try {
    const { scheduleId } = req.params;
    const { name, cronExpression, provider, nextRunAt, status } = req.body;
    const schedule = await backupService.updateBackupSchedule(scheduleId, {
      name,
      cronExpression,
      provider,
      nextRunAt: nextRunAt ? new Date(nextRunAt) : undefined,
      status,
    });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_backup_schedule', details: scheduleId, performedBy: req.user.id });
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

export async function deleteBackupSchedule(req, res, next) {
  try {
    const { scheduleId } = req.params;
    await backupService.deleteBackupSchedule(scheduleId);
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_backup_schedule', details: scheduleId, performedBy: req.user.id });
    res.json({ success: true, message: 'Backup schedule deleted' });
  } catch (err) {
    next(err);
  }
}

export async function restoreBackup(req, res, next) {
  try {
    const { backupId } = req.params;
    const backup = await backupService.getBackupJob(backupId);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup job not found' });
    await recordUserAuditLog({ userId: req.user.id, action: 'restore_backup', details: backupId, performedBy: req.user.id });
    res.json({ success: true, data: { message: 'Restore triggered', backup } });
  } catch (err) {
    next(err);
  }
}

export async function downloadBackup(req, res, next) {
  try {
    const { backupId } = req.params;
    const backup = await backupService.getBackupJob(backupId);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup job not found' });
    res.json({ success: true, data: { downloadUrl: backup.downloadUrl } });
  } catch (err) {
    next(err);
  }
}
