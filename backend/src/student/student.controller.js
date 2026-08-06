import * as studentService from './student.service.js';

export async function getProfile(req, res, next) {
  try {
    const student = await studentService.getStudentProfile(req.user);
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

export async function getCourses(req, res, next) {
  try {
    const courses = await studentService.listAvailableCourses(req.user);
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

export async function getRegisteredCourses(req, res, next) {
  try {
    const courses = await studentService.listRegisteredCourses(req.user);
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
}

export async function registerCourse(req, res, next) {
  try {
    const registration = await studentService.registerForCourse(req.user, req.body);
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function dropCourse(req, res, next) {
  try {
    const registration = await studentService.dropCourse(req.user, req.params.courseId);
    res.json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
}

export async function getAssessments(req, res, next) {
  try {
    const assessments = await studentService.listAssessments(req.user);
    res.json({ success: true, data: assessments });
  } catch (err) {
    next(err);
  }
}

export async function getResults(req, res, next) {
  try {
    const results = await studentService.listResults(req.user);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function getTranscriptRequests(req, res, next) {
  try {
    const requests = await studentService.listTranscriptRequests(req.user);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

export async function createTranscriptRequest(req, res, next) {
  try {
    const request = await studentService.createTranscriptRequest(req.user, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
}

export async function getAcademicHistory(req, res, next) {
  try {
    const history = await studentService.listAcademicHistory(req.user);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getFeeStatus(req, res, next) {
  try {
    const fees = await studentService.getFeeStatus(req.user);
    res.json({ success: true, data: fees });
  } catch (err) {
    next(err);
  }
}

export async function getDocuments(req, res, next) {
  try {
    const documents = await studentService.listDocuments(req.user);
    res.json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
}

export async function getNotifications(req, res, next) {
  try {
    const notifications = await studentService.listNotifications(req.user);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function getSupportTickets(req, res, next) {
  try {
    const tickets = await studentService.listSupportTickets(req.user, req.query);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}

export async function createSupportTicket(req, res, next) {
  try {
    const ticket = await studentService.createSupportTicket(req.user, req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}
