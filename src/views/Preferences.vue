<template>
  <div>
    <el-header style="background-color: #f5f5f5; border-bottom: 1px solid #e0e0e0; padding: 20px 24px; height: auto;">
      <h2 style="margin: 0; color: #333;">Preferences</h2>
    </el-header>
    <div style="padding: 24px;">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="General" name="general">
          <el-form label-position="right" label-width="130px">
            <el-form-item label="Background Color">
              <el-color-picker v-model="settings.backgroundColor" :predefine="['#009933', '#00FF00']" @change="update"></el-color-picker>
            </el-form-item>
            <el-form-item label="Subtitle Folder">
              <el-input 
                v-model="settings.subtitleExportPath" 
                placeholder="Select folder to save subtitle files..."
                readonly
                @change="update">
                <el-button slot="append" icon="el-icon-folder-opened" @click="selectSubtitleFolder">Browse</el-button>
              </el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Subtitle" name="sub">
          <el-form label-position="right" label-width="130px">
            <el-form-item label="Font Family">
              <el-select v-model="settings.fontFamily" @change="update" placeholder="Select font">
                <el-option-group label="System Fonts">
                  <el-option label="Arial" value="Arial"></el-option>
                  <el-option label="Helvetica" value="Helvetica"></el-option>
                  <el-option label="Times New Roman" value="Times New Roman"></el-option>
                  <el-option label="Georgia" value="Georgia"></el-option>
                  <el-option label="Verdana" value="Verdana"></el-option>
                  <el-option label="Courier New" value="Courier New"></el-option>
                  <el-option label="Monaco" value="Monaco"></el-option>
                </el-option-group>
                <el-option-group label="Chinese Fonts">
                  <el-option label="Alibaba PuHuiTi 2.0" value="Alibaba PuHuiTi 2.0"></el-option>
                  <el-option label="Noto Sans SC" value="Noto Sans SC"></el-option>
                  <el-option label="PingFang SC" value="PingFang SC"></el-option>
                  <el-option label="Hiragino Sans GB" value="Hiragino Sans GB"></el-option>
                  <el-option label="Microsoft YaHei" value="Microsoft YaHei"></el-option>
                  <el-option label="SimHei" value="SimHei"></el-option>
                  <el-option label="Source Han Sans SC" value="Source Han Sans SC"></el-option>
                </el-option-group>
                <el-option-group label="Mac System Fonts">
                  <el-option label="San Francisco" value="-apple-system"></el-option>
                  <el-option label="Helvetica Neue" value="Helvetica Neue"></el-option>
                  <el-option label="Lucida Grande" value="Lucida Grande"></el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
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
            <el-form-item label="Conversion">
              <el-select v-model="settings.chineseConversion" @change="update">
                <el-option label="No conversion" value="none"></el-option>
                <el-option label="Simplified → Traditional" value="s2t"></el-option>
                <el-option label="Traditional → Simplified" value="t2s"></el-option>
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
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';

export default {
  name: 'Preferences',
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
    async selectSubtitleFolder() {
      const { ipcRenderer } = window.require('electron');
      try {
        const result = await ipcRenderer.invoke('selectSubtitleFolder');
        if (result && !result.canceled && result.filePaths.length > 0) {
          this.settings.subtitleExportPath = result.filePaths[0];
          this.update();
          this.$message.success('Subtitle export folder updated');
        }
      } catch (error) {
        this.$message.error('Failed to select folder');
        console.error('Folder selection error:', error);
      }
    }
  }
}
</script>