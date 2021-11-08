# Live Subtitles and Lower Third

Wanna add subtitles and lower third easily in your live stream? This tool is great to be used with a video switcher like the ATEM Minis. Make sure this source is configured to be chroma keyed with the background color in settings.

## Features
- Import subtitles by lines in a batch and go through them one by one
- Design multiple lower third templates with background image and text format.
- Use keyboard shortcut keys to control the display content.
- Available on macOS, Windows and Raspbian.

## Tutorial
1. Launch app on your computer and then press Ctrl/Command + O to open the projection window (green screen)
2. If you have a second display with FHD resolution it should automatically went fullscreen on it. If not, you have to drag the projection window on to the target area and then double click the content area to go fullscreen. 
3. To show subtitles: in the main window, click on the + button in the subtitle section to add an episode (song/program/piece).
4. To show lower third, click on the + button in the lower third section to add an template. It will give you a default look, but you can customize it in the settings in it.
5. Click on an item in the table to show it, press Ctrl/Command + 1 or 2 to clear lower third or subtitles. If you want to temporarily hide everything, you can press Ctrl/Command + 0 to toggle the mute state.

## Screenshots

Create and design multiple lower third template
<img width="1136" alt="Screen Shot 2021-09-19 at 4 02 46 PM" src="https://user-images.githubusercontent.com/14524765/133945727-2f82b4d8-8363-4694-930f-50eac09ca27d.png">


Import subtitle lines in a batch and show them one by one by pressing the space bar
<img width="1136" alt="Screen Shot 2021-09-19 at 4 03 35 PM" src="https://user-images.githubusercontent.com/14524765/133945744-b81d132f-bf54-449e-9d75-276b3b59d6c0.png">


subtitle on projection window
<img width="2048" alt="Screen Shot 2021-09-17 at 3 04 57 PM" src="https://user-images.githubusercontent.com/14524765/133858578-d05cd3f0-98b7-41bd-b8da-e0263132f38b.png">

default lower third on projection window
<img width="2048" alt="Screen Shot 2021-09-17 at 3 05 15 PM" src="https://user-images.githubusercontent.com/14524765/133858584-5293eb18-251a-48b0-8139-6a3eba07430c.png">

## Compile from sources
This project is based on Electron + ElementUI + PIXI. Make sure you have nodejs v14 installed and then run:
```
npm install
```
Compiles and hot-reloads for development
```
npm run electron:serve
```
Compiles for production
```
npm run electron:build
```

