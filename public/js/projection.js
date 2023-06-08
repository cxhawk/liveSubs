const path = require('path');
const currentPath = path.resolve(__dirname, '..', '..', 'app.asar', 'js');
//console.log(currentPath);
module.paths.push(currentPath);

const FontFaceObserver = require('fontfaceobserver');
import * as PIXI from './pixi.js';

let app = new PIXI.Application({
	width: 1920, height: 1080, backgroundAlpha: 0, autoDensity: true, resolution: 1, resizeTo: window
});
let subtitle = new PIXI.Text();
let lowerThird = new PIXI.Container();
let lowerThirdHeader = new PIXI.Text();
let lowerThirdDescription = new PIXI.Text();
let lowerThirdTexture = null;
let lowerThirdBg = null, lowerThirdBg1 = null, lowerThirdBg2 = null, lowerThirdBg3 = null;
let lowerThirdAnimation = {animating: false, startTime: 0};
let imageContainer = new PIXI.Container();
let imageTexture = null;

const fontList = "Alibaba PuHuiTi 2.0";
let settings = {
	backgroundColor: "#009933",
	// subtitle settings
	fontFamily: fontList,
	fontSize: 50,
	fontWeight: "700",
	color: "#FFFFFF",
	strokeColor: "#000000",
	strokeSize: 2,
	addShadow: false,
	subtitleAlign: "bottomCenter",
	// image settings
	imageAlign: "bottomLeft",
	imageMaxSize: 0.5,
	imageLoop: false,
	imageMargin: 50,
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
			updateLowerThird();
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
	ipcRenderer.on("showImage", (event, arg) => {
		if (arg && arg.item) {
			const url = arg.item.image;
			imageContainer.removeChildren();
			PIXI.Texture.fromURL(url).then(bgTexture => {
				imageTexture = bgTexture;
				let imageSprite = new PIXI.Sprite(bgTexture);
				imageSprite.name = "image";
				if (isVideo(url)) {
					const videoControler = imageTexture.baseTexture.resource.source;
					videoControler.loop = settings.imageLoop;
					videoControler.currentTime = 0;
					videoControler.play();
				}
				imageContainer.addChild(imageSprite);
				layout();
			}).catch(error => {
				console.warn(error);
			});
		} else {
			imageContainer.removeChildren();
		}
	});
	ipcRenderer.on("updateSettings", (event, arg) => {
		settings = arg;
		const fontLoader = new FontFaceObserver(fontList, {weight: arg.fontWeight});
		fontLoader.load().then(() => {

		}).catch(() => {
			console.log("unable to load font: " + fontList);
		}).finally(() => {
			subtitle.style = {
				fontFamily: fontList, 
				fontSize: arg.fontSize,
				fontWeight: arg.fontWeight,
				stroke: arg.strokeColor,
				strokeThickness: arg.strokeSize,
				dropShadow: arg.addShadow,
				dropShadowColor: arg.strokeColor,
				dropShadowDistance: arg.strokeSize,
				fill: arg.color,
				align: "center",
				breakWords: true,
			};
			updateLowerThird();
		});
	});
}

function initPIXI() {
	app.stage.addChild(imageContainer);
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

// update lower third background texture and font style
function updateLowerThird() {
	const currentTemplate = settings.templates[currentLowerThirdTemplateId];

	if (currentTemplate) {
		const fontLoader1 = new FontFaceObserver(fontList, {weight: 700});
		const fontLoader2 = new FontFaceObserver(fontList, {weight: 300});
		Promise.all([fontLoader1.load(), fontLoader2.load()]).finally(() => {
			lowerThirdHeader.style = {
				fontFamily: fontList, 
				fontSize: currentTemplate.lowerThirdTitleFontSize,
				fontWeight: 700,
				fill: currentTemplate.lowerThirdTitleColor, 
			};
			lowerThirdDescription.style = {
				fontFamily: fontList, 
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
		});
	} else {
		layout();
	}
}

function layout() {
	const currentTemplate = settings.templates[currentLowerThirdTemplateId];
	const w = window.innerWidth;
	const h = window.innerHeight;
	let margin = 50;

	subtitle.anchor.y = 0;
	subtitle.anchor.x = 0;
	subtitle.style.wordWrapWidth = w - margin;
	if (settings.subtitleAlign == "bottomCenter") {
		subtitle.x = w / 2;
		subtitle.y = h - margin - settings.fontSize;
		subtitle.anchor.x = 0.5;
		subtitle.anchor.y = 0.5;
		subtitle.style.wordWrap = true;
	} else if (settings.subtitleAlign == "bottomLeft") {
		subtitle.x = margin;
		subtitle.y = h - margin - settings.fontSize;
		subtitle.anchor.y = 0.5;
		subtitle.style.wordWrap = false;
	} else if (settings.subtitleAlign == "center") {
		subtitle.x = w / 2;
		subtitle.anchor.x = 0.5;
		subtitle.anchor.y = 0.5;
		subtitle.y = h / 2;
		subtitle.style.wordWrap = true;
	} else if (settings.subtitleAlign == "topLeft") {
		subtitle.x = margin;
		subtitle.y = margin;
		subtitle.style.wordWrap = false;
	} else if (settings.subtitleAlign == "topCenter") {
		subtitle.x = w / 2;
		subtitle.anchor.x = 0.5;
		subtitle.y = margin;
		subtitle.style.wordWrap = true;
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
			lowerThird.x = margin;
		}
		
		lowerThird.y = h - (lowerThirdTexture.height + margin);
	}

	if (imageContainer && imageTexture) {
		margin = settings.imageMargin;
		const imageAspectRatio = imageTexture.width / imageTexture.height;
		if (imageAspectRatio > w / h && imageTexture.width > w * settings.imageMaxSize) {
			imageContainer.width = w * settings.imageMaxSize;
			imageContainer.height = imageContainer.width / imageAspectRatio;
		} else if (imageTexture.height > h * settings.imageMaxSize) {
			imageContainer.height = h * settings.imageMaxSize;
			imageContainer.width = imageContainer.height * imageAspectRatio;
		}

		imageContainer.x = margin;
		imageContainer.y = h - imageContainer.height - margin;

		if (settings.imageAlign == "bottomRight") {
			imageContainer.x = w - imageContainer.width - margin;
		} else if (settings.imageAlign == "topLeft") {
			imageContainer.y = margin;
		} else if (settings.imageAlign == "topRight") {
			imageContainer.y = margin;
			imageContainer.x = w - imageContainer.width - margin;
		} else if (settings.imageAlign == "center") {
			imageContainer.x = (w - imageContainer.width) / 2;
			imageContainer.y = (h - imageContainer.height) / 2;
		} else if (settings.imageAlign == "topCenter") {
			imageContainer.x = (w - imageContainer.width) / 2;
			imageContainer.y = margin;
		} else if (settings.imageAlign == "bottomCenter") {
			imageContainer.x = (w - imageContainer.width) / 2;
		} 
		
	}
}

function isVideo(url) {
	const extension = url.split('.').pop().toLowerCase();
  return extension == 'webm' || extension == 'mp4';
}

window.onresize = layout;