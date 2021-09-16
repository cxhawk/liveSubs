<template>
  <div>
    <el-form label-position="right" label-width="130px">
      <el-form-item>
        <el-button @click="showProjection">Open Projection Window</el-button>
      </el-form-item>
      <el-form-item label="Background Color">
        <el-color-picker v-model="settings.backgroundColor" :predefine="['#009933', '#00FF00']" @change="update"></el-color-picker>
      </el-form-item>
      <el-form-item label="Font">
        <el-input v-model="settings.fontFamily" @change="update" placeholder="write font family name here"></el-input>
      </el-form-item>
      <el-form-item label="Size">
        <el-input-number v-model="settings.fontSize" @change="update" :min="10" :max="100"></el-input-number>
      </el-form-item>
      <el-form-item label="Weight">
        <el-select v-model="settings.fontWeight" @change="update">
          <el-option label="light" value="300"></el-option>
          <el-option label="normal" value="400"></el-option>
          <el-option label="bold" value="700"></el-option>
          <el-option label="black" value="900"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Text Color">
        <el-color-picker v-model="settings.color" :predefine="['#FFFFFF']" @change="update"></el-color-picker>
      </el-form-item>
      <el-form-item label="Stroke Color">
        <el-color-picker v-model="settings.strokeColor" :predefine="['#000000']" @change="update"></el-color-picker>
      </el-form-item>
      <el-form-item label="Stroke Size">
        <el-input-number v-model="settings.strokeSize" @change="update" :min="0" :max="5"></el-input-number>
      </el-form-item>
      <el-form-item label="Add Shadow">
        <el-switch v-model="settings.addShadow" @change="update"></el-switch>
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
      ipcRenderer.send("showProjection", this.settings);
    }
  }
}
</script>
