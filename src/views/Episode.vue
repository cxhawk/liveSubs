<template>
  <div>
    <el-row :gutter="10" type="flex" justify="end">
      <el-col>
        <span style="font-size: 16px">{{ currentEpisode.title }}</span>
        <br>
        <span style="font-size: 12px; color: #909399;">{{ currentEpisode.lyrics ? currentEpisode.lyrics.length : 0 }} lines</span>
      </el-col>
      <el-col style="width: 110px">
        <el-tooltip content="deactivate subtitle (⌘+2)" placement="bottom" effect="light">
          <el-button icon="el-icon-close" size="small" type="danger" @click="clear" :disabled="currentSubtitleEpisodeId !== currentEpisode.id"
            >Clear
          </el-button>
        </el-tooltip>
      </el-col>
      <el-col style="width: 120px">
        <el-button icon="el-icon-plus" size="small" @click="importLines"
          >Add Lines
        </el-button>
      </el-col>
      <el-col style="width: 120px">
        <el-popconfirm title="Are you sure？" @confirm="removeAll">
          <el-button icon="el-icon-delete" size="small" slot="reference"
            >Remove All</el-button
          >
        </el-popconfirm>
      </el-col>
      <el-col style="width: 90px">
        <el-button icon="el-icon-download" size="small" @click="saveToFile"
          >Save</el-button>
      </el-col>
    </el-row>
    <span style="font-size: 12px; color: gray">Click to show a line, press spacebar go next or ⌘ + ←/→ to move around</span>
    <el-table
      :data="currentEpisode.lyrics"
      style="width: 100%; margin-top: 10px"
      v-if="currentEpisode.lyrics"
      highlight-current-row
      @current-change="currentChanged"
      ref="table"
      row-key="id"
      :current-row-key="currentSubtitleId"
    >
      <el-table-column type="index" width="50"> </el-table-column>
      <el-table-column prop="text" label="Text"> </el-table-column>
      <el-table-column fixed="right" label="Action" width="160">
        <template slot-scope="scope">
          <el-tooltip content="insert new item before this">
            <el-button @click="insertLine(scope.row, $event)" type="text" size="small" icon="el-icon-s-unfold"></el-button>
          </el-tooltip>
          <el-tooltip content="edit this item">
            <el-button @click="editLine(scope.row, $event)" type="text" size="small" icon="el-icon-edit"></el-button>
          </el-tooltip>
          <el-tooltip content="delete this item">
            <el-button @click="removeLine(scope.row, $event)" type="text" size="small" icon="el-icon-delete"></el-button>
          </el-tooltip>
          <el-tooltip content="add one empty line above">
            <el-button @click="addEmptyLineAbove(scope.row, $event)" type="text" size="small" icon="el-icon-top"></el-button>
          </el-tooltip>
          <el-tooltip content="add one empty line below">
            <el-button @click="addEmptyLineBelow(scope.row, $event)" type="text" size="small" icon="el-icon-bottom"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-row style="margin-top: 15px" :gutter="10" type="flex" justify="end">
      <el-col style="width: 90px">
        <el-button size="small" @click="rename">Rename</el-button>
      </el-col>
      <el-col style="width: 90px">
        <el-button type="danger" size="small" @click="deleteEpisode">Delete</el-button>
      </el-col>
    </el-row>
    <el-dialog title="Add Lines" :visible.sync="importDialogVisible" width="70%" :close-on-click-modal="false">
      <el-input
        type="textarea"
        :autosize="{ minRows: 5, maxRows: 20 }"
        placeholder="one line per item"
        v-model="importText"
      ></el-input>
      <el-row style="margin-top: 10px" :gutter="10">
        <el-col :span="6">
          <el-button @click="removeAllSymbols" size="small" icon="el-icon-delete">
            Remove All Symbols
          </el-button>
        </el-col>
        <el-col :span="12">
          <el-button @click="removeEmptyLines" size="small" icon="el-icon-remove">
            Remove Empty Lines
          </el-button>
        </el-col>
      </el-row>
      <el-row style="margin-top: 10px" :gutter="10">
        <el-col :span="13">
          <el-row type="flex" align="middle">
            <el-col>
              <span style="margin-right:0px">Max Characters Per Line:</span>
            </el-col>
            <el-col>
              <el-input-number 
                v-model="maxLineLength" 
                :min="1" 
                :max="100" 
                size="small" 
                style="width: 120px"
              ></el-input-number>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="9">
          <el-button @click="breakLongLines" size="small" icon="el-icon-s-unfold">
            Break Long Lines
          </el-button>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false" size="small"
          >Cancel</el-button
        >
        <el-button type="primary" @click="importConfirm" size="small"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
    
    <el-dialog title="Edit Line" :visible.sync="editDialogVisible" width="70%" :close-on-click-modal="false">
      <el-input
        ref="editInput"
        v-model="editText"
        placeholder="Enter text"
      ></el-input>
      <el-row style="margin-top: 10px">
        <el-col>
          <el-button @click="splitLineAtCursor" size="small" icon="el-icon-s-unfold">
            Split into 2 lines from cursor position
          </el-button>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false" size="small"
          >Cancel</el-button
        >
        <el-button type="primary" @click="confirmEdit" size="small"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";
import { nanoid } from 'nanoid';
import { MessageBox } from 'element-ui';
const { ipcRenderer } = window.require('electron');

export default {
  data() {
    return {
      importDialogVisible: false,
      importText: "",
      maxLineLength: 12,
      editDialogVisible: false,
      editText: "",
      editingRow: null,
    };
  },
  computed: {
    ...mapFields([
      "episodes",
      "currentSubtitleEpisodeId",
      "currentSubtitleId",
    ]),
    currentEpisode() {
      return this.episodes.find((ep) => ep.id === this.$route.params.id);
    },
  },
  methods: {
    clear() {
      this.$store.dispatch("showSubtitle", {episodeId: null, lyricsId: null});
    },
    importLines() {
      this.importDialogVisible = true;
    },
    importConfirm() {
      this.importDialogVisible = false;
      if (this.importText.length) {
        const lines = this.importText.split(/\r?\n/);
        if (lines.length) {
          let newLyrics = [];
          for (const line of lines) {
            newLyrics.push({ id: nanoid(), text: line.trim() });
          }
          if (Array.isArray(this.currentEpisode.lyrics)) {
            this.currentEpisode.lyrics =
              this.currentEpisode.lyrics.concat(newLyrics);
          } else {
            this.currentEpisode.lyrics = newLyrics;
          }
          this.$store.dispatch("save");
          
          // Auto-save to file
          this.saveSubtitleToFile(this.currentEpisode);
        }
      }
      this.importText = "";
    },
    removeAll() {
      this.currentEpisode.lyrics = [];
      this.$store.dispatch("save");
      
      // Auto-save to file
      this.saveSubtitleToFile(this.currentEpisode);
    },
    removeLine(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        if (row.id === this.currentSubtitleId) {
          this.clear();
        }
        this.currentEpisode.lyrics.splice(index, 1);
        this.$store.dispatch("save");
        
        // Auto-save to file
        this.saveSubtitleToFile(this.currentEpisode);
      }
    },
    editLine(row, event) {
      event.stopPropagation();
      this.editingRow = row;
      this.editText = row.text;
      this.editDialogVisible = true;
      
      // Focus the input when dialog opens
      this.$nextTick(() => {
        this.$refs.editInput.focus();
      });
    },
    confirmEdit() {
      if (this.editingRow) {
        this.editingRow.text = this.editText;
        if (this.editingRow.id === this.currentSubtitleId) {
          this.$store.dispatch("showSubtitle", {episodeId: this.currentSubtitleEpisodeId, lyricsId: this.currentSubtitleId});
        }
        this.$store.dispatch("save");
        
        // Auto-save to file
        this.saveSubtitleToFile(this.currentEpisode);
      }
      this.editDialogVisible = false;
      this.editingRow = null;
      this.editText = "";
    },
    splitLineAtCursor() {
      if (!this.editingRow || !this.$refs.editInput) return;
      
      const input = this.$refs.editInput.$refs.input;
      const cursorPosition = input.selectionStart;
      const text = this.editText;
      
      // Split text at cursor position
      const beforeCursor = text.substring(0, cursorPosition);
      const afterCursor = text.substring(cursorPosition);
      
      // Update current line with text before cursor
      this.editingRow.text = beforeCursor;
      
      // Create new line with text after cursor
      const identifier = nanoid();
      const newLyric = {
        id: identifier,
        text: afterCursor
      };
      
      // Find position to insert new line (after current line)
      const index = this.indexOfRow(this.editingRow);
      if (index >= 0) {
        this.currentEpisode.lyrics.splice(index + 1, 0, newLyric);
      }
      
      this.$store.dispatch("save");
      
      // Auto-save to file
      this.saveSubtitleToFile(this.currentEpisode);
      
      // Close dialog
      this.editDialogVisible = false;
      this.editingRow = null;
      this.editText = "";
      
      this.$message.success('Line split successfully');
    },
    insertLine(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        MessageBox.prompt("Add one line before", "Insert", {closeOnClickModal: false}).then(response => {
          const text = response.value;
          const identifier = nanoid();
          const lyric = {
            id: identifier,
            text: text
          };
          this.currentEpisode.lyrics.splice(index, 0, lyric);
          this.$store.dispatch("save");
          
          // Auto-save to file
          this.saveSubtitleToFile(this.currentEpisode);
        });
      }
    },
    addEmptyLineAbove(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        const identifier = nanoid();
        const emptyLyric = {
          id: identifier,
          text: ''
        };
        this.currentEpisode.lyrics.splice(index, 0, emptyLyric);
        this.$store.dispatch("save");
        
        // Auto-save to file
        this.saveSubtitleToFile(this.currentEpisode);
      }
    },
    addEmptyLineBelow(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        const identifier = nanoid();
        const emptyLyric = {
          id: identifier,
          text: ''
        };
        this.currentEpisode.lyrics.splice(index + 1, 0, emptyLyric);
        this.$store.dispatch("save");
        
        // Auto-save to file
        this.saveSubtitleToFile(this.currentEpisode);
      }
    },
    indexOfRow(row) {
      return this.currentEpisode.lyrics.findIndex((element) => {
        return (element.id === row.id);
      });
    },
    currentChanged(row) {
      this.$store.dispatch("showSubtitle", {episodeId: this.$route.params.id, lyricsId: row.id});
    },
    rename() {
      MessageBox.prompt("a new name for this subtitle?", "Rename", {inputValue: this.currentEpisode.title}).then(response => {
          const title = response.value;
          this.currentEpisode.title = title;
          this.$store.dispatch("save");
          
          // Auto-save to file
          this.saveSubtitleToFile(this.currentEpisode);
        });
    },
    deleteEpisode() {
      MessageBox.confirm("Are you sure to delete this subtitle?", "Confirm").then(() => {
        const index = this.episodes.indexOf(this.currentEpisode);
        if (index>=0) {
          this.$router.push("/");
          this.episodes.splice(index, 1);
        }
      });
    },
    removeAllSymbols() {
      if (!this.importText) return;
      
      // Remove symbols only at the end of each line, preserve empty lines
      this.importText = this.importText
        .split('\n')
        .map(line => {
          // If line is empty or only whitespace, keep it as is
          if (line.trim() === '') {
            return line;
          }
          // Remove punctuation and symbols from the end of the line only
          return line.replace(/[^\w\u4e00-\u9fff\s]+$/, '').trim();
        })
        .join('\n');
    },
    removeEmptyLines() {
      if (!this.importText) return;
      
      // Remove all empty lines (lines with only whitespace)
      this.importText = this.importText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .join('\n');
    },
    breakLongLines() {
      if (!this.importText) return;
      
      const lines = this.importText.split('\n');
      const brokenLines = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        const lineLength = this.getEffectiveLineLength(trimmedLine);
        
        if (lineLength <= this.maxLineLength) {
          brokenLines.push(trimmedLine);
        } else {
          // Break the line into smaller parts
          const parts = this.breakLineIntoParts(trimmedLine, this.maxLineLength);
          brokenLines.push(...parts);
        }
      }
      
      this.importText = brokenLines.join('\n');
    },
    getEffectiveLineLength(text) {
      // Chinese characters count as 1, ASCII characters count as 0.5
      let length = 0;
      for (const char of text) {
        if (this.isChinese(char)) {
          length += 1;
        } else {
          length += 0.5;
        }
      }
      return Math.ceil(length);
    },
    isChinese(char) {
      // Check if character is in Chinese Unicode ranges
      const code = char.charCodeAt(0);
      return (code >= 0x4e00 && code <= 0x9fff) ||
             (code >= 0x3400 && code <= 0x4dbf) ||
             (code >= 0x20000 && code <= 0x2a6df);
    },
    breakLineIntoParts(line, maxLength) {
      const parts = [];
      let currentPart = '';
      let currentLength = 0;
      
      for (const char of line) {
        const charLength = this.isChinese(char) ? 1 : 0.5;
        
        if (currentLength + charLength > maxLength && currentPart.trim()) {
          parts.push(currentPart.trim());
          currentPart = char;
          currentLength = charLength;
        } else {
          currentPart += char;
          currentLength += charLength;
        }
      }
      
      if (currentPart.trim()) {
        parts.push(currentPart.trim());
      }
      
      return parts;
    },
    async saveSubtitleToFile(episode) {      
      // Check if export path is set
      if (!this.$store.state.settings.subtitleExportPath) {
        return; // Silent fail if no export path set
      }
      
      try {
        // Convert episode to text format
        let content = `${episode.title}\n`;
        content += '====\n\n';
        
        if (episode.lyrics && episode.lyrics.length > 0) {
          episode.lyrics.forEach((lyric) => {
            content += `${lyric.text || ''}\n`;
          });
        } else {
          content += '(No subtitles added yet)\n';
        }
        
        // Create safe filename
        const safeFileName = episode.title.replace(/[<>:"/\\|?*]/g, '_') + '.txt';
        const path = require('path');
        const filePath = path.join(this.$store.state.settings.subtitleExportPath, safeFileName);
        
        // Save file
        const result = await ipcRenderer.invoke('saveSubtitleFile', {
          filePath: filePath,
          content: content
        });
        
        if (result.success) {
          // Subtitle saved successfully
        } else {
          console.error('Failed to save subtitle file:', result.error);
        }
      } catch (error) {
        console.error('Error saving subtitle to file:', error);
      }
    },
    async saveToFile() {
      // Check if export path is set
      if (!this.$store.state.settings.subtitleExportPath) {
        this.$message.warning('Please set subtitle export folder in Preferences first');
        return;
      }
      
      try {
        // Convert episode to text format without line numbers
        let content = `${this.currentEpisode.title}\n`;
        content += '====\n\n';
        
        if (this.currentEpisode.lyrics && this.currentEpisode.lyrics.length > 0) {
          this.currentEpisode.lyrics.forEach((lyric) => {
            content += `${lyric.text || ''}\n`;
          });
        } else {
          content += '(No subtitles added yet)\n';
        }
        
        // Create safe filename
        const safeFileName = this.currentEpisode.title.replace(/[<>:"/\\|?*]/g, '_') + '.txt';
        const path = require('path');
        const filePath = path.join(this.$store.state.settings.subtitleExportPath, safeFileName);
        
        // Save file
        const result = await ipcRenderer.invoke('saveSubtitleFile', {
          filePath: filePath,
          content: content
        });
        
        if (result.success) {
          this.$message.success(`Subtitle saved: ${safeFileName}`);
        } else {
          this.$message.error('Failed to save subtitle file: ' + result.error);
        }
      } catch (error) {
        this.$message.error('Error saving subtitle to file');
        console.error('Error saving subtitle to file:', error);
      }
    }
  },
};
</script>

<style scoped>

</style>