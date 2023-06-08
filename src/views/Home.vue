<template>
  <div>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="General" name="general">
        <el-form label-position="right" label-width="130px">
          <el-form-item label="Background Color">
            <el-color-picker v-model="settings.backgroundColor" :predefine="['#009933', '#00FF00']" @change="update"></el-color-picker>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Subtitle" name="sub">
        <el-form label-position="right" label-width="130px">
          <el-form-item label="Size">
            <el-input-number v-model="settings.fontSize" @change="update" :min="10" :max="500"></el-input-number>
          </el-form-item>
          <el-form-item label="Weight">
            <el-select v-model="settings.fontWeight" @change="update">
              <el-option label="light" value="300"></el-option>
              <el-option label="normal" value="400"></el-option>
              <el-option label="semi bold" value="600"></el-option>
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
          <el-form-item label="Shadow">
            <el-switch v-model="settings.addShadow" @change="update"></el-switch>
          </el-form-item>
          <el-form-item label="Position">
            <el-select v-model="settings.subtitleAlign" @change="update">
              <el-option label="top left" value="topLeft"></el-option>
              <el-option label="top center" value="topCenter"></el-option>
              <el-option label="center" value="center"></el-option>
              <el-option label="bottom left" value="bottomLeft"></el-option>
              <el-option label="bottom center" value="bottomCenter"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Images" name="images">
        <el-form label-position="right" label-width="130px">
          <el-form-item label="Position">
            <el-select v-model="settings.imageAlign" @change="update">
              <el-option label="bottom left" value="bottomLeft"></el-option>
              <el-option label="bottom right" value="bottomRight"></el-option>
              <el-option label="top left" value="topLeft"></el-option>
              <el-option label="top right" value="topRight"></el-option>
              <el-option label="center" value="center"></el-option>
              <el-option label="top center" value="topCenter"></el-option>
              <el-option label="bottom center" value="bottomCenter"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Max Size %">
            <el-input-number v-model="settings.imageMaxSize" @change="update" :min="0.1" :max="1" :step="0.1"></el-input-number>
          </el-form-item>
          <el-form-item label="Loop for video">
            <el-switch v-model="settings.imageLoop" @change="update"></el-switch>
          </el-form-item>
          <el-form-item label="Margin (px)">
            <el-input-number v-model="settings.imageMargin" @change="update" :min="0" :max="100"></el-input-number>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';

export default {
  name: 'Home',
  data() {
    return {
    }
  },
  computed: {
    ...mapFields([
      'settings',
      'activeTab'
    ])
  },
  methods: {
    update() {
      this.$store.dispatch("updateSettings");
    },
  }
}
</script>
