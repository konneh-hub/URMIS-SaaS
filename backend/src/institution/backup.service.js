import prisma from '../database/prismaClient.js';

export async function listBackupJobs(institutionId) {
  return prisma.backupJob.findMany({ where: { institutionId }, orderBy: { createdAt: 'desc' } });
}

export async function createBackupJob(data) {
  return prisma.backupJob.create({ data });
}

export async function getBackupJob(backupId) {
  return prisma.backupJob.findUnique({ where: { id: backupId } });
}

export async function updateBackupJob(backupId, data) {
  return prisma.backupJob.update({ where: { id: backupId }, data });
}

export async function deleteBackupJob(backupId) {
  return prisma.backupJob.delete({ where: { id: backupId } });
}

export async function listBackupSchedules(institutionId) {
  return prisma.backupSchedule.findMany({ where: { institutionId }, orderBy: { createdAt: 'desc' } });
}

export async function createBackupSchedule(data) {
  return prisma.backupSchedule.create({ data });
}

export async function updateBackupSchedule(scheduleId, data) {
  return prisma.backupSchedule.update({ where: { id: scheduleId }, data });
}

export async function deleteBackupSchedule(scheduleId) {
  return prisma.backupSchedule.delete({ where: { id: scheduleId } });
}
