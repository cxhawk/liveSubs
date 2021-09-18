module.exports = {
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				// options placed here will be merged with default configuration and passed to electron-builder
				"appId": "com.maizesoft.livesubs",
				"productName": "LiveSubs",
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