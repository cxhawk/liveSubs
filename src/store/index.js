import Vue from 'vue'
import Vuex from 'vuex'
import { getField, updateField } from 'vuex-map-fields';
const { ipcRenderer } = window.require('electron');

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    episodes: localStorage.getItem("episodes") ? JSON.parse(localStorage.getItem("episodes")) : [],
    settings: {
      backgroundColor: localStorage.getItem("backgroundColor") ? localStorage.getItem("backgroundColor") : "#009933",
    },
    currentSubtitleEpisodeId: null,
    currentSubtitleId: null
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
  },
  mutations: {
    updateField
  },
  actions: {
    save(context) {
      localStorage.setItem("episodes", JSON.stringify(context.state.episodes));
    },
    updateSettings(context) {
      localStorage.setItem("settings", context.state.settings);
      ipcRenderer.send("updateSettings", context.state.settings);
    },
    showSubtitle(context, {episodeId, lyricsId}) {
      context.state.currentSubtitleEpisodeId = episodeId;
      context.state.currentSubtitleId = lyricsId;
      ipcRenderer.send("showSubtitle", context.getters.currentSubtitle);
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
