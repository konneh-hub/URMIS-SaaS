import * as academicService from './academic.service.js';

// Faculty
export async function listFaculties(req, res, next) {
  try {
    const faculties = await academicService.listFaculties();
    res.json({ success: true, data: faculties });
  } catch (err) {
    next(err);
  }
}

export async function createFaculty(req, res, next) {
  try {
    const payload = req.body;
    const faculty = await academicService.createFaculty(payload, req.user?.id);
    res.status(201).json({ success: true, data: faculty });
  } catch (err) {
    next(err);
  }
}

export async function updateFaculty(req, res, next) {
  try {
    const { facultyId } = req.params;
    const payload = req.body;
    const faculty = await academicService.updateFaculty(facultyId, payload, req.user?.id);
    res.json({ success: true, data: faculty });
  } catch (err) {
    next(err);
  }
}

export async function deleteFaculty(req, res, next) {
  try {
    const { facultyId } = req.params;
    await academicService.deleteFaculty(facultyId, req.user?.id);
    res.json({ success: true, message: 'Faculty deleted' });
  } catch (err) {
    next(err);
  }
}

// Department
export async function listDepartments(req, res, next) {
  try {
    const departments = await academicService.listDepartments();
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const payload = req.body;
    const department = await academicService.createDepartment(payload, req.user?.id);
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const { departmentId } = req.params;
    const payload = req.body;
    const department = await academicService.updateDepartment(departmentId, payload, req.user?.id);
    res.json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    const { departmentId } = req.params;
    await academicService.deleteDepartment(departmentId, req.user?.id);
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
}

// Level
export async function listLevels(req, res, next) {
  try {
    const levels = await academicService.listLevels();
    res.json({ success: true, data: levels });
  } catch (err) {
    next(err);
  }
}

export async function createLevel(req, res, next) {
  try {
    const payload = req.body;
    const level = await academicService.createLevel(payload, req.user?.id);
    res.status(201).json({ success: true, data: level });
  } catch (err) {
    next(err);
  }
}

export async function updateLevel(req, res, next) {
  try {
    const { levelId } = req.params;
    const payload = req.body;
    const level = await academicService.updateLevel(levelId, payload, req.user?.id);
    res.json({ success: true, data: level });
  } catch (err) {
    next(err);
  }
}

export async function deleteLevel(req, res, next) {
  try {
    const { levelId } = req.params;
    await academicService.deleteLevel(levelId, req.user?.id);
    res.json({ success: true, message: 'Level deleted' });
  } catch (err) {
    next(err);
  }
}

// Programme
export async function listProgrammes(req, res, next) {
  try {
    const programmes = await academicService.listProgrammes();
    res.json({ success: true, data: programmes });
  } catch (err) {
    next(err);
  }
}

export async function createProgramme(req, res, next) {
  try {
    const payload = req.body;
    const programme = await academicService.createProgramme(payload, req.user?.id);
    res.status(201).json({ success: true, data: programme });
  } catch (err) {
    next(err);
  }
}

export async function updateProgramme(req, res, next) {
  try {
    const { programmeId } = req.params;
    const payload = req.body;
    const programme = await academicService.updateProgramme(programmeId, payload, req.user?.id);
    res.json({ success: true, data: programme });
  } catch (err) {
    next(err);
  }
}

export async function deleteProgramme(req, res, next) {
  try {
    const { programmeId } = req.params;
    await academicService.deleteProgramme(programmeId, req.user?.id);
    res.json({ success: true, message: 'Programme deleted' });
  } catch (err) {
    next(err);
  }
}

// Academic Session
export async function listAcademicSessions(req, res, next) {
  try {
    const sessions = await academicService.listAcademicSessions();
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function createAcademicSession(req, res, next) {
  try {
    const payload = req.body;
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);
    const session = await academicService.createAcademicSession(payload, req.user?.id);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function updateAcademicSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const payload = req.body;
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);
    const session = await academicService.updateAcademicSession(sessionId, payload, req.user?.id);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function deleteAcademicSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    await academicService.deleteAcademicSession(sessionId, req.user?.id);
    res.json({ success: true, message: 'Academic session deleted' });
  } catch (err) {
    next(err);
  }
}

// Curriculum
export async function listCurricula(req, res, next) {
  try {
    const curricula = await academicService.listCurricula();
    res.json({ success: true, data: curricula });
  } catch (err) {
    next(err);
  }
}

export async function createCurriculum(req, res, next) {
  try {
    const payload = req.body;
    const curriculum = await academicService.createCurriculum(payload, req.user?.id);
    res.status(201).json({ success: true, data: curriculum });
  } catch (err) {
    next(err);
  }
}

export async function updateCurriculum(req, res, next) {
  try {
    const { curriculumId } = req.params;
    const payload = req.body;
    const curriculum = await academicService.updateCurriculum(curriculumId, payload, req.user?.id);
    res.json({ success: true, data: curriculum });
  } catch (err) {
    next(err);
  }
}

export async function deleteCurriculum(req, res, next) {
  try {
    const { curriculumId } = req.params;
    await academicService.deleteCurriculum(curriculumId, req.user?.id);
    res.json({ success: true, message: 'Curriculum deleted' });
  } catch (err) {
    next(err);
  }
}

// Course allocation
export async function listCourseAllocations(req, res, next) {
  try {
    const allocations = await academicService.listCourseAllocations();
    res.json({ success: true, data: allocations });
  } catch (err) {
    next(err);
  }
}

export async function createCourseAllocation(req, res, next) {
  try {
    const payload = req.body;
    const allocation = await academicService.createCourseAllocation(payload, req.user?.id);
    res.status(201).json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
}

export async function updateCourseAllocation(req, res, next) {
  try {
    const { allocationId } = req.params;
    const payload = req.body;
    const allocation = await academicService.updateCourseAllocation(allocationId, payload, req.user?.id);
    res.json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourseAllocation(req, res, next) {
  try {
    const { allocationId } = req.params;
    await academicService.deleteCourseAllocation(allocationId, req.user?.id);
    res.json({ success: true, message: 'Course allocation deleted' });
  } catch (err) {
    next(err);
  }
}
