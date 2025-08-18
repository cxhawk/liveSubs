<template>
  <div id="app">
    <el-container>
      <el-header class="top">
        <el-row type="flex" justify="space-between" align="middle" style="height: 100%">
          <el-col>
            <el-row type="flex" justify="start" align="middle">
              <el-col style="width:60px">
                <el-image style="width: 40px; height: 40px" src="logo.png"></el-image>
              </el-col>
              <el-col style="width: 140px; flex: none;">
                <el-row>
                  <span style="font-size: 20px; font-weight:700;">Live Subs</span>
                </el-row>
                <el-row>
                  <span style="font-size: 14px; font-weight:300; color: lightgray; white-space: nowrap;">现场抠像字幕</span>
                </el-row>
              </el-col>
              <el-col style="margin-left: 60px">
                <div class="toolbar">
                  <el-tooltip :content="projectionWindowOpen ? 'Close the projection window (⌘+C)' : 'Open the projection window (⌘+O)'" effect="light">
                    <el-button size="small" type="primary" :icon="projectionWindowOpen ? 'el-icon-close' : 'el-icon-monitor'" @click="toggleWindow">
                      {{ projectionWindowOpen ? 'CLOSE' : 'OPEN' }}
                    </el-button>
                  </el-tooltip>
                  <el-tooltip :content="isProjectionFullscreen ? 'Exit fullscreen mode (⌘+P)' : 'Project to external display and maximize (⌘+P)'" effect="light">
                    <el-button size="small" type="success" :icon="isProjectionFullscreen ? 'el-icon-minus' : 'el-icon-full-screen'" @click="toggleProjectionFullscreen">
                      {{ isProjectionFullscreen ? 'PROJECT NORMAL' : 'PROJECT FULLSCREEN' }}
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="Hide all contents on projection window temporarily (⌘+0)" effect="light">
                    <el-button :type="muted ? 'danger' : 'plain'" size="small" icon="el-icon-circle-close" @click="mute">
                      MUTE
                    </el-button>
                  </el-tooltip>
                </div>
              </el-col>
            </el-row>
          </el-col>
          <el-col style="width: auto;">
            <div style="float: right">
              <el-tooltip content="Open GitHub Repository" effect="light">
                <el-button size="small" type="info" icon="el-icon-link" @click="openGitHub" circle>
                </el-button>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside class="left">
          <el-menu :default-active="$route.fullPath" :default-openeds="openMenu" router>
            <el-menu-item index="/"><i class="el-icon-house"></i>Dashboard</el-menu-item>
            <el-submenu index="/lowerthirds" @contextmenu.native="showLowerThirdsMenu">
              <template slot="title">
                <i class="el-icon-bottom-left"></i>
                <span>Lower Thirds</span>
              </template>
              <el-menu-item :index="'/lowerthird/' + template.id" v-for="template in lowerThirds" :key="template.id" class="episodeCell" :class="{activeItem: currentLowerThirdTemplateId === template.id}" style="padding-left: 25px !important; padding-top: 2px !important; padding-bottom: 2px !important;" @contextmenu.native="showLowerThirdItemMenu($event, template)">
                <i class="el-icon-price-tag" style="margin-right: 8px; color: #909399;"></i>
                <p class="episodeCellParagraph" style="display: inline;">
                  {{template.title}}
                </p>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="/episodes" @contextmenu.native="showSubtitlesMenu">
              <template slot="title">
                <i class="el-icon-document-copy"></i>
                <span>Subtitles</span>
              </template>
              <el-menu-item :index="'/episode/' + episode.id" v-for="episode in episodes" :key="episode.id" class="episodeCell" :class="{activeItem: currentSubtitleEpisodeId === episode.id}" style="padding-left: 25px !important; padding-top: 2px !important; padding-bottom: 2px !important;" @contextmenu.native="showSubtitleItemMenu($event, episode)">
                <i class="el-icon-tickets" style="margin-right: 8px; color: #909399;"></i>
                <p class="episodeCellParagraph" style="display: inline;">
                  {{episode.title}}
                </p>
              </el-menu-item>
            </el-submenu>
            <el-menu-item index="/images" :class="{activeItem: currentImageId != null}">
              <i class="el-icon-picture-outline"></i>
              <span slot="title">Image/Video</span>
            </el-menu-item>
            <el-menu-item index="/preferences">
              <i class="el-icon-setting"></i>
              <span slot="title">Preferences</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main class="main">
            <router-view></router-view>
            <div style="position: fixed; bottom: 10px; left: 10px; font-size: 10px; color: #999; z-index: 1000;">
              v250818a
            </div>
          </el-main>
          
          <!-- Context Menu for Lower Thirds -->
          <div
            v-show="contextMenuVisible"
            :style="{
              position: 'fixed',
              left: contextMenuX + 'px',
              top: contextMenuY + 'px',
              zIndex: 9999,
              backgroundColor: 'white',
              border: '1px solid #e4e7ed',
              borderRadius: '4px',
              boxShadow: '0 2px 12px 0 rgba(0,0,0,.1)',
              padding: '5px 0'
            }"
            @click="hideContextMenu"
          >
            <div
              v-for="item in contextMenuItems"
              :key="item.label"
              :style="{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#606266',
                minWidth: '120px'
              }"
              @mouseover="$event.target.style.backgroundColor = '#f5f7fa'"
              @mouseout="$event.target.style.backgroundColor = 'transparent'"
              @click="handleContextMenuClick(item.action)"
            >
              <i :class="item.icon" style="margin-right: 8px;"></i>
              {{ item.label }}
            </div>
          </div>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';
import { MessageBox } from 'element-ui';
import { nanoid } from 'nanoid';
const { ipcRenderer } = window.require('electron');

export default {
  name: 'app',
  data() {
    return {
      openMenu: ['/episodes', '/lowerthirds'],
      muted: false,
      projectionWindowOpen: false,
      isProjectionFullscreen: false,
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuType: '',
      contextMenuItems: [],
      selectedItem: null,
      subtitleSortAscending: true,
      lowerThirdSortAscending: true
    }
  },
  computed: {
    ...mapFields([
      'episodes',
      'lowerThirds',
      'currentSubtitleEpisodeId',
      'currentSubtitleId',
      'currentLowerThirdTemplateId',
      'currentLowerThirdId',
      'currentImageId'
    ]),
  },
  created() {
    ipcRenderer.on("nextSubtitle", () => {
      // Get current episode ID from route if on episode page
      const routeEpisodeId = this.$route.path.startsWith('/episode/') ? this.$route.params.id : null;
      this.$store.dispatch("nextSubtitle", routeEpisodeId);
      this.scrollToCurrentItem();
    });
    ipcRenderer.on("previousSubtitle", () => {
      // Get current episode ID from route if on episode page
      const routeEpisodeId = this.$route.path.startsWith('/episode/') ? this.$route.params.id : null;
      this.$store.dispatch("previousSubtitle", routeEpisodeId);
      this.scrollToCurrentItem();
    });
    ipcRenderer.on("muteStatus", (event, arg) => {
      this.muted = arg;
    });
    ipcRenderer.on("showProjection", () => {
      this.openWindow();
    });
    ipcRenderer.on("clearSubtitle", () => {
      this.$store.dispatch("showSubtitle", {episodeId: null, lyricsId: null});
    })
    ipcRenderer.on("clearLowerThird", () => {
      this.$store.dispatch("showLowerThird", {templateId: null, itemId: null});
    })
    ipcRenderer.on("clearImage", () => {
      this.$store.dispatch("showImage", {imageId: null});
    })
    ipcRenderer.on("projectionWindowOpened", () => {
      this.projectionWindowOpen = true;
    });
    ipcRenderer.on("projectionWindowClosed", () => {
      this.projectionWindowOpen = false;
    });
    ipcRenderer.on("projectionFullscreenChanged", (event, isFullscreen) => {
      this.isProjectionFullscreen = isFullscreen;
    });
    ipcRenderer.on("openPreferences", () => {
      this.$router.push("/preferences");
    });
    ipcRenderer.on("projectAtMax", () => {
      this.toggleProjectionFullscreen();
    });
  },
  mounted() {
    window.onkeyup = e => {
      if(e.keyCode == 32 || e.key === " ") {
        if (e.target.nodeName !== "INPUT" && e.target.nodeName !== "TEXTAREA") {
          // Get current episode ID from route if on episode page
          const routeEpisodeId = this.$route.path.startsWith('/episode/') ? this.$route.params.id : null;
          this.$store.dispatch("nextSubtitle", routeEpisodeId);
          this.scrollToCurrentItem();
        }
      }
    }
    window.onkeydown = e => {
      if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
    }
  },
  methods: {
    addNewEpisode() {
      MessageBox.prompt("Give it a name", "New Subtitle").then(response => {
        const name = response.value;
        const identifier = nanoid();
        const episode = {
          id: identifier,
          title: name,
          lyrics: []
        };
        if (this.episodes === null) {
          this.episodes = [];
        }
        this.episodes.unshift(episode);
        this.$store.dispatch("save");
        
        // Auto-save to file if export path is set
        this.saveSubtitleToFile(episode);
        
        this.goToEpisodeInfo(episode);
      });
    },
    goToEpisodeInfo(episodeInfo) {
      this.$router.push("/episode/" + episodeInfo.id);
    },
    addNewTemplate() {
      MessageBox.prompt("Give it a name", "New Lower Third Template").then(response => {
        const name = response.value;
        const identifier = nanoid();
        const template = {
          id: identifier,
          title: name,
          items: [],
          settings: {
            // lower third settings
            lowerThirdBg: "./images/lowerThird.png",
            lowerThirdResize: true,
            lowerThirdCenter: false,
            lowerThirdTitleFontSize: 64,
            lowerThirdTitleColor: "#FFFFFF",
            lowerThirdTitleX: 30,
            lowerThirdTitleY: 8,
            lowerThirdDescriptionFontSize: 24,
            lowerThirdDescriptionColor: "#8D8F8E",
            lowerThirdDescriptionX: 30,
            lowerThirdDescriptionY: 105,
          }
        };
        if (this.lowerThirds === null) {
          this.lowerThirds = [];
        }
        this.lowerThirds.unshift(template);
        this.$store.dispatch("save");
        this.$store.dispatch("updateSettings");
        this.goToItemInfo(template);
      });
    },
    goToItemInfo(itemInfo) {
      this.$router.push("/lowerthird/" + itemInfo.id);
    },
    mute() {
      ipcRenderer.invoke("mute");
    },
    openWindow() {
      ipcRenderer.send("showProjection", this.$store.getters.settingsAndTemplates);
    },
    closeWindow() {
      ipcRenderer.send("closeProjection");
    },
    toggleWindow() {
      if (this.projectionWindowOpen) {
        this.closeWindow();
      } else {
        this.openWindow();
      }
    },
    toggleProjectionFullscreen() {
      ipcRenderer.send("toggleProjectionFullscreen", this.$store.getters.settingsAndTemplates);
    },
    openGitHub() {
      ipcRenderer.send("openExternal", "https://github.com/cxhawk/liveSubs");
    },
    async saveSubtitleToFile(episode) {
      const { ipcRenderer } = window.require('electron');
      
      // Check if export path is set
      if (!this.$store.state.settings.subtitleExportPath) {
        this.$message.warning('Please set subtitle export folder in Preferences first');
        return;
      }
      
      try {
        // Convert episode to text format
        let content = `${episode.title}\n`;
        content += '====\n\n';
        
        if (episode.lyrics && episode.lyrics.length > 0) {
          episode.lyrics.forEach((lyric) => {
            content += `${lyric.text || ''}\n`;
          });
        } else {
          content += '(No subtitles added yet)\n';
        }
        
        // Create safe filename
        const safeFileName = episode.title.replace(/[<>:"/\\|?*]/g, '_') + '.txt';
        const path = require('path');
        const filePath = path.join(this.$store.state.settings.subtitleExportPath, safeFileName);
        
        // Save file
        const result = await ipcRenderer.invoke('saveSubtitleFile', {
          filePath: filePath,
          content: content
        });
        
        if (result.success) {
          // Subtitle saved successfully
        } else {
          console.error('Failed to save subtitle file:', result.error);
        }
      } catch (error) {
        console.error('Error saving subtitle to file:', error);
      }
    },
    async saveAllSubtitlesToFiles() {
      // Check if export path is set
      if (!this.$store.state.settings.subtitleExportPath) {
        this.$message.warning('Please set subtitle export folder in Preferences first');
        return;
      }

      if (!this.episodes || this.episodes.length === 0) {
        this.$message.info('No subtitles to save');
        return;
      }

      let savedCount = 0;
      let errorCount = 0;
      const totalCount = this.episodes.length;

      // Show progress message
      this.$message.info(`Starting to save ${totalCount} subtitle files...`);

      for (const episode of this.episodes) {
        try {
          await this.saveSubtitleToFile(episode);
          savedCount++;
        } catch (error) {
          console.error(`Failed to save subtitle "${episode.title}":`, error);
          errorCount++;
        }
      }

      // Show completion message
      if (errorCount === 0) {
        this.$message.success(`Successfully saved all ${savedCount} subtitle files`);
      } else if (savedCount > 0) {
        this.$message.warning(`Saved ${savedCount} files, ${errorCount} failed`);
      } else {
        this.$message.error(`Failed to save all ${totalCount} subtitle files`);
      }
    },
    async convertSubtitleToFile(episode) {
      // Check if export path is set
      if (!this.$store.state.settings.subtitleExportPath) {
        this.$message.warning('Please set subtitle export folder in Preferences first');
        return;
      }

      try {
        // Convert episode to text format
        let content = `${episode.title}\\n`;
        content += '====\\n\\n';
        
        if (episode.lyrics && episode.lyrics.length > 0) {
          episode.lyrics.forEach((lyric) => {
            content += `${lyric.text || ''}\\n`;
          });
        } else {
          content += '(No subtitles added yet)\\n';
        }
        
        // Create safe filename
        const safeFileName = episode.title.replace(/[<>:"/\\\\|?*]/g, '_') + '.txt';
        const path = require('path');
        const filePath = path.join(this.$store.state.settings.subtitleExportPath, safeFileName);
        
        // Check if file already exists
        const fs = require('fs');
        if (fs.existsSync(filePath)) {
          this.$message.warning(`File "${safeFileName}" already exists. Use "Export to File" to overwrite.`);
          return;
        }
        
        // Save file
        const result = await ipcRenderer.invoke('saveSubtitleFile', {
          filePath: filePath,
          content: content
        });
        
        if (result.success) {
          this.$message.success(`Subtitle converted and saved as: ${safeFileName}`);
        } else {
          this.$message.error('Failed to convert subtitle to file: ' + result.error);
        }
      } catch (error) {
        this.$message.error('Error converting subtitle to file');
        console.error('Error converting subtitle to file:', error);
      }
    },
    scrollToCurrentItem() {
      setTimeout(() => {
        const element = document.querySelector(".current-row");
        if (element) {
          element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        }
      }, 100);
    },
    async importSubtitleFile() {
      const { ipcRenderer } = window.require('electron');
      
      try {
        // Show file selection dialog
        const result = await ipcRenderer.invoke('selectTxtFile');
        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
          return;
        }
        
        const filePath = result.filePaths[0];
        
        // Read the file content
        const fileResult = await ipcRenderer.invoke('readTxtFile', filePath);
        if (!fileResult.success) {
          this.$message.error('Failed to read file: ' + fileResult.error);
          return;
        }
        
        // Parse the file content
        const lines = fileResult.content.split(/\r?\n/);
        const nonEmptyLines = lines.filter(line => line.trim() !== '');
        if (nonEmptyLines.length === 0) {
          this.$message.warning('The selected file is empty');
          return;
        }
        
        // Use first line as subtitle name, or filename if no content
        let subtitleName;
        let subtitleLines = lines;
        
        if (nonEmptyLines.length >= 2 && nonEmptyLines[1] === '====') {
          // Format: Title\n====\n\nContent
          subtitleName = nonEmptyLines[0].trim();
          // Find the position of ==== in the original lines array
          const titleLineIndex = lines.findIndex(line => line.trim() === nonEmptyLines[0].trim());
          const delimiterIndex = lines.findIndex((line, index) => index > titleLineIndex && line.trim() === '====');
          if (delimiterIndex >= 0) {
            subtitleLines = lines.slice(delimiterIndex + 1); // Skip title and ==== delimiter
          }
        } else if (nonEmptyLines.length >= 1) {
          // Use first line as title and content
          subtitleName = nonEmptyLines[0].trim();
          // Find the position of first non-empty line in the original lines array
          const titleLineIndex = lines.findIndex(line => line.trim() === nonEmptyLines[0].trim());
          subtitleLines = lines.slice(titleLineIndex + 1); // Skip first line used as title
        } else {
          // Fallback to filename if no content
          const path = require('path');
          subtitleName = path.basename(filePath, path.extname(filePath));
        }
        
        // Remove trailing empty lines
        while (subtitleLines.length > 0 && subtitleLines[subtitleLines.length - 1].trim() === '') {
          subtitleLines.pop();
        }
        
        // Process lyrics with smart empty line handling
        const lyrics = [];
        let foundFirstContent = false;
        
        for (const line of subtitleLines) {
          const trimmed = line.trim();
          
          // Skip ==== delimiter
          if (trimmed === '====') {
            continue;
          }
          
          // Skip placeholder text
          if (trimmed === '(No subtitles added yet)') {
            continue;
          }
          
          // If we haven't found content yet, skip empty lines
          if (!foundFirstContent && trimmed === '') {
            continue;
          }
          
          // First non-empty line marks the start of content
          if (!foundFirstContent && trimmed !== '') {
            foundFirstContent = true;
          }
          
          // Add all lines after first content (including empty ones)
          lyrics.push({
            id: nanoid(),
            text: line // Keep original line content, don't trim empty lines
          });
        }
        
        // Create new episode
        const identifier = nanoid();
        const episode = {
          id: identifier,
          title: subtitleName,
          lyrics: lyrics
        };
        
        if (this.episodes === null) {
          this.episodes = [];
        }
        this.episodes.unshift(episode);
        this.$store.dispatch("save");
        
        // Auto-save to file if export path is set
        this.saveSubtitleToFile(episode);
        
        this.$message.success(`Imported "${subtitleName}" with ${lyrics.length} subtitle lines`);
        
        // Navigate to the imported subtitle
        this.$router.push("/episode/" + identifier);
        
      } catch (error) {
        this.$message.error('Failed to import file');
        console.error('Import error:', error);
      }
    },
    showLowerThirdsMenu(event) {
      event.preventDefault();
      this.contextMenuType = 'lowerthirds';
      this.selectedItem = null;
      this.contextMenuItems = [
        { label: 'New Lower Third', icon: 'el-icon-plus', action: 'new' },
        { 
          label: this.lowerThirdSortAscending ? 'Reorder alphabetically (A-Z)' : 'Reorder alphabetically (Z-A)', 
          icon: this.lowerThirdSortAscending ? 'el-icon-sort-up' : 'el-icon-sort-down', 
          action: 'sort' 
        },
        { label: 'Clear All', icon: 'el-icon-delete', action: 'clear' }
      ];
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
      this.contextMenuVisible = true;
      
      // Hide menu when clicking elsewhere
      this.$nextTick(() => {
        document.addEventListener('click', this.hideContextMenu);
      });
    },
    showSubtitlesMenu(event) {
      event.preventDefault();
      this.contextMenuType = 'subtitles';
      this.selectedItem = null;
      this.contextMenuItems = [
        { label: 'New Subtitle', icon: 'el-icon-plus', action: 'new' },
        { label: 'Import a file', icon: 'el-icon-upload2', action: 'import' },
        { label: 'Save All', icon: 'el-icon-download', action: 'saveAll' },
        { 
          label: this.subtitleSortAscending ? 'Reorder alphabetically (A-Z)' : 'Reorder alphabetically (Z-A)', 
          icon: this.subtitleSortAscending ? 'el-icon-sort-up' : 'el-icon-sort-down', 
          action: 'sort' 
        },
        { label: 'Clear All', icon: 'el-icon-delete', action: 'clear' }
      ];
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
      this.contextMenuVisible = true;
      
      // Hide menu when clicking elsewhere
      this.$nextTick(() => {
        document.addEventListener('click', this.hideContextMenu);
      });
    },
    showSubtitleItemMenu(event, episode) {
      event.preventDefault();
      event.stopPropagation();
      this.contextMenuType = 'subtitle-item';
      this.selectedItem = episode;
      this.contextMenuItems = [
        { label: 'Rename', icon: 'el-icon-edit', action: 'rename' },
        { label: 'Export to File', icon: 'el-icon-download', action: 'export' },
        { label: 'Convert to file', icon: 'el-icon-document-add', action: 'convert' },
        { label: 'Remove from the list', icon: 'el-icon-remove', action: 'remove' }
      ];
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
      this.contextMenuVisible = true;
      
      // Hide menu when clicking elsewhere
      this.$nextTick(() => {
        document.addEventListener('click', this.hideContextMenu);
      });
    },
    showLowerThirdItemMenu(event, template) {
      event.preventDefault();
      event.stopPropagation();
      this.contextMenuType = 'lowerthird-item';
      this.selectedItem = template;
      this.contextMenuItems = [
        { label: 'Rename', icon: 'el-icon-edit', action: 'rename' },
        { label: 'Delete', icon: 'el-icon-delete', action: 'delete' }
      ];
      this.contextMenuX = event.clientX;
      this.contextMenuY = event.clientY;
      this.contextMenuVisible = true;
      
      // Hide menu when clicking elsewhere
      this.$nextTick(() => {
        document.addEventListener('click', this.hideContextMenu);
      });
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
      document.removeEventListener('click', this.hideContextMenu);
    },
    handleContextMenuClick(action) {
      this.hideContextMenu();
      
      if (this.contextMenuType === 'lowerthirds') {
        switch (action) {
          case 'new':
            this.addNewTemplate();
            break;
          case 'sort':
            if (this.lowerThirds && this.lowerThirds.length > 0) {
              if (this.lowerThirdSortAscending) {
                this.lowerThirds.sort((a, b) => a.title.localeCompare(b.title));
                this.$message.success('Lower Thirds sorted A-Z');
              } else {
                this.lowerThirds.sort((a, b) => b.title.localeCompare(a.title));
                this.$message.success('Lower Thirds sorted Z-A');
              }
              this.lowerThirdSortAscending = !this.lowerThirdSortAscending;
              this.$store.dispatch("save");
            } else {
              this.$message.info('No Lower Thirds to sort');
            }
            break;
          case 'clear':
            this.$confirm('This will permanently delete all Lower Third templates. Continue?', 'Warning', {
              confirmButtonText: 'Delete All',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              this.lowerThirds = [];
              this.$store.dispatch("save");
              this.$message.success('All Lower Third templates deleted');
            }).catch(() => {
              this.$message.info('Delete cancelled');
            });
            break;
        }
      } else if (this.contextMenuType === 'subtitles') {
        switch (action) {
          case 'new':
            this.addNewEpisode();
            break;
          case 'import':
            this.importSubtitleFile();
            break;
          case 'saveAll':
            this.saveAllSubtitlesToFiles();
            break;
          case 'sort':
            if (this.episodes && this.episodes.length > 0) {
              if (this.subtitleSortAscending) {
                this.episodes.sort((a, b) => a.title.localeCompare(b.title));
                this.$message.success('Subtitles sorted A-Z');
              } else {
                this.episodes.sort((a, b) => b.title.localeCompare(a.title));
                this.$message.success('Subtitles sorted Z-A');
              }
              this.subtitleSortAscending = !this.subtitleSortAscending;
              this.$store.dispatch("save");
            } else {
              this.$message.info('No subtitles to sort');
            }
            break;
          case 'clear':
            this.$confirm('This will permanently delete all Subtitle episodes. Continue?', 'Warning', {
              confirmButtonText: 'Delete All',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              this.episodes = [];
              this.$store.dispatch("save");
              this.$message.success('All Subtitle episodes deleted');
            }).catch(() => {
              this.$message.info('Delete cancelled');
            });
            break;
        }
      } else if (this.contextMenuType === 'subtitle-item') {
        switch (action) {
          case 'rename':
            this.$prompt('Enter new name', 'Rename Subtitle', {
              confirmButtonText: 'Rename',
              cancelButtonText: 'Cancel',
              inputValue: this.selectedItem.title
            }).then(({ value }) => {
              this.selectedItem.title = value;
              this.$store.dispatch("save");
              
              // Auto-save to file if export path is set
              this.saveSubtitleToFile(this.selectedItem);
              
              this.$message.success('Subtitle renamed successfully');
            }).catch(() => {
              this.$message.info('Rename cancelled');
            });
            break;
          case 'export':
            this.saveSubtitleToFile(this.selectedItem);
            this.$message.success('Subtitle exported to file');
            break;
          case 'convert':
            this.convertSubtitleToFile(this.selectedItem);
            break;
          case 'remove':
            this.$confirm(`Remove "${this.selectedItem.title}" from the list? The saved file will not be deleted.`, 'Remove from List', {
              confirmButtonText: 'Remove',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              const index = this.episodes.findIndex(ep => ep.id === this.selectedItem.id);
              if (index > -1) {
                this.episodes.splice(index, 1);
                this.$store.dispatch("save");
                this.$message.success('Subtitle removed from list (file preserved)');
              }
            }).catch(() => {
              this.$message.info('Remove cancelled');
            });
            break;
          case 'delete':
            this.$confirm(`This will permanently delete "${this.selectedItem.title}". Continue?`, 'Warning', {
              confirmButtonText: 'Delete',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              const index = this.episodes.findIndex(ep => ep.id === this.selectedItem.id);
              if (index > -1) {
                this.episodes.splice(index, 1);
                this.$store.dispatch("save");
                this.$message.success('Subtitle deleted successfully');
              }
            }).catch(() => {
              this.$message.info('Delete cancelled');
            });
            break;
        }
      } else if (this.contextMenuType === 'lowerthird-item') {
        switch (action) {
          case 'rename':
            this.$prompt('Enter new name', 'Rename Lower Third', {
              confirmButtonText: 'Rename',
              cancelButtonText: 'Cancel',
              inputValue: this.selectedItem.title
            }).then(({ value }) => {
              this.selectedItem.title = value;
              this.$store.dispatch("save");
              this.$message.success('Lower Third renamed successfully');
            }).catch(() => {
              this.$message.info('Rename cancelled');
            });
            break;
          case 'delete':
            this.$confirm(`This will permanently delete "${this.selectedItem.title}". Continue?`, 'Warning', {
              confirmButtonText: 'Delete',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              const index = this.lowerThirds.findIndex(lt => lt.id === this.selectedItem.id);
              if (index > -1) {
                this.lowerThirds.splice(index, 1);
                this.$store.dispatch("save");
                this.$message.success('Lower Third deleted successfully');
              }
            }).catch(() => {
              this.$message.info('Delete cancelled');
            });
            break;
        }
      }
    }
  }
}
</script>

<style>
  :root {
    --left-width: 300px;
    --top-height: 60px;
  }
  @media only screen and (max-width: 650px) {
    :root {
      --left-width: 200px;
    }
  }
  
  ::-webkit-scrollbar {
      width: 5px;
  }
  
  /* Track */
  ::-webkit-scrollbar-track {
      -webkit-border-radius: 5px;
      border-radius: 5px;
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
      opacity:0.1;
      -webkit-border-radius: 10px;
      border-radius: 10px;
      background: rgba(0,0,0,0.5); 
  }
  
  body {
    margin: 0;
    width: 100%;
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  }
  .top {
    background-color: #272f3f;
    color: white;
    height: var(--top-height) !important;;
  }
  .left {
    background-color: #1e222d;
    height: calc(100vh - var(--top-height));
    width: var(--left-width) !important;
  }
  .main {
    background-color: #E9EEF3;
    color: #333;
    height: calc(100vh - var(--top-height));
  }
  .el-menu {
    border: 0px !important;
    overflow-x: hidden;
  }
  .el-menu-item:focus,
  .el-menu-item:hover,
  .el-submenu__title:focus,
  .el-submenu__title:hover {
    background-color: #272f3f !important;
  }
  .el-menu-item.is-active {
    background-color: #006eff !important;
    color: white !important;
  }
  .episodeCell {
    min-width: var(--left-width) !important;
    padding: 5px 5px 5px 30px !important;
    background-color: rgba(0, 153, 51, 0.1) !important;
    border-left: 3px solid #009933 !important;
  }
  .episodeCell:hover {
    background-color: rgba(0, 153, 51, 0.2) !important;
  }
  .episodeCellParagraph {
    line-height: 15px !important;
    font-size: 15px !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .activeItem {
    color: rgb(255, 90, 90) !important;
  }
  .toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
