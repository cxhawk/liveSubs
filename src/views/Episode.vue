<template>
  <div>
    <el-row :gutter="10" type="flex" justify="end">
      <el-col>
        <span style="font-size: 15px">{{ currentEpisode.title }}</span>
      </el-col>
      <el-col style="width: 110px">
        <el-button icon="el-icon-plus" size="small" @click="importLines"
          >Import
        </el-button>
      </el-col>
      <el-col style="width: 110px">
        <el-popconfirm title="Are you sure？" @confirm="removeAll">
          <el-button icon="el-icon-delete" size="small" slot="reference"
            >Clear</el-button
          >
        </el-popconfirm>
      </el-col>
    </el-row>
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
      <el-table-column fixed="right" label="Action" width="100">
        <template slot-scope="scope">
          <el-button @click="insertLine(scope.row)" type="text" size="small" icon="el-icon-s-unfold"
            ></el-button
          >
          <el-button @click="editLine(scope.row)" type="text" size="small" icon="el-icon-edit"
            ></el-button
          >
          <el-button @click="removeLine(scope.row)" type="text" size="small" icon="el-icon-delete"
            ></el-button
          >
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
    <el-dialog title="Import Lines" :visible.sync="importDialogVisible" width="70%">
      <el-input
        type="textarea"
        :autosize="{ minRows: 5, maxRows: 20 }"
        placeholder="请输入内容"
        v-model="importText"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false" size="small"
          >Cancel</el-button
        >
        <el-button type="primary" @click="importConfirm" size="small"
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

export default {
  data() {
    return {
      importDialogVisible: false,
      importText: "",
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
            newLyrics.push({ id: nanoid(), text: line });
          }
          if (Array.isArray(this.currentEpisode.lyrics)) {
            this.currentEpisode.lyrics =
              this.currentEpisode.lyrics.concat(newLyrics);
          } else {
            this.currentEpisode.lyrics = newLyrics;
          }
          this.$store.dispatch("save");
        }
      }
      this.importText = "";
    },
    removeAll() {
      this.currentEpisode.lyrics = [];
      this.$store.dispatch("save");
    },
    removeLine(row) {
      console.log(row);
      const index = this.indexOfRow(row);
      if (index >= 0) {
        this.currentEpisode.lyrics.splice(index, 1);
        this.$store.dispatch("save");
      }
    },
    insertLine(row) {
      const index = this.indexOfRow(row);
      if (index >= 0) {
        MessageBox.prompt("Add one line before", "Insert").then(response => {
          const text = response.value;
          const identifier = nanoid();
          const lyric = {
            id: identifier,
            text: text
          };
          this.currentEpisode.lyrics.splice(index, 0, lyric);
          this.$store.dispatch("save");
        });
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
    }
  },
};
</script>

<style scoped>

</style>