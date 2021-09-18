module.exports = {
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				// options placed here will be merged with default configuration and passed to electron-builder
				"appId": "com.maizesoft.livesubs",
				"productName": "LiveSubs",
				"afterSign": "provisioning/notarize.js",
				mac: {
					"hardenedRuntime": true,
					"provisioningProfile": "provisioning/LiveSubsDevIDApp.provisionprofile",
					"entitlements": "provisioning/mac.entitlement",
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