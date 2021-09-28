module.exports = {
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				// options placed here will be merged with default configuration and passed to electron-builder
				"appId": "com.maizesoft.livesubs",
				"productName": "LiveSubs",
				"afterSign": "build/provisioning/notarize.js",
				mac: {
					"target": "dmg",
					"hardenedRuntime": true,
					"provisioningProfile": "build/provisioning/LiveSubsDevIDApp.provisionprofile",
					"entitlements": "build/provisioning/mac.entitlement",
				},
				linux: {
					target: {
						target: 'appimage',
						arch: ['armv7l']
					}
				}
			}
		}
	}
}