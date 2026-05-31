import express from "express";
import mongoose from "mongoose";
import TeacherClass from "../model/TeacherClass.js";
import TeacherAction from "../model/TeacherAction.js";
import User from "../model/User.js";
import QuizAttempt from "../model/QuizAttempt.js";
import Submission from "../model/Submission.js";

const router = express.Router();

const ACTION_TYPES = {
  extraClass: "extra-class",
  reschedule: "reschedule",
  surpriseTest: "surprise-test",
  extraWork: "extra-work",
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeObjectIdString = (id) => (id ? String(id) : "");

// ---------- Class management ----------
router.post("/classes", async (req, res) => {
  try {
    const {
      teacherId,
      title,
      subject,
      grade,
      section,
      room,
      scheduleDays,
      scheduleTime,
      notes,
    } = req.body;

    if (!teacherId || !title || !subject) {
      return res.status(400).json({ error: "teacherId, title and subject are required" });
    }

    const created = await TeacherClass.create({
      teacherId,
      title,
      subject,
      grade,
      section,
      room,
      scheduleDays: Array.isArray(scheduleDays) ? scheduleDays : [],
      scheduleTime,
      notes,
    });

    res.status(201).json({ message: "Class created", class: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/classes", async (req, res) => {
  try {
    const { teacherId, active } = req.query;
    const filter = {};

    if (teacherId) filter.teacherId = teacherId;
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const classes = await TeacherClass.find(filter)
      .sort({ createdAt: -1 })
      .populate("studentIds", "name email grade school")
      .lean();

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/classes/:classId", async (req, res) => {
  try {
    const cls = await TeacherClass.findById(req.params.classId)
      .populate("studentIds", "name email grade school")
      .lean();

    if (!cls) return res.status(404).json({ error: "Class not found" });

    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/classes/:classId", async (req, res) => {
  try {
    const updated = await TeacherClass.findByIdAndUpdate(req.params.classId, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("studentIds", "name email grade school")
      .lean();

    if (!updated) return res.status(404).json({ error: "Class not found" });

    res.json({ message: "Class updated", class: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/classes/:classId", async (req, res) => {
  try {
    const deleted = await TeacherClass.findByIdAndDelete(req.params.classId);
    if (!deleted) return res.status(404).json({ error: "Class not found" });

    await TeacherAction.deleteMany({ classId: deleted._id });

    res.json({ message: "Class and associated actions deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/classes/:classId/students", async (req, res) => {
  try {
    const { studentIds = [], mode = "set" } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ error: "studentIds must be an array" });
    }

    const validIds = studentIds.filter((id) => isValidObjectId(id));

    if (mode === "add") {
      const updated = await TeacherClass.findByIdAndUpdate(
        req.params.classId,
        { $addToSet: { studentIds: { $each: validIds } } },
        { new: true }
      )
        .populate("studentIds", "name email grade school")
        .lean();

      if (!updated) return res.status(404).json({ error: "Class not found" });
      return res.json({ message: "Students added", class: updated });
    }

    if (mode === "remove") {
      const updated = await TeacherClass.findByIdAndUpdate(
        req.params.classId,
        { $pull: { studentIds: { $in: validIds } } },
        { new: true }
      )
        .populate("studentIds", "name email grade school")
        .lean();

      if (!updated) return res.status(404).json({ error: "Class not found" });
      return res.json({ message: "Students removed", class: updated });
    }

    const updated = await TeacherClass.findByIdAndUpdate(
      req.params.classId,
      { studentIds: validIds },
      { new: true, runValidators: true }
    )
      .populate("studentIds", "name email grade school")
      .lean();

    if (!updated) return res.status(404).json({ error: "Class not found" });

    res.json({ message: "Class roster updated", class: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Teacher actions ----------
const createAction = async (req, res, actionType) => {
  try {
    const {
      teacherId,
      classId,
      title,
      description,
      date,
      time,
      durationMinutes,
      chapter,
      dueDate,
      studentIds,
      rescheduleFromDate,
      rescheduleFromTime,
      rescheduleToDate,
      rescheduleToTime,
      metadata,
      status,
    } = req.body;

    if (!teacherId || !classId || !title) {
      return res.status(400).json({ error: "teacherId, classId and title are required" });
    }

    const cls = await TeacherClass.findById(classId).lean();
    if (!cls) return res.status(404).json({ error: "Class not found" });

    const action = await TeacherAction.create({
      teacherId,
      classId,
      type: actionType,
      title,
      description,
      date,
      time,
      durationMinutes,
      chapter,
      dueDate,
      studentIds: Array.isArray(studentIds) ? studentIds : cls.studentIds,
      rescheduleFromDate,
      rescheduleFromTime,
      rescheduleToDate,
      rescheduleToTime,
      metadata,
      status,
    });

    res.status(201).json({ message: "Action created", action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post("/actions/extra-class", (req, res) => createAction(req, res, ACTION_TYPES.extraClass));
router.post("/actions/reschedule", (req, res) => createAction(req, res, ACTION_TYPES.reschedule));
router.post("/actions/surprise-test", (req, res) => createAction(req, res, ACTION_TYPES.surpriseTest));
router.post("/actions/extra-work", (req, res) => createAction(req, res, ACTION_TYPES.extraWork));

router.get("/actions", async (req, res) => {
  try {
    const { teacherId, classId, type, status } = req.query;
    const filter = {};

    if (teacherId) filter.teacherId = teacherId;
    if (classId) filter.classId = classId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const actions = await TeacherAction.find(filter)
      .sort({ createdAt: -1 })
      .populate("classId", "title subject grade section")
      .populate("studentIds", "name email grade")
      .lean();

    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/actions/:actionId", async (req, res) => {
  try {
    const updated = await TeacherAction.findByIdAndUpdate(req.params.actionId, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("classId", "title subject grade section")
      .populate("studentIds", "name email grade")
      .lean();

    if (!updated) return res.status(404).json({ error: "Action not found" });

    res.json({ message: "Action updated", action: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Teacher analytics ----------
router.get("/analytics/overview/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await TeacherClass.find({ teacherId, isActive: true }).lean();
    const classIds = classes.map((c) => c._id);
    const studentIdSet = new Set(classes.flatMap((c) => c.studentIds.map((id) => String(id))));
    const studentIds = Array.from(studentIdSet)
      .filter((id) => isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const [actions, attempts, submissions, students] = await Promise.all([
      TeacherAction.find({ teacherId }).lean(),
      studentIds.length ? QuizAttempt.find({ userId: { $in: studentIds } }).lean() : [],
      studentIds.length ? Submission.find({ userId: { $in: studentIds } }).lean() : [],
      studentIds.length ? User.find({ _id: { $in: studentIds } }, "name email grade school").lean() : [],
    ]);

    const completedActions = actions.filter((a) => a.status === "conducted" || a.status === "completed").length;
    const surpriseTests = actions.filter((a) => a.type === ACTION_TYPES.surpriseTest).length;
    const extraClasses = actions.filter((a) => a.type === ACTION_TYPES.extraClass).length;
    const reschedules = actions.filter((a) => a.type === ACTION_TYPES.reschedule).length;
    const extraWorks = actions.filter((a) => a.type === ACTION_TYPES.extraWork).length;

    const classManagedSubmissions = submissions.length;
    const pendingReviewCount = submissions.filter((s) => s.status === "pending").length;
    const reviewedCount = submissions.filter((s) => s.status === "reviewed").length;

    const avgScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
        : 0;

    res.json({
      teacherId,
      managedClasses: classes.length,
      managedStudents: students.length,
      completedActions,
      surpriseTests,
      extraClasses,
      reschedules,
      extraWorks,
      classManagedSubmissions,
      pendingReviewCount,
      reviewedCount,
      classAverageQuizPercentage: avgScore,
      classList: classes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/analytics/class/:classId", async (req, res) => {
  try {
    const { classId } = req.params;

    const cls = await TeacherClass.findById(classId)
      .populate("studentIds", "name email grade school")
      .lean();

    if (!cls) return res.status(404).json({ error: "Class not found" });

    const studentIdStrings = cls.studentIds.map((s) => normalizeObjectIdString(s._id || s));
    const studentObjectIds = studentIdStrings
      .filter((id) => isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const [attempts, submissions, actions] = await Promise.all([
      studentObjectIds.length ? QuizAttempt.find({ userId: { $in: studentObjectIds } }).lean() : [],
      studentObjectIds.length ? Submission.find({ userId: { $in: studentObjectIds } }).lean() : [],
      TeacherAction.find({ classId }).sort({ createdAt: -1 }).lean(),
    ]);

    const attemptsByStudent = new Map();
    attempts.forEach((a) => {
      const key = normalizeObjectIdString(a.userId);
      if (!attemptsByStudent.has(key)) attemptsByStudent.set(key, []);
      attemptsByStudent.get(key).push(a);
    });

    const submissionsByStudent = new Map();
    submissions.forEach((s) => {
      const key = normalizeObjectIdString(s.userId);
      if (!submissionsByStudent.has(key)) submissionsByStudent.set(key, []);
      submissionsByStudent.get(key).push(s);
    });

    const classStudents = cls.studentIds.map((student) => {
      const sid = normalizeObjectIdString(student._id);
      const studentAttempts = attemptsByStudent.get(sid) || [];
      const studentSubmissions = submissionsByStudent.get(sid) || [];
      const avgPercentage =
        studentAttempts.length > 0
          ? Math.round(
              studentAttempts.reduce((sum, item) => sum + (item.percentage || 0), 0) /
                studentAttempts.length
            )
          : 0;

      return {
        _id: sid,
        name: student.name,
        email: student.email,
        grade: student.grade,
        avgQuizPercentage: avgPercentage,
        totalAttempts: studentAttempts.length,
        pendingSubmissions: studentSubmissions.filter((item) => item.status === "pending").length,
        reviewedSubmissions: studentSubmissions.filter((item) => item.status === "reviewed").length,
      };
    });

    const classAverageQuizPercentage =
      classStudents.length > 0
        ? Math.round(
            classStudents.reduce((sum, s) => sum + (s.avgQuizPercentage || 0), 0) /
              classStudents.length
          )
        : 0;

    res.json({
      class: cls,
      classAverageQuizPercentage,
      studentCount: classStudents.length,
      students: classStudents,
      recentActions: actions.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/analytics/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId, teacherId } = req.query;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }

    const student = await User.findById(studentId, "name email grade school").lean();
    if (!student) return res.status(404).json({ error: "Student not found" });

    const filter = { userId: studentId };

    const teacherClassesFilter = {
      studentIds: studentId,
    };
    if (teacherId) {
      teacherClassesFilter.teacherId = teacherId;
    }

    const [attempts, submissions, teacherClasses] = await Promise.all([
      QuizAttempt.find(filter).sort({ attemptedAt: -1 }).lean(),
      Submission.find(filter).sort({ submittedAt: -1 }).lean(),
      TeacherClass.find(teacherClassesFilter).lean(),
    ]);

    const scopedClassIds = classId
      ? [classId]
      : teacherClasses.map((cls) => normalizeObjectIdString(cls._id));

    const actionFilter = {
      studentIds: studentId,
    };
    if (scopedClassIds.length) {
      actionFilter.classId = { $in: scopedClassIds };
    }

    const actions = scopedClassIds.length
      ? await TeacherAction.find(actionFilter)
          .sort({ createdAt: -1 })
          .populate("classId", "title subject grade section")
          .lean()
      : [];

    const subjectMap = {};
    attempts.forEach((attempt) => {
      if (!subjectMap[attempt.subject]) {
        subjectMap[attempt.subject] = { attempts: 0, total: 0 };
      }
      subjectMap[attempt.subject].attempts += 1;
      subjectMap[attempt.subject].total += attempt.percentage || 0;
    });

    const subjectPerformance = Object.entries(subjectMap).map(([subject, item]) => ({
      subject,
      avgPercentage: item.attempts > 0 ? Math.round(item.total / item.attempts) : 0,
      attempts: item.attempts,
    }));

    const overallAvg =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
        : 0;

    const latestQuizAttempt = attempts[0] || null;
    const latestReviewedSubmission = submissions.find((item) => item.status === "reviewed") || null;

    const assignmentActions = actions.filter((item) => item.type === ACTION_TYPES.extraWork);
    const completedAssignments = assignmentActions.filter(
      (item) => item.status === "completed" || item.status === "conducted"
    );
    const pendingAssignments = assignmentActions.filter(
      (item) => item.status !== "completed" && item.status !== "conducted"
    );

    const classMap = new Map();
    teacherClasses.forEach((cls) => {
      classMap.set(normalizeObjectIdString(cls._id), cls);
    });

    const formattedPendingAssignments = pendingAssignments.map((item) => {
      const cid = normalizeObjectIdString(item.classId?._id || item.classId);
      const cls = classMap.get(cid);
      return {
        _id: item._id,
        title: item.title,
        description: item.description,
        dueDate: item.dueDate,
        status: item.status,
        classId: cid,
        classTitle: cls?.title || item.classId?.title || "Class",
        subject: cls?.subject || item.classId?.subject || "",
        createdAt: item.createdAt,
      };
    });

    const classesAssigned = teacherClasses.map((cls) => ({
      _id: cls._id,
      title: cls.title,
      subject: cls.subject,
      grade: cls.grade,
      section: cls.section,
      room: cls.room,
      scheduleTime: cls.scheduleTime,
    }));

    res.json({
      student,
      overallQuizAverage: overallAvg,
      attemptsCount: attempts.length,
      pendingSubmissions: submissions.filter((item) => item.status === "pending").length,
      reviewedSubmissions: submissions.filter((item) => item.status === "reviewed").length,
      lastQuizExam: latestQuizAttempt
        ? {
            quizId: latestQuizAttempt.quizId,
            subject: latestQuizAttempt.subject,
            chapter: latestQuizAttempt.chapter,
            percentage: latestQuizAttempt.percentage,
            score: latestQuizAttempt.score,
            totalMarks: latestQuizAttempt.totalMarks,
            attemptedAt: latestQuizAttempt.attemptedAt,
          }
        : null,
      lastWrittenExam: latestReviewedSubmission
        ? {
            subject: latestReviewedSubmission.subject,
            chapter: latestReviewedSubmission.chapter,
            marks: latestReviewedSubmission.marks,
            totalMarks: latestReviewedSubmission.totalMarks,
            reviewedAt: latestReviewedSubmission.reviewedAt,
          }
        : null,
      latestAttempts: attempts.slice(0, 8),
      latestSubmissions: submissions.slice(0, 8),
      subjectPerformance,
      classesAssigned,
      homeworkSummary: {
        totalAssignments: assignmentActions.length,
        completedAssignments: completedAssignments.length,
        pendingAssignments: pendingAssignments.length,
      },
      pendingAssignments: formattedPendingAssignments,
      assignedActions: actions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
