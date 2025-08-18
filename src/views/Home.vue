<template>
  <div style="padding: 40px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto;">
      <el-card>
        <div style="padding: 40px;">
          <h1 style="color: #409EFF; margin-top: 0px; margin-bottom: 10px; font-size: 1.5em;">Welcome to Live Subs</h1>
          <p style="font-size: 16px; color: #606266; line-height: 1.6; margin-bottom: 30px; text-align: left;">
            Live streaming application for chroma-key subtitles and lower thirds. Get started by creating subtitles, lower thirds, or configuring your preferences.
          </p>
          
          <div style="margin-bottom: 30px;">
            <el-card shadow="hover" style="cursor: pointer; margin-bottom: 7.5px;" @click.native="$router.push('/preferences')">
              <div style="display: flex; align-items: center; padding: 10px 20px;">
                <i class="el-icon-setting" style="font-size: 36px; color: #909399; margin-right: 20px;"></i>
                <div>
                  <h3 style="margin: 0; color: #303133;">Preferences</h3>
                </div>
              </div>
            </el-card>
            
            <el-card shadow="hover" style="cursor: pointer;margin-bottom: 7.5px;" @click.native="addNewTemplate">
              <div style="display: flex; align-items: center; padding: 10px 20px;">
                <i class="el-icon-bottom-left" style="font-size: 36px; color: #909399; margin-right: 20px;"></i>
                <div>
                  <h3 style="margin: 0; color: #303133;">New Lower Third</h3>
                </div>
              </div>
            </el-card>

            <el-card shadow="hover" style="cursor: pointer; " @click.native="addNewEpisode">
              <div style="display: flex; align-items: center; padding: 10px 20px;">
                <i class="el-icon-document-copy" style="font-size: 36px; color: #909399; margin-right: 20px;"></i>
                <div>
                  <h3 style="margin: 0; color: #303133;">New Subtitle</h3>
                </div>
              </div>
            </el-card>
            
            
          </div>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #EBEEF5;">
            <h3 style="color: #303133; margin-bottom: 15px;">Quick Tips</h3>
            <ul style="text-align: left; color: #606266; line-height: 1.8;">
              <li>Press <strong>Cmd+,</strong> to open Preferences</li>
              <li>Press <strong>Spacebar</strong> to advance to next subtitle</li>
              <li>Use <strong>Cmd+O</strong> to open projection window</li>
              <li>Use <strong>Cmd+P</strong> to project fullscreen (external display + fullscreen)</li>
              <li>Use <strong>Cmd+C</strong> to close projection window</li>
              <li>Double-click projection window to toggle fullscreen</li>
            </ul>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields';
import { MessageBox } from 'element-ui';
import { nanoid } from 'nanoid';

export default {
  name: 'Home',
  data() {
    return {
    }
  },
  computed: {
    ...mapFields([
      'episodes',
      'lowerThirds'
    ])
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
        this.$router.push("/episode/" + identifier);
      });
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
        this.$router.push("/lowerthird/" + identifier);
      });
    }
  }
}
</script>
