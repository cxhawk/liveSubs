# Live Subtitles and Lower Third

Wanna add subtitles and lower third easily in your live stream? This tool is great to be used with a video switcher like the ATEM MINIs.

## Features
- Import subtitles by lines in a batch and go through them one by one
- Design multiple lower third templates with background image and text format.
- Use keyboard shortcut keys to control the display content.
- Available on macOS, Windows and Raspbian.

## Tutorial
1. Launch app on your computer and then press Ctrl/Command + O to open the projection window (green screen)
2. If you have a output with FHD resolution it should automatically went fullscreen on it. If not, you have to drag the projection window on to the target area and then double click the content area to go fullscreen. 
3. To show subtitles: in the main window, click on the + button in the subtitle section to add an episode (song/program/piece).
4. To show lower third, click on the + button in the lower third section to add an template. It will give you a default look, but you can customize it in the settings in it.
5. Click on an item in the table to show it, press Ctrl/Command + 1 or 2 to clear lower third or subtitles. If you want to temporarily hide everything, you can press Ctrl/Command + 0 to toggle the mute state.

## Screenshots

setup subtitle and lower third format
<img width="1136" alt="Screen Shot 2021-09-17 at 2 53 24 PM" src="https://user-images.githubusercontent.com/14524765/133857593-6edbcd7d-75c1-4c57-b364-6d0bba375568.png">

import subtitle lines in a batch and show them one by one by pressing the space bar
<img width="1136" alt="Screen Shot 2021-09-17 at 3 04 23 PM" src="https://user-images.githubusercontent.com/14524765/133858571-6e65bfde-a5a0-42ab-8bad-7c837368056c.png">

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

