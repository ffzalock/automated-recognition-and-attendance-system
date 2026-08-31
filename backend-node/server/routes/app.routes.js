const accountRoutes = require("../Project/accounts/accounts.routes");
const automatedrecognitionandattendancesystemRoutes = require("../Project/automatedrecognitionandattendancesystem/automatedrecognitionandattendancesystem.routes");
const securityRoutes = require("../Project/security/security.routes");
const settingsRoutes = require("../Project/settings/settings.routes");
const cctvRoutes = require("../Project/cctv/cctv.routes");
const attendanceRoutes = require("../Project/attendance/attendance.routes");

module.exports = function (app) {
  const path = "/api/v1";

  app.use(path + '/automatedrecognitionandattendancesystem', automatedrecognitionandattendancesystemRoutes);
  app.use(path + '/setting', settingsRoutes);
  app.use(path + '/security', securityRoutes);
  app.use(path + '/cctv', cctvRoutes);
  app.use(path + '/attendance', attendanceRoutes);
  app.use(path, accountRoutes);
};
