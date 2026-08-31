'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { promisify } = require('node:util');

const { createMockIamServer } = require('./mock-iam-server');

const execFileAsync = promisify(execFile);

let mockServer;
let baseUrl;

test.before(async function () {
  mockServer = createMockIamServer();
  const serverInfo = await mockServer.start();
  baseUrl = serverInfo.baseUrl;
});

test.after(async function () {
  await mockServer.stop();
});

test('register script provisions or rotates a AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM managed client and updates env.local-compatible values', async function () {
  const scriptPath = path.resolve(__dirname, '../scripts/register-automatedrecognitionandattendancesystem-iam-client.js');
  const tempEnvFile = path.join(os.tmpdir(), `automatedrecognitionandattendancesystem-register-${Date.now()}.env`);

  fs.writeFileSync(tempEnvFile, [
    'PROJECT_CODE=automatedrecognitionandattendancesystem',
    'PROJECT_NAME=AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM',
    'PROJECT_ENV=local',
    'PROJECT_BASE_URL=http://127.0.0.1:8212',
    `IAM_SDK_BASE_URL=${baseUrl}`,
    'IAM_SDK_CLIENT_ID=sample-sdk',
    'IAM_SDK_CLIENT_SECRET=super-secret',
    'IAM_SDK_AUDIENCE=automatedrecognitionandattendancesystem-api',
    'IAM_SDK_ADMIN_AUDIENCE=iam-admin-api',
    'IAM_SDK_SCOPE=iam.security.read iam.security.write iam.audit.read iam.accounts.read',
    'PROJECT_PERMISSION_ACCOUNT_EMAIL=ops@example.com',
    'PROJECT_IAM_APPLICATION_ID=automated-recognition-and-attendance-system-gateway',
    'PROJECT_IAM_APP_ID=automated-recognition-and-attendance-system-sdk',
    'PROJECT_IAM_MANAGED_CLIENT_ID=automated-recognition-and-attendance-system-gateway-local',
    'PROJECT_IAM_MANAGED_CLIENT_NAME=AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM Gateway Local',
    'PROJECT_IAM_MANAGED_CLIENT_ENDPOINT=http://127.0.0.1:8212',
    'PROJECT_IAM_MANAGED_CLIENT_OWNER_EMAIL=ops@example.com',
    'PROJECT_IAM_MANAGED_CLIENT_PARTNER_ID=automated-recognition-and-attendance-system-team',
    'PROJECT_IAM_MANAGED_CLIENT_TENANT=iam-shared',
    'PROJECT_IAM_MANAGED_CLIENT_ALLOWED_SCOPES=automatedrecognitionandattendancesystem.read automatedrecognitionandattendancesystem.write',
    'PROJECT_IAM_MANAGED_CLIENT_ALLOWED_AUDIENCES=automatedrecognitionandattendancesystem-api'
  ].join('\n') + '\n', 'utf8');

  const execution = await execFileAsync(process.execPath, ['-r', 'dotenv/config', scriptPath, `dotenv_config_path=${tempEnvFile}`], {
    cwd: path.resolve(__dirname, '..'),
    env: Object.assign({}, process.env, {
      DOTENV_CONFIG_PATH: tempEnvFile
    })
  });

  const payload = JSON.parse(execution.stdout);
  const updatedEnv = fs.readFileSync(tempEnvFile, 'utf8');

  assert.equal(payload.ok, true);
  assert.equal(payload.permissionAccount.email, 'ops@example.com');
  assert.equal(payload.managedClient.clientId, 'automated-recognition-and-attendance-system-gateway-local');
  assert.equal(payload.managedClient.audience, 'automatedrecognitionandattendancesystem-api');
  assert.equal(payload.managedClient.scope, 'automatedrecognitionandattendancesystem.read automatedrecognitionandattendancesystem.write');
  assert.match(updatedEnv, /^PROJECT_IAM_MANAGED_CLIENT_RECORD_ID=.+$/m);
  assert.match(updatedEnv, /^PROJECT_IAM_MANAGED_CLIENT_SECRET=.+$/m);
  assert.match(updatedEnv, /^PROJECT_PERMISSION_ACCOUNT_ID=acc-2$/m);
  assert.match(updatedEnv, /^PROJECT_INIT_ADMIN_EMAILS=ops@example.com$/m);
});

test('register script refuses to update a different managed client record with a reused application identity', async function () {
  const scriptPath = path.resolve(__dirname, '../scripts/register-automatedrecognitionandattendancesystem-iam-client.js');
  const tempEnvFile = path.join(os.tmpdir(), `automatedrecognitionandattendancesystem-register-collision-${Date.now()}.env`);

  fs.writeFileSync(tempEnvFile, [
    'PROJECT_CODE=automatedrecognitionandattendancesystem',
    'PROJECT_NAME=AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM',
    'PROJECT_ENV=preprod',
    'PROJECT_BASE_URL=https://automatedrecognitionandattendancesystem-preprod.example.com',
    `IAM_SDK_BASE_URL=${baseUrl}`,
    'IAM_SDK_CLIENT_ID=sample-sdk',
    'IAM_SDK_CLIENT_SECRET=super-secret',
    'IAM_SDK_AUDIENCE=automatedrecognitionandattendancesystem-api',
    'IAM_SDK_ADMIN_AUDIENCE=iam-admin-api',
    'IAM_SDK_SCOPE=iam.security.read iam.security.write iam.audit.read iam.accounts.read',
    'PROJECT_PERMISSION_ACCOUNT_EMAIL=ops@example.com',
    'PROJECT_IAM_APPLICATION_ID=sample-seed-client',
    'PROJECT_IAM_APP_ID=SAMPLE',
    'PROJECT_IAM_MANAGED_CLIENT_ID=automated-recognition-and-attendance-system-gateway-preprod',
    'PROJECT_IAM_MANAGED_CLIENT_NAME=AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM Gateway Preprod',
    'PROJECT_IAM_MANAGED_CLIENT_ENDPOINT=https://automatedrecognitionandattendancesystem-preprod.example.com',
    'PROJECT_IAM_MANAGED_CLIENT_OWNER_EMAIL=ops@example.com',
    'PROJECT_IAM_MANAGED_CLIENT_PARTNER_ID=automated-recognition-and-attendance-system-team',
    'PROJECT_IAM_MANAGED_CLIENT_TENANT=iam-shared',
    'PROJECT_IAM_MANAGED_CLIENT_ALLOWED_SCOPES=automatedrecognitionandattendancesystem.read automatedrecognitionandattendancesystem.write',
    'PROJECT_IAM_MANAGED_CLIENT_ALLOWED_AUDIENCES=automatedrecognitionandattendancesystem-api'
  ].join('\n') + '\n', 'utf8');

  await assert.rejects(
    execFileAsync(process.execPath, ['-r', 'dotenv/config', scriptPath, `dotenv_config_path=${tempEnvFile}`], {
      cwd: path.resolve(__dirname, '..'),
      env: Object.assign({}, process.env, {
        DOTENV_CONFIG_PATH: tempEnvFile
      })
    }),
    function (error) {
      return error && /environment clientId automated-recognition-and-attendance-system-gateway-preprod/.test(error.stderr || '');
    }
  );
});
