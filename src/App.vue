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
                  <span style="font-size: 20px;">Live Subs</span>
                </el-row>
                <el-row>
                  <span style="font-size: 14px; font-weight:lighter;">现场抠像字幕</span>
                </el-row>
              </el-col>
            </el-row>
          </el-col>
          <el-col class="preview" v-if="currentSubtitleText">
            {{currentSubtitleText.text}}
          </el-col>
          <el-col>
            <div style="float: right">
              <el-tooltip content="Hide all contents on projection window (⌘+M)" placement="bottom" effect="light">
                <el-button :type="muted ? 'danger' : 'plain'" size="small" @click="mute">
                  MUTE
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
            <el-submenu index="/episodes">
              <template slot="title">
                <i class="el-icon-document-copy"></i>
                <span>Subtitles</span>
              </template>
              <el-menu-item @click="addNewEpisode" class="episodeCell">
                <i class="el-icon-plus"></i>
                <span>New</span>
              </el-menu-item>
              <el-menu-item :index="'/episode/' + episode.id" v-for="episode in episodes" :key="episode.id" class="episodeCell">
                <p class="episodeCellParagraph">{{ episode.title }}</p>
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
      'currentSubtitleEpisodeId',
      'currentSubtitleId',
    ]),
    currentSubtitleText() {
      const currentEpisode = this.episodes.find((ep) => ep.id === this.currentSubtitleEpisodeId);
      if (currentEpisode) {
        return currentEpisode.lyrics.find((element) => element.id === this.currentSubtitleId);
      }
      return null;
    }
  },
  created() {
    ipcRenderer.on("nextSubtitle", () => {
      this.$store.dispatch("nextSubtitle");
    });
    ipcRenderer.on("previousSubtitle", () => {
      this.$store.dispatch("previousSubtitle");
    });
    ipcRenderer.on("muteStatus", (event, arg) => {
      this.muted = arg;
    });
  },
  mounted() {
    window.onkeyup = e => {
      if(e.keyCode == 32 || e.key === " ") {
        this.$store.dispatch("nextSubtitle");
        setTimeout(() => {
          this.scrollToCurrentItem();
        }, 100);
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
      MessageBox.prompt("起个名字吧", "创建新节目").then(response => {
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
    mute() {
      ipcRenderer.invoke("mute");
    },
    scrollToCurrentItem() {
      const element = document.querySelector(".current-row");
      if (element) {
        element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
      }
    }
  }
}
</script>

<style>
  :root {
    --left-width: 250px;
  }
  @media only screen and (max-width: 650px) {
    :root {
      --left-width: 150px;
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
  }
  .left {
    background-color: #1e222d;
    height: calc(100vh - 60px);
    width: var(--left-width) !important;
  }
  .main {
    background-color: #E9EEF3;
    color: #333;
    height: calc(100vh - 60px);
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
    font-size: 14px !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .preview {
    text-align: center;
    color: snow;
    font-size: 17px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
</style>
