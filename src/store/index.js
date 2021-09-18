import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
const { ipcRenderer } = window.require('electron');

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    episodes: localStorage.getItem("episodes") ? JSON.parse(localStorage.getItem("episodes")) : [],
    lowerThirds: localStorage.getItem("lowerThirds") ? JSON.parse(localStorage.getItem("lowerThirds")) : [],
    settings: Object.assign({
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
    }, JSON.parse(localStorage.getItem("settings"))),
    currentSubtitleEpisodeId: null,
    currentSubtitleId: null,
    currentLowerThirdId: null
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
      const currentLowerThird = state.lowerThirds.find((item) => item.id === state.currentLowerThirdId);
      return currentLowerThird;
    }
  },
  mutations: {
    updateField
  },
  actions: {
    save(context) {
      localStorage.setItem("episodes", JSON.stringify(context.state.episodes));
      localStorage.setItem("lowerThirds", JSON.stringify(context.state.lowerThirds));
    },
    updateSettings(context) {
      localStorage.setItem("settings", JSON.stringify(context.state.settings));
      //console.log(context.state.settings);
      ipcRenderer.send("updateSettings", context.state.settings);
    },
    showSubtitle(context, {episodeId, lyricsId}) {
      context.state.currentSubtitleEpisodeId = episodeId;
      context.state.currentSubtitleId = lyricsId;
      ipcRenderer.send("showSubtitle", context.getters.currentSubtitle);
    },
    showLowerThird(context, identifer) {
      context.state.currentLowerThirdId = identifer;
      ipcRenderer.send("showLowerThird", context.getters.currentLowerThird);
    },
    previousSubtitle(context) {
      const currentEpisode = context.state.episodes.find((ep) => ep.id === context.state.currentSubtitleEpisodeId);
      if (currentEpisode) {
        const lyricsIndex = currentEpisode.lyrics.findIndex((element) => element.id === context.state.currentSubtitleId);
        if (lyricsIndex > 0) {
          context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: currentEpisode.lyrics[lyricsIndex - 1].id})
        } else {
          context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: null})
        }
      }
    },
    nextSubtitle(context) {
      const currentEpisode = context.state.episodes.find((ep) => ep.id === context.state.currentSubtitleEpisodeId);
      if (currentEpisode) {
        const lyricsIndex = currentEpisode.lyrics.findIndex((element) => element.id === context.state.currentSubtitleId);
        console.log(lyricsIndex);
        if (lyricsIndex >= 0) {
          if (lyricsIndex < currentEpisode.lyrics.length - 1) {
            context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: currentEpisode.lyrics[lyricsIndex + 1].id})
          } else {
            context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: null})
          }
        } else {
          context.dispatch("showSubtitle", {episodeId: currentEpisode.id, lyricsId: currentEpisode.lyrics[0].id});
        }
      }
    }
  }
})
