'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentFaceSchema = new Schema({
  studentId: { type: String, required: true, trim: true, index: true },
  studentName: { type: String, default: '' },
  school: { type: String, default: '' },
  program: { type: String, default: '' },
  section: { type: String, default: '' },
  faceFeatures: { type: Schema.Types.Mixed, default: null },
  faceImages: {
    front: { type: String, default: null },
    left: { type: String, default: null },
    right: { type: String, default: null },
    tilted: { type: String, default: null }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentFace', StudentFaceSchema, 'StudentFace');
