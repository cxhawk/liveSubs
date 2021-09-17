<template>
  <div>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="General" name="general">
        <el-form label-position="right" label-width="130px">
          <el-form-item label="Background Color*">
            <el-color-picker v-model="settings.backgroundColor" :predefine="['#009933', '#00FF00']" @change="update"></el-color-picker>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Subtitle" name="sub">
        <el-form label-position="right" label-width="130px">
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
          <el-form-item label="Shadow">
            <el-switch v-model="settings.addShadow" @change="update"></el-switch>
          </el-form-item>
          <el-form-item label="Center">
            <el-switch v-model="settings.centerAlign" @change="update"></el-switch>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Lower third" name="lower">
        <el-form label-position="right" label-width="130px">
          <el-form-item label="Background Image*">
            <el-image :src="settings.lowerThirdBg" fit="contain"></el-image>
            <el-input v-model="settings.lowerThirdBg" @change="update"></el-input>
          </el-form-item>
          <el-form-item label="Title Size">
            <el-input-number v-model="settings.lowerThirdTitleFontSize" @change="update" :min="10" :max="100"></el-input-number>
          </el-form-item>
          <el-form-item label="Title Color">
            <el-color-picker v-model="settings.lowerThirdTitleColor" :predefine="['#FFFFFF']" @change="update"></el-color-picker>
          </el-form-item>
          <el-form-item label="Title Offset (X,Y)">
            <el-input-number v-model="settings.lowerThirdTitleX" @change="update" :min="0" :max="200"></el-input-number>
            <el-input-number v-model="settings.lowerThirdTitleY" @change="update" :min="0" :max="200"></el-input-number>
          </el-form-item>
          <el-form-item label="Description Size">
            <el-input-number v-model="settings.lowerThirdDescriptionFontSize" @change="update" :min="10" :max="100"></el-input-number>
          </el-form-item>
          <el-form-item label="Description Color">
            <el-color-picker v-model="settings.lowerThirdDescriptionColor" :predefine="['#FFFFFF']" @change="update"></el-color-picker>
          </el-form-item>
          <el-form-item label="Description Offset (X,Y)">
            <el-input-number v-model="settings.lowerThirdDescriptionX" @change="update" :min="0" :max="200"></el-input-number>
            <el-input-number v-model="settings.lowerThirdDescriptionY" @change="update" :min="0" :max="200"></el-input-number>
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
      activeTab: "general",
    }
  },
  computed: {
    ...mapFields([
      'settings',
    ])
  },
  methods: {
    update() {
      this.$store.dispatch("updateSettings");
    }
  }
}
</script>
