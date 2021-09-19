let app = new PIXI.Application({
	width: 1920, height: 1080, backgroundAlpha: 0, resolution: 1, resizeTo: window
});
let subtitle = new PIXI.Text();
let lowerThird = new PIXI.Container();
let lowerThirdHeader = new PIXI.Text();
let lowerThirdDescription = new PIXI.Text();
let lowerThirdTexture = null;
let lowerThirdBg = null, lowerThirdBg1 = null, lowerThirdBg2 = null, lowerThirdBg3 = null;
let lowerThirdAnimation = {animating: false, startTime: 0};
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
	templates: {}
};
let currentLowerThirdTemplateId = null;

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
		if (arg && arg.templateId) {
			console.log("showLowerThird");
			console.log(arg);
			currentLowerThirdTemplateId = arg.templateId;
			lowerThirdHeader.text = arg.item.title;
			lowerThirdDescription.text = arg.item.description;
			lowerThird.visible = true;
			lowerThird.alpha = 0;
			lowerThirdAnimation.animating = true;
			lowerThirdAnimation.startTime = performance.now();
			update();
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
		console.log(settings);
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
		update();
	});
}

function initPIXI() {
	app.stage.addChild(subtitle);
	app.ticker.add(() => {
		if (lowerThirdAnimation.animating) {
			const elapsedTime = performance.now() - lowerThirdAnimation.startTime;
			lowerThird.alpha = elapsedTime / 1000;
			if (lowerThird.alpha >= 1) {
				lowerThird.alpha = 1;
				lowerThirdAnimation.animating = false;
			}
		}
	});

	lowerThird.addChild(lowerThirdHeader);
	lowerThird.addChild(lowerThirdDescription);
	app.stage.addChild(lowerThird);
	document.body.appendChild(app.view);
}

function update() {
	const currentTemplate = settings.templates[currentLowerThirdTemplateId];

	if (currentTemplate) {
		lowerThirdHeader.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: currentTemplate.lowerThirdTitleFontSize,
			fontWeight: 700,
			fill: currentTemplate.lowerThirdTitleColor, 
		};
		lowerThirdDescription.style = {
			fontFamily: '"Noto Sans", "Noto Sans SC", sans-serif', 
			fontSize: currentTemplate.lowerThirdDescriptionFontSize,
			fontWeight: 300,
			fill: currentTemplate.lowerThirdDescriptionColor,
		};
		PIXI.Texture.fromURL(currentTemplate.lowerThirdBg).then(bgTexture => {
			lowerThird.removeChildren();
			lowerThirdTexture = bgTexture;
			const oneThirdOfWidth = Math.floor(bgTexture.width / 3);
			
			lowerThirdBg = new PIXI.Sprite(bgTexture);
			const texture1 = bgTexture.clone();
			texture1.frame = new PIXI.Rectangle(0, 0, oneThirdOfWidth, bgTexture.height);
			lowerThirdBg1 = new PIXI.Sprite(texture1);
			
			lowerThird.addChild(lowerThirdBg);
			lowerThird.addChild(lowerThirdBg1);
	
			const texture2 = bgTexture.clone();
			texture2.frame = new PIXI.Rectangle(oneThirdOfWidth, 0, 10, bgTexture.height);
			lowerThirdBg2 = new PIXI.TilingSprite(texture2, 300, bgTexture.height);
			lowerThird.addChild(lowerThirdBg2);
	
			const texture3 = bgTexture.clone();
			texture3.frame = new PIXI.Rectangle(bgTexture.width - (oneThirdOfWidth * 2), 0, oneThirdOfWidth, bgTexture.height);
			lowerThirdBg3 = new PIXI.Sprite(texture3);
			lowerThird.addChild(lowerThirdBg3);
	
			lowerThird.addChild(lowerThirdHeader);
			lowerThird.addChild(lowerThirdDescription);
	
			layout();
		}).catch(error => {
			console.warn(error);
			layout();
		});
	} else {
		layout();
	}
}

function layout() {
	const currentTemplate = settings.templates[currentLowerThirdTemplateId];
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

	if (lowerThirdBg1 && currentTemplate) {
		lowerThirdHeader.x = currentTemplate.lowerThirdTitleX;
		lowerThirdHeader.y = currentTemplate.lowerThirdTitleY;
		lowerThirdDescription.x = currentTemplate.lowerThirdDescriptionX;
		lowerThirdDescription.y = currentTemplate.lowerThirdDescriptionY;
		lowerThirdHeader.anchor.x = currentTemplate.lowerThirdTitleCenter ? 0.5: 0;
		lowerThirdDescription.anchor.x = currentTemplate.lowerThirdDescriptionCenter ? 0.5: 0;

		const metricsHeader = PIXI.TextMetrics.measureText(lowerThirdHeader.text, lowerThirdHeader.style);
		const metricsDescription = PIXI.TextMetrics.measureText(lowerThirdDescription.text, lowerThirdDescription.style);
		lowerThirdBg1.x = 0;
		lowerThirdBg2.x = lowerThirdBg1.width;
		let middleWidth = Math.max(metricsHeader.width, metricsDescription.width) + lowerThirdHeader.x + 20 - lowerThirdBg1.width - lowerThirdBg3.width;
		if (middleWidth < 0) {
			middleWidth = 0;
		}
		lowerThirdBg2.width = middleWidth;
		lowerThirdBg3.x = lowerThirdBg1.width + lowerThirdBg2.width;
		
		lowerThirdBg.x = 0;
		lowerThirdBg.visible = !currentTemplate.lowerThirdResize;
		lowerThirdBg1.visible = currentTemplate.lowerThirdResize;
		lowerThirdBg2.visible = currentTemplate.lowerThirdResize;
		lowerThirdBg3.visible = currentTemplate.lowerThirdResize;
		
		if (currentTemplate.lowerThirdCenter) {
			lowerThird.x = (w - lowerThird.width) / 2;
		} else {
			lowerThird.x = 50;
		}
		
		lowerThird.y = h - (lowerThirdTexture.height + 50);
	}
}

window.onresize = layout;