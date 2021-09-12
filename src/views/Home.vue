<template>
  <div>
    <el-form label-position="right" label-width="150px">
      <el-form-item label="Background Color">
        <el-color-picker v-model="settings.backgroundColor" :predefine="['#009933', '#00FF00']" @change="update"></el-color-picker>
      </el-form-item>
      <el-form-item>
        <el-button @click="showProjection">Open Projection Window</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';
const { ipcRenderer } = window.require('electron');

export default {
  name: 'Home',
  computed: {
    ...mapFields([
      'settings',
    ])
  },
  methods: {
    update() {
      this.$store.dispatch("updateSettings");
    },
    showProjection() {
      ipcRenderer.send("showProjection", {backgroundColor: this.settings.backgroundColor});
    }
  }
}
</script>
