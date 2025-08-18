import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
import chineseConverter from '../utils/chineseConverter';
const { ipcRenderer } = window.require('electron');

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    episodes: localStorage.getItem("episodes") ? JSON.parse(localStorage.getItem("episodes")) : [],
    lowerThirds: localStorage.getItem("lowerThirds") ? JSON.parse(localStorage.getItem("lowerThirds")) : [],
    images: localStorage.getItem("images") ? JSON.parse(localStorage.getItem("images")) : [],
    settings: Object.assign({
      backgroundColor: "#009933",
      // subtitle settings
      fontFamily: "Alibaba PuHuiTi 2.0",
      fontSize: 50,
      fontWeight: "700",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeSize: 2,
      addShadow: false,
      subtitleAlign: "bottomCenter",
      // chinese conversion settings
      chineseConversion: "none", // "none", "s2t", "t2s"
      // image settings
      imageAlign: "bottomLeft",
      imageMaxSize: 0.5,
      imageLoop: false,
      imageMargin: 50,
      // subtitle export settings
      subtitleExportPath: require('os').homedir() + '/Documents',
    }, JSON.parse(localStorage.getItem("settings"))),
    currentSubtitleEpisodeId: null,
    currentSubtitleId: null,
    currentLowerThirdTemplateId: null,
    currentLowerThirdId: null,
    currentImageId: null,
    activeTab: "general"
  },
  getters: {
    // Add the `getField` getter to the
    // `getters` of your Vuex store instance.
    getField,
    currentSubtitle: state => {
      const currentEpisode = state.episodes.find((ep) => ep.id === state.currentSubtitleEpisodeId);
      if (currentEpisode) {
        return currentEpisode.lyrics.find((element) => element.id === state.currentSubtitleId);
      }
      return null;
    },
    currentLowerThird: state => {
      const currentEpisode = state.lowerThirds.find((ep) => ep.id === state.currentLowerThirdTemplateId);
      if (currentEpisode) {
        return currentEpisode.items.find((item) => item.id === state.currentLowerThirdId);
      }
      return null;
    },
    settingsAndTemplates: state => {
      const settingsString = JSON.stringify(state.settings);
      let allSettings = JSON.parse(settingsString);
      allSettings.templates = {};
      for (const template of state.lowerThirds) {
        allSettings.templates[template.id] = template.settings;
      }
      return allSettings;
    }
  },
  mutations: {
    updateField
  },
  actions: {
    save(context) {
      localStorage.setItem("episodes", JSON.stringify(context.state.episodes));
      localStorage.setItem("lowerThirds", JSON.stringify(context.state.lowerThirds));
      localStorage.setItem("images", JSON.stringify(context.state.images));
    },
    updateSettings(context) {
      const settingsString = JSON.stringify(context.state.settings);
      localStorage.setItem("settings", settingsString);
      //send settings and all the lower third templates over to the projection page
      ipcRenderer.send("updateSettings", context.getters.settingsAndTemplates);
    },
    showSubtitle(context, {episodeId, lyricsId}) {
      context.state.currentSubtitleEpisodeId = episodeId;
      context.state.currentSubtitleId = lyricsId;
      const subtitle = context.getters.currentSubtitle;
      if (subtitle && subtitle.text) {
        const convertedSubtitle = {
          ...subtitle,
          text: chineseConverter.convert(subtitle.text, context.state.settings.chineseConversion)
        };
        ipcRenderer.send("showSubtitle", convertedSubtitle);
      } else {
        ipcRenderer.send("showSubtitle", subtitle);
      }
    },
    showLowerThird(context, {templateId, itemId}) {
      context.state.currentLowerThirdTemplateId = templateId;
      context.state.currentLowerThirdId = itemId;
      const lowerThird = context.getters.currentLowerThird;
      if (lowerThird && (lowerThird.title || lowerThird.description)) {
        const convertedLowerThird = {
          ...lowerThird,
          title: lowerThird.title ? chineseConverter.convert(lowerThird.title, context.state.settings.chineseConversion) : lowerThird.title,
          description: lowerThird.description ? chineseConverter.convert(lowerThird.description, context.state.settings.chineseConversion) : lowerThird.description
        };
        ipcRenderer.send("showLowerThird", {templateId: templateId, item: convertedLowerThird});
      } else {
        ipcRenderer.send("showLowerThird", {templateId: templateId, item: lowerThird});
      }
    },
    showImage(context, {imageId}) {
      context.state.currentImageId = imageId;
      const currentImage = context.state.images.find((item) => item.id === imageId);
      ipcRenderer.send("showImage", {item: currentImage});
    },
    previousSubtitle(context, routeEpisodeId = null) {
      // Try to find current episode from state first, then from route parameter
      let currentEpisode = context.state.episodes.find((ep) => ep.id === context.state.currentSubtitleEpisodeId);
      
      // If no current episode in state, use the route episode ID
      if (!currentEpisode && routeEpisodeId) {
        currentEpisode = context.state.episodes.find((ep) => ep.id === routeEpisodeId);
      }
      
      if (currentEpisode) {
        const lyricsIndex = currentEpisode.lyrics.findIndex((element) => element.id === context.state.currentSubtitleId);
        if (lyricsIndex > 0) {
          context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: currentEpisode.lyrics[lyricsIndex - 1].id})
        } else {
          context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: null})
        }
      }
    },
    nextSubtitle(context, routeEpisodeId = null) {
      // Try to find current episode from state first, then from route parameter
      let currentEpisode = context.state.episodes.find((ep) => ep.id === context.state.currentSubtitleEpisodeId);
      
      // If no current episode in state, use the route episode ID
      if (!currentEpisode && routeEpisodeId) {
        currentEpisode = context.state.episodes.find((ep) => ep.id === routeEpisodeId);
      }
      
      if (currentEpisode) {
        const lyricsIndex = currentEpisode.lyrics.findIndex((element) => element.id === context.state.currentSubtitleId);
        
        if (lyricsIndex >= 0) {
          if (lyricsIndex < currentEpisode.lyrics.length - 1) {
            context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: currentEpisode.lyrics[lyricsIndex + 1].id})
          } else {
            context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: null})
          }
        } else {
          // No current subtitle selected, start with first one
          if (currentEpisode.lyrics.length > 0) {
            context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: currentEpisode.lyrics[0].id});
          }
        }
      }
    }
  }
})
