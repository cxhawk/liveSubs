const PIXI = require('pixi.js');

PIXI.settings.ROUND_PIXELS = true;
let app = new PIXI.Application({
	width: 1920, height: 1080, backgroundAlpha: 0, resolution: 1, resizeTo: window
});
let subtitle = new PIXI.Text();
let lowerThird = new PIXI.Container();
let lowerThirdHeader = new PIXI.Text();
let lowerThirdDescription = new PIXI.Text();
let lowerThirdTexture = null;
let lowerThirdBg1 = null, lowerThirdBg2 = null, lowerThirdBg3 = null;
let lowerThirdAnimating = false
let settings = {
	backgroundColor: "#009933",
	// subtitle settings
	fontFamily: "Noto Sans SC",
	fontSize: 50,
	fontWeight: "700",
	color: "#FFFFFF",
	strokeColor: "#000000",
	strokeSize: 2,
	addShadow: false,
	centerAlign: true,
	// lower third settings
	lowerThirdBg: "./images/lowerThird.png",
	lowerThirdTitleFontSize: 64,
	lowerThirdTitleColor: "#FFFFFF",
	lowerThirdTitleX: 30,
	lowerThirdTitleY: 8,
	lowerThirdDescriptionFontSize: 24,
	lowerThirdDescriptionColor: "#8D8F8E",
	lowerThirdDescriptionX: 30,
	lowerThirdDescriptionY: 105,
};

window.onload = function () {
	const { ipcRenderer } = window.require('electron');

	initPIXI();
	// mouse and key handler
	document.body.addEventListener('dblclick', () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
	}, true);
	window.onkeyup = e => {
		if (e.keyCode == 32 || e.key === " ") {
			ipcRenderer.send("nextSubtitle");
		}
	}
	// events from electron
	ipcRenderer.on("showLowerThird", (event, arg) => {
		if (arg && arg.title) {
			console.log("showLowerThird");
			lowerThirdHeader.text = arg.title;
			if (arg.description) {
				lowerThirdDescription.text = arg.description;
			}
			lowerThird.visible = true;
			lowerThirdAnimating = true;
			layout();
		} else {
			console.log("hide showLowerThird");
			lowerThird.visible = false;
		}
	});
	ipcRenderer.on("showSubtitle", (event, arg) => {
		if (arg) {
			subtitle.text = arg.text;
		} else {
			subtitle.text = "";
		}
	});
	ipcRenderer.on("updateSettings", (event, arg) => {
		settings = arg;
		subtitle.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: arg.fontSize,
			fontWeight: arg.fontWeight,
			stroke: arg.strokeColor,
			strokeThickness: arg.strokeSize,
			dropShadow: arg.addShadow,
			dropShadowColor: arg.strokeColor,
			dropShadowDistance: arg.strokeSize,
			fill: arg.color,
		};
		lowerThirdHeader.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: arg.lowerThirdTitleFontSize,
			fontWeight: 700,
			fill: arg.lowerThirdTitleFontColor, 
		};
		lowerThirdDescription.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: arg.lowerThirdDescriptionFontSize,
			fontWeight: 300,
			fill: arg.lowerThirdDescriptionColor,
		}
		layout();
	});
}

function initPIXI() {
	const textStyle = new PIXI.TextStyle({
		fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', fontSize: 40, fill: '0xFFFFFF', align: 'center'
	});
	app.stage.addChild(subtitle);
	app.ticker.add((elapsedMS) => {
		if (lowerThirdAnimating) {

		}
	});
	
	PIXI.Texture.fromURL(settings.lowerThirdBg).then((bgTexture) => {
		lowerThirdTexture = bgTexture;
		const oneThirdOfWidth = Math.floor(bgTexture.width / 3);
		const texture1 = bgTexture.clone();
		texture1.frame = new PIXI.Rectangle(0, 0, oneThirdOfWidth, bgTexture.height);
		lowerThirdBg1 = new PIXI.Sprite(texture1);
		lowerThird.addChild(lowerThirdBg1);

		const texture2 = bgTexture.clone();
		texture2.frame = new PIXI.Rectangle(texture1.width, 0, 10, bgTexture.height);
		lowerThirdBg2 = new PIXI.TilingSprite(texture2, 300, bgTexture.height);
		lowerThird.addChild(lowerThirdBg2);

		const texture3 = bgTexture.clone();
		texture3.frame = new PIXI.Rectangle(bgTexture.width - (oneThirdOfWidth * 2), 0, oneThirdOfWidth, bgTexture.height);
		lowerThirdBg3 = new PIXI.Sprite(texture3);
		lowerThird.addChild(lowerThirdBg3);

		lowerThirdHeader.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: 64,
			fontWeight: 700,
			fill: "white", 
		};
		lowerThirdDescription.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: 24,
			fontWeight: 300,
			fill: "#8D8F8E",
		}

		layout();

		lowerThird.addChild(lowerThirdHeader);
		lowerThird.addChild(lowerThirdDescription);
		app.stage.addChild(lowerThird);

		document.body.appendChild(app.view);
	});
}

function layout() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	subtitle.y = Math.round(h * 0.9);
	if (settings.centerAlign) {
		subtitle.x = w / 2;
		subtitle.anchor.x = 0.5;
	} else {
		subtitle.x = 20;
		subtitle.anchor.x = 0;
	}

	if (lowerThirdBg1) {
		const metricsHeader = PIXI.TextMetrics.measureText(lowerThirdHeader.text, lowerThirdHeader.style);
		const metricsDescription = PIXI.TextMetrics.measureText(lowerThirdDescription.text, lowerThirdDescription.style);
		lowerThirdBg1.x = 0;
		lowerThirdBg2.x = lowerThirdBg1.width;
		lowerThirdBg2.width = Math.max(metricsHeader.width, metricsDescription.width) + lowerThirdHeader.x + 20 - lowerThirdBg1.width - lowerThirdBg3.width;
		lowerThirdBg3.x = lowerThirdBg1.width + lowerThirdBg2.width;

		lowerThirdHeader.x = settings.lowerThirdTitleX;
		lowerThirdHeader.y = settings.lowerThirdTitleY;
		lowerThirdDescription.x = settings.lowerThirdDescriptionX;
		lowerThirdDescription.y = settings.lowerThirdDescriptionY;
		lowerThird.x = 20;
		lowerThird.y = h - (lowerThirdTexture.height + 30);
	}
}

window.onresize = layout;