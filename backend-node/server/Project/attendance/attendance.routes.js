'use strict';

const express = require('express');
const router = express.Router();

const Account = require('../accounts/service/account');
const StudentFace = require('./StudentFace');
const AttendanceLog = require('./AttendanceLog');

// Security & Authentication Bypass middleware
const checkCctvSecret = (request, response, next) => {
  const secret = request.headers['x-cctv-secret'];
  const internalSecret = process.env.CCTV_INTERNAL_SECRET || 'cctv-default-secret-key-2026';
  if (secret && secret === internalSecret) {
    // CCTV bypass, authorized
    return next();
  }
  // Otherwise fall back to IAM check
  return Account.onCheckAuthorization(request, response, next);
};

// Check-in API (CCTV real-time attendance dispatcher)
router.post('/checkin', checkCctvSecret, async function (request, response) {
  try {
    const studentId = request.body && request.body.studentId ? String(request.body.studentId).trim() : '';
    const cameraName = request.body && request.body.cameraName ? String(request.body.cameraName).trim() : 'Unknown CCTV';

    if (!studentId) {
      return response.status(400).json({ success: false, message: 'studentId is required' });
    }

    // Load student to verify name
    const student = await StudentFace.findOne({ studentId });
    const studentName = student ? student.studentName : 'Unknown Student';
    const school = student ? student.school : '';
    const program = student ? student.program : '';
    const section = student ? student.section : '';

    console.log(`[CCTV Check-in] Student ID: ${studentId} (${studentName}) checked in from ${cameraName}`);

    // Store checkin log/history in MongoDB
    const logEntry = await AttendanceLog.create({
      studentId,
      studentName,
      cameraName,
      school,
      program,
      section,
      checkedInAt: new Date()
    });

    return response.status(200).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: logEntry
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: error && error.message ? error.message : 'Failed to record check-in'
    });
  }
});

// Face Template Syncing API for CCTV Python
router.get('/faces-sync', checkCctvSecret, async function (request, response) {
  try {
    // Get all student faces having any faceImages
    const faces = await StudentFace.find({
      $or: [
        { 'faceImages.front': { $ne: null } },
        { 'faceImages.left': { $ne: null } },
        { 'faceImages.right': { $ne: null } },
        { 'faceImages.tilted': { $ne: null } }
      ]
    }).lean();

    return response.status(200).json({ success: true, faces });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: error && error.message ? error.message : 'Failed to load student faces for sync'
    });
  }
});

// Fetch recent check-in history
router.get('/history', checkCctvSecret, async function (request, response) {
  try {
    const limit = parseInt(request.query.limit, 10) || 20;
    const history = await AttendanceLog.find()
      .sort({ checkedInAt: -1 })
      .limit(limit)
      .lean();
    
    return response.status(200).json({ success: true, history });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: error && error.message ? error.message : 'Failed to load check-in history'
    });
  }
});

// Standard register (needs full IAM login)
router.post('/register', Account.onCheckAuthorization, async function (request, response) {
  try {
    const studentId = request.body && request.body.studentId ? String(request.body.studentId).trim() : '';
    const studentName = request.body && request.body.studentName ? String(request.body.studentName).trim() : '';
    const school = request.body && request.body.school ? String(request.body.school).trim() : '';
    const program = request.body && request.body.program ? String(request.body.program).trim() : '';
    const section = request.body && request.body.section ? String(request.body.section).trim() : '';
    const faceFeatures = request.body && request.body.faceFeatures !== undefined
      ? request.body.faceFeatures
      : null;
    const imageBase64 = request.body && request.body.imageBase64 ? String(request.body.imageBase64).trim() : null;
    const faceImages = request.body && request.body.faceImages && typeof request.body.faceImages === 'object'
      ? request.body.faceImages
      : null;

    if (!studentId) {
      return response.status(400).json({ success: false, message: 'studentId is required' });
    }

    const payload = { studentId, studentName, school, program, section }
    if (faceFeatures !== null && faceFeatures !== undefined) {
      payload.faceFeatures = faceFeatures
    } else if (imageBase64) {
      payload.faceFeatures = imageBase64
    } else {
      payload.faceFeatures = null
    }

    if (faceImages) {
      payload.faceImages = {
        front: faceImages.front ? String(faceImages.front).trim() : null,
        left: faceImages.left ? String(faceImages.left).trim() : null,
        right: faceImages.right ? String(faceImages.right).trim() : null,
        tilted: faceImages.tilted ? String(faceImages.tilted).trim() : null
      }
    }

    const studentFace = await StudentFace.findOneAndUpdate(
      { studentId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return response.status(200).json({ success: true, studentFace });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: error && error.message ? error.message : 'Failed to save student face'
    });
  }
});

router.get('/faces', Account.onCheckAuthorization, async function (request, response) {
  try {
    const faces = await StudentFace.find({ faceFeatures: { $ne: null } }).lean();
    return response.status(200).json({ success: true, faces });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      message: error && error.message ? error.message : 'Failed to load student faces'
    });
  }
});

module.exports = router;
