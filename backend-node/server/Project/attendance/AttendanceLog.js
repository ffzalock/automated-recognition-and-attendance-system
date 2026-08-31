'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceLogSchema = new Schema({
  studentId: { type: String, required: true, trim: true, index: true },
  studentName: { type: String, default: '' },
  cameraName: { type: String, default: '' },
  school: { type: String, default: '' },
  program: { type: String, default: '' },
  section: { type: String, default: '' },
  checkedInAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceLog', AttendanceLogSchema, 'AttendanceLog');
