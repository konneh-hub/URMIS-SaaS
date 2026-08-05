import prisma from '../database/prismaClient.js';

export async function getInstitutionSettings(institutionId) {
  return prisma.institutionSetting.findUnique({ where: { institutionId } });
}

export async function updateInstitutionSettings(institutionId, data) {
  return prisma.institutionSetting.upsert({
    where: { institutionId },
    update: data,
    create: { institutionId, ...data },
  });
}

export async function createInstitution(data) {
  return prisma.institution.create({ data, include: { settings: true, statistics: true } });
}

export async function updateInstitution(institutionId, data) {
  return prisma.institution.update({
    where: { id: institutionId },
    data,
    include: { settings: true, statistics: true },
  });
}
