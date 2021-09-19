<template>
  <div id="app">
    <el-container>
      <el-header class="top">
        <el-row type="flex" justify="space-between" align="middle" style="height: 100%">
          <el-col>
            <el-row type="flex" justify="start">
              <el-col style="width:60px">
                <el-image style="width: 40px; height: 40px" src="logo.png"></el-image>
              </el-col>
              <el-col>
                <el-row>
                  <span style="font-size: 20px; font-weight:700;">Live Subs</span>
                </el-row>
                <el-row>
                  <span style="font-size: 14px; font-weight:300; color: lightgray">现场抠像字幕</span>
                </el-row>
              </el-col>
            </el-row>
          </el-col>
          <el-col>
            <el-row class="previewLine1">
              {{currentSubtitleText}}
            </el-row>
            <el-row class="previewLine2">
              {{currentLowerThirdTitle}}
            </el-row>
          </el-col>
          <el-col>
            <div style="float: right">
              <el-tooltip content="Hide all contents on projection window temporarily (⌘+0)" placement="top" effect="light">
                <el-button :type="muted ? 'danger' : 'plain'" size="small" icon="el-icon-circle-close" @click="mute">
                  MUTE
                </el-button>
              </el-tooltip>
              <el-tooltip content="Open the projection window (⌘+O)" placement="bottom" effect="light">
                <el-button size="small" type="primary" icon="el-icon-monitor" @click="openWindow">
                  OPEN
                </el-button>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside class="left">
          <el-menu :default-active="$route.fullPath" :default-openeds="openMenu" router>
            <el-menu-item index="/"><i class="el-icon-setting"></i>Settings</el-menu-item>
            <el-submenu index="/lowerthirds">
              <template slot="title">
                <i class="el-icon-s-unfold"></i>
                <span>Lower Thirds</span>
              </template>
              <el-menu-item @click="addNewTemplate" class="episodeCell">
                <i class="el-icon-plus"></i>
                <span>New</span>
              </el-menu-item>
              <el-menu-item :index="'/lowerthird/' + template.id" v-for="template in lowerThirds" :key="template.id" class="episodeCell" :class="{activeItem: currentLowerThirdTemplateId === template.id}">
                <p class="episodeCellParagraph">
                  {{template.title}}
                </p>
              </el-menu-item>
            </el-submenu>
            <el-submenu index="/episodes">
              <template slot="title">
                <i class="el-icon-document-copy"></i>
                <span>Subtitles</span>
              </template>
              <el-menu-item @click="addNewEpisode" class="episodeCell">
                <i class="el-icon-plus"></i>
                <span>New</span>
              </el-menu-item>
              <el-menu-item :index="'/episode/' + episode.id" v-for="episode in episodes" :key="episode.id" class="episodeCell" :class="{activeItem: currentSubtitleEpisodeId === episode.id}">
                <p class="episodeCellParagraph">
                  {{episode.title}}
                </p>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main class="main">
            <router-view></router-view>
          </el-main>
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
      openMenu: ['/episodes'],
      muted: false
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
    ]),
    currentSubtitleText() {
      return this.$store.getters.currentSubtitle ? this.$store.getters.currentSubtitle.text : null;
    },
    currentLowerThirdTitle() {
      return this.$store.getters.currentLowerThird ? this.$store.getters.currentLowerThird.title : null;
    }
  },
  created() {
    ipcRenderer.on("nextSubtitle", () => {
      this.$store.dispatch("nextSubtitle");
      this.scrollToCurrentItem();
    });
    ipcRenderer.on("previousSubtitle", () => {
      this.$store.dispatch("previousSubtitle");
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
      this.$store.dispatch("showLowerThird", null);
    })
  },
  mounted() {
    window.onkeyup = e => {
      if(e.keyCode == 32 || e.key === " ") {
        if (e.target.nodeName !== "INPUT" && e.target.nodeName !== "TEXTAREA") {
          console.log(e);
          this.$store.dispatch("nextSubtitle");
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
      MessageBox.prompt("Give it a name", "New Episode").then(response => {
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
    scrollToCurrentItem() {
      setTimeout(() => {
        const element = document.querySelector(".current-row");
        if (element) {
          element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        }
      }, 100);
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

  @font-face {
    font-family: "Noto Sans SC";
    font-weight: 300;
    font-display: auto;
    src: url("./assets/fonts/NotoSansSC-Light.otf");
  }
  @font-face {
    font-family: "Noto Sans SC";
    font-weight: 400;
    font-display: auto;
    src: url("./assets/fonts/NotoSansSC-Regular.otf");
  }
  @font-face {
    font-family: "Noto Sans SC";
    font-weight: 700;
    font-display: auto;
    src: url("./assets/fonts/NotoSansSC-Bold.otf");
  }
  @font-face {
    font-family: "Noto Sans SC";
    font-weight: 900;
    font-display: auto;
    src: url("./assets/fonts/NotoSansSC-Black.otf");
  }
  @font-face {
    font-family: "Noto Sans";
    font-weight: 300;
    font-display: auto;
    src: url("./assets/fonts/NotoSans-Light.ttf");
  }
  @font-face {
    font-family: "Noto Sans";
    font-weight: 400;
    font-display: auto;
    src: url("./assets/fonts/NotoSans-Regular.ttf");
  }
  @font-face {
    font-family: "Noto Sans";
    font-weight: 700;
    font-display: auto;
    src: url("./assets/fonts/NotoSans-Bold.ttf");
  }
  @font-face {
    font-family: "Noto Sans";
    font-weight: 900;
    font-display: auto;
    src: url("./assets/fonts/NotoSans-Black.ttf");
  }
  
  body {
    margin: 0;
    width: 100%;
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    font-family: "helvetica", "Noto Sans", "Noto Sans SC", sans-serif;
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
  .previewLine1 {
    text-align: center;
    color: snow;
    font-family: "Noto Sans", "Noto Sans SC";
    font-size: 15px;
    text-overflow: ellipsis;
    height: 25px;
  }
  .previewLine2 {
    text-align: center;
    color:lightgray;
    font-family: "Noto Sans", "Noto Sans SC";
    font-size: 15px;
    text-overflow: ellipsis;
    height: 25px;
  }
</style>
