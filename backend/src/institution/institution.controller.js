import prisma from '../database/prismaClient.js';
import * as institutionService from './institution.service.js';
import * as studentService from '../student/student.service.js';

export async function getInstitutions(req, res, next) {
  try {
    const institutions = await prisma.institution.findMany({
      where: { deletedAt: null },
      include: {
        settings: true,
        statistics: true,
      },
    });
    res.json({ success: true, data: institutions });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionById(req, res, next) {
  try {
    const { institutionId } = req.params;
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        settings: true,
        statistics: true,
      },
    });
    if (!institution || institution.deletedAt) return res.status(404).json({ success: false, message: 'Institution not found' });
    res.json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function createInstitution(req, res, next) {
  try {
    const {
      name,
      code,
      domain,
      address,
      phone,
      email,
      logoUrl,
      brandColor,
      subscriptionPlan,
      subscriptionStatus,
      subscriptionExpiresAt,
      storageLimitMb,
    } = req.body;

    const institution = await institutionService.createInstitution({
      name,
      code,
      domain,
      address,
      phone,
      email,
      logoUrl,
      brandColor,
      subscriptionPlan,
      subscriptionStatus,
      subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : undefined,
      storageLimitMb,
      settings: {
        create: {
          timezone: req.body.timezone || 'UTC',
          locale: req.body.locale || 'en',
          language: req.body.language || 'en',
          theme: req.body.theme || 'default',
          brandColor,
          logoUrl,
          customDomain: req.body.customDomain,
          supportEmail: req.body.supportEmail,
          enableMultiCampus: req.body.enableMultiCampus ?? false,
        },
      },
      statistics: {
        create: {
          activeUsers: 0,
          studentCount: 0,
          courseCount: 0,
          storageUsedMb: 0,
          storageLimitMb: storageLimitMb ?? 1024,
        },
      },
    });

    res.status(201).json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function updateInstitution(req, res, next) {
  try {
    const { institutionId } = req.params;
    const data = { ...req.body };
    delete data.id;
    delete data.settings;
    delete data.statistics;
    delete data.deletedAt;

    if (data.subscriptionExpiresAt) data.subscriptionExpiresAt = new Date(data.subscriptionExpiresAt);

    const institution = await institutionService.updateInstitution(institutionId, data);

    res.json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function deleteInstitution(req, res, next) {
  try {
    const { institutionId } = req.params;
    const institution = await prisma.institution.update({
      where: { id: institutionId },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function restoreInstitution(req, res, next) {
  try {
    const { institutionId } = req.params;
    const institution = await prisma.institution.update({
      where: { id: institutionId },
      data: { deletedAt: null },
    });
    res.json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionSettings(req, res, next) {
  try {
    const { institutionId } = req.params;
    const settings = await institutionService.getInstitutionSettings(institutionId);
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found' });
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateInstitutionSettings(req, res, next) {
  try {
    const { institutionId } = req.params;
    const data = { ...req.body };
    delete data.id;
    delete data.institutionId;

    const settings = await institutionService.updateInstitutionSettings(institutionId, data);
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function getGlobalSettings(req, res, next) {
  try {
    const { institutionId } = req.params;
    const settings = await prisma.institutionSetting.findUnique({ where: { institutionId } });
    if (!settings) return res.status(404).json({ success: false, message: 'Settings not found' });
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionStatistics(req, res, next) {
  try {
    const { institutionId } = req.params;
    const statistics = await prisma.institutionStatistics.findUnique({ where: { institutionId } });
    if (!statistics) return res.status(404).json({ success: false, message: 'Statistics not found' });
    res.json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
}

export async function updateInstitutionStatus(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { status } = req.body;
    const institution = await prisma.institution.update({ where: { id: institutionId }, data: { status } });
    res.json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionProfile(req, res, next) {
  try {
    const { institutionId } = req.params;
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        settings: true,
        statistics: true,
      },
    });
    if (!institution || institution.deletedAt) return res.status(404).json({ success: false, message: 'Institution not found' });
    res.json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function getStudentResults(req, res, next) {
  try {
    if (!req.user?.studentId) {
      return res.status(403).json({ success: false, message: 'Student access required' });
    }
    const results = await institutionService.listStudentResults(req.user.studentId, req.user);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function listInstitutionCourses(req, res, next) {
  try {
    const courses = await studentService.listAvailableCourses(req.user);
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

export async function listStudentCourses(req, res, next) {
  try {
    const courses = await studentService.listRegisteredCourses(req.user);
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

export async function registerStudentCourse(req, res, next) {
  try {
    const course = await studentService.registerForCourse(req.user, req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

export async function dropStudentCourse(req, res, next) {
  try {
    const dropped = await studentService.dropCourse(req.user, req.params.courseId);
    res.json({ success: true, data: dropped });
  } catch (err) {
    next(err);
  }
}

export async function listStudentAssessments(req, res, next) {
  try {
    const assessments = await studentService.listAssessments(req.user);
    res.json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
}

export async function listStudentAcademicHistory(req, res, next) {
  try {
    const history = await studentService.listAcademicHistory(req.user);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function listStudentDocuments(req, res, next) {
  try {
    const documents = await studentService.listDocuments(req.user);
    res.json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
}

export async function getStudentFeeStatus(req, res, next) {
  try {
    const feeStatus = await studentService.getFeeStatus(req.user);
    res.json({ success: true, data: feeStatus.items || [] });
  } catch (err) {
    next(err);
  }
}

export async function listStudentSupportTickets(req, res, next) {
  try {
    const tickets = await studentService.listSupportTickets(req.user);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}

export async function createStudentSupportTicket(req, res, next) {
  try {
    const ticket = await studentService.createSupportTicket(req.user, req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function listStudentTranscriptRequests(req, res, next) {
  try {
    const requests = await studentService.listTranscriptRequests(req.user);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

export async function createStudentTranscriptRequest(req, res, next) {
  try {
    const request = await studentService.createTranscriptRequest(req.user, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionSubscription(req, res, next) {
  try {
    const { institutionId } = req.params;
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
    res.json({
      success: true,
      data: {
        plan: institution.subscriptionPlan,
        status: institution.subscriptionStatus,
        expiresAt: institution.subscriptionExpiresAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionStorage(req, res, next) {
  try {
    const { institutionId } = req.params;
    const statistics = await prisma.institutionStatistics.findUnique({ where: { institutionId } });
    if (!statistics) return res.status(404).json({ success: false, message: 'Storage information not found' });
    res.json({ success: true, data: { storageUsedMb: statistics.storageUsedMb, storageLimitMb: statistics.storageLimitMb } });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionActivityLogs(req, res, next) {
  try {
    const { institutionId } = req.params;
    const logs = await prisma.institutionActivityLog.findMany({ where: { institutionId }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionAuditLogs(req, res, next) {
  try {
    const { institutionId } = req.params;
    const logs = await prisma.institutionAuditLog.findMany({ where: { institutionId }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

export async function cloneInstitutionConfiguration(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { targetInstitutionId } = req.body;

    const sourceSettings = await prisma.institutionSetting.findUnique({ where: { institutionId } });
    const sourceStatistics = await prisma.institutionStatistics.findUnique({ where: { institutionId } });
    if (!sourceSettings || !sourceStatistics) {
      return res.status(404).json({ success: false, message: 'Source institution configuration not found' });
    }

    await prisma.institutionSetting.upsert({
      where: { institutionId: targetInstitutionId },
      update: {
        timezone: sourceSettings.timezone,
        locale: sourceSettings.locale,
        language: sourceSettings.language,
        theme: sourceSettings.theme,
        brandColor: sourceSettings.brandColor,
        logoUrl: sourceSettings.logoUrl,
        customDomain: sourceSettings.customDomain,
        supportEmail: sourceSettings.supportEmail,
        enableMultiCampus: sourceSettings.enableMultiCampus,
      },
      create: {
        institutionId: targetInstitutionId,
        timezone: sourceSettings.timezone,
        locale: sourceSettings.locale,
        language: sourceSettings.language,
        theme: sourceSettings.theme,
        brandColor: sourceSettings.brandColor,
        logoUrl: sourceSettings.logoUrl,
        customDomain: sourceSettings.customDomain,
        supportEmail: sourceSettings.supportEmail,
        enableMultiCampus: sourceSettings.enableMultiCampus,
      },
    });

    await prisma.institutionStatistics.upsert({
      where: { institutionId: targetInstitutionId },
      update: {
        storageLimitMb: sourceStatistics.storageLimitMb,
      },
      create: {
        institutionId: targetInstitutionId,
        activeUsers: sourceStatistics.activeUsers,
        studentCount: sourceStatistics.studentCount,
        courseCount: sourceStatistics.courseCount,
        storageUsedMb: sourceStatistics.storageUsedMb,
        storageLimitMb: sourceStatistics.storageLimitMb,
        dailyActiveUsers: sourceStatistics.dailyActiveUsers,
        lastActivityAt: sourceStatistics.lastActivityAt,
      },
    });

    await prisma.institutionActivityLog.create({
      data: {
        institutionId: targetInstitutionId,
        action: 'clone_configuration',
        description: `Configuration cloned from institution ${institutionId}`,
        performedBy: req.user?.id || 'system',
      },
    });

    res.json({ success: true, message: 'Configuration clone completed' });
  } catch (err) {
    next(err);
  }
}

export async function resetInstitution(req, res, next) {
  try {
    const { institutionId } = req.params;

    await prisma.institution.update({ where: { id: institutionId }, data: { status: 'PENDING' } });
    await prisma.institutionSetting.updateMany({ where: { institutionId }, data: { theme: 'default', timezone: 'UTC', locale: 'en', language: 'en', customDomain: null, supportEmail: null, enableMultiCampus: false } });
    await prisma.institutionStatistics.updateMany({ where: { institutionId }, data: { activeUsers: 0, studentCount: 0, courseCount: 0, storageUsedMb: 0, lastActivityAt: null } });
    await prisma.institutionActivityLog.create({ data: { institutionId, action: 'reset', description: 'Institution reset to default configuration', performedBy: req.user?.id || 'system' } });

    res.json({ success: true, message: 'Institution reset successfully' });
  } catch (err) {
    next(err);
  }
}
