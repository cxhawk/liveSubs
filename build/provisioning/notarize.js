const fs = require('fs');
const path = require('path');
var electron_notarize = require('@electron/notarize');

module.exports = async function (params) {
  // Only notarize the app on Mac OS only.
  if (process.platform !== 'darwin') {
    return;
  }
  console.log('afterSign hook triggered');

  // Same appId in electron-builder.
  let appId = 'com.maizesoft.livesubs'

  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      tool: "notarytool",
      appPath: appPath,
      appleId: "cxhawk@gmail.com",
      appleIdPassword: "@keychain:AC_PASSWORD", 
      teamId: "UD64FZRZ5H"
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};