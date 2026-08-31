'use strict';

const { createProjectIamService } = require('../iam/project-iam-service');
const { normalizeAudience, normalizeScope } = require('../iam/iam-sdk-adapter');

const DEFAULT_AUTOMATED_RECOGNITION_AND_ATTENDANCE_SYSTEM_SCOPES = [
  'automated.recognition.and.attendance.system.registry.read',
  'automated.recognition.and.attendance.system.registry.write',
  'automated.recognition.and.attendance.system.report.read',
  'iam.security.read',
  'iam.security.write',
  'iam.audit.read',
  'iam.accounts.read'
];

function applyAUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEMDefaults(payload) {
  const source = payload || {};
  const metadata = Object.assign({}, source.metadata || {});

  const targetSystem = String(source.targetSystem || metadata.targetSystem || 'automatedrecognitionandattendancesystem').trim();
  const ownerEmail = String(source.ownerEmail || metadata.ownerEmail || 'automated-recognition-and-attendance-system.integration@example.com').trim();
  const partnerId = String(source.partnerId || metadata.partnerId || 'automated-recognition-and-attendance-system-team').trim();
  const tenant = String(source.tenant || metadata.tenant || 'iam-shared').trim();
  const systemCode = source.systemCode || metadata.systemCode || null;

  return Object.assign({}, source, {
    targetSystem: targetSystem,
    ownerEmail: ownerEmail,
    partnerId: partnerId,
    tenant: tenant,
    allowedScopes: normalizeScope(source.allowedScopes || metadata.allowedScopes || DEFAULT_AUTOMATED_RECOGNITION_AND_ATTENDANCE_SYSTEM_SCOPES),
    allowedAudiences: normalizeAudience(source.allowedAudiences || metadata.allowedAudiences || 'automatedrecognitionandattendancesystem-api'),
    metadata: Object.assign({}, metadata, systemCode ? {
      systemCode: String(systemCode).trim()
    } : {}, {
      targetSystem: targetSystem,
      ownerEmail: ownerEmail,
      partnerId: partnerId,
      tenant: tenant
    })
  });
}

function createAUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEMIamService(config) {
  const projectIamService = createProjectIamService(config);

  return Object.assign({}, projectIamService, {
    async registerManagedClient(payload, options) {
      return projectIamService.registerManagedClient(applyAUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEMDefaults(payload), options || {});
    },
    async updateManagedClient(payload, options) {
      return projectIamService.updateManagedClient(applyAUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEMDefaults(payload), options || {});
    }
  });
}

module.exports = {
  createAUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEMIamService: createAUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEMIamService
};
