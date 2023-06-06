<template>
  <div>
    <el-row :gutter="10" type="flex" justify="end">
      <el-col>
        <el-tooltip content="deactivate lower third (⌘+1)" placement="bottom" effect="light">
          <el-button icon="el-icon-close" size="small" type="danger" @click="clear" :disabled="currentLowerThirdId === null"
            >Clear
          </el-button>
        </el-tooltip>
      </el-col>
      <el-col style="width: 120px">
        <el-button icon="el-icon-plus" size="small" @click="importLines"
          >Import Items
        </el-button>
      </el-col>
      <el-col style="width: 120px">
        <el-popconfirm title="Are you sure？" @confirm="removeAll">
          <el-button icon="el-icon-delete" size="small" slot="reference"
            >Remove All</el-button
          >
        </el-popconfirm>
      </el-col>
    </el-row>
    <el-table
      :data="currentTemplate.items"
      style="width: 100%; margin-top: 10px"
      v-if="currentTemplate"
      highlight-current-row
      @current-change="currentChanged"
      ref="table"
      row-key="id"
      :current-row-key="currentLowerThirdId"
    >
      <el-table-column type="index" width="50"> </el-table-column>
      <el-table-column prop="title" label="Title"> </el-table-column>
      <el-table-column prop="description" label="Description"> </el-table-column>
      <el-table-column fixed="right" label="Action" width="100">
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
        </template>
      </el-table-column>
    </el-table>
    <el-divider></el-divider>
    <el-form label-position="right" label-width="130px">
      <el-form-item label="Background Image">
        <el-image :src="settings.lowerThirdBg" fit="contain"></el-image>
        <el-input v-model="settings.lowerThirdBg" @change="update" readonly>
          <el-button slot="prepend" @click="resetImage">Default</el-button>
          <el-button slot="append" icon="el-icon-search" @click="locateImage">Browse</el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="Resize if needed">
        <el-switch v-model="settings.lowerThirdResize" @change="update" active-text="repeat the middle 1/3 part of the image"></el-switch>
      </el-form-item>
      <el-form-item label="Center Align">
        <el-switch v-model="settings.lowerThirdCenter" @change="update"></el-switch>
      </el-form-item>
      <el-form-item label="Title Size">
        <el-input-number v-model="settings.lowerThirdTitleFontSize" @change="update" :min="10" :max="100"></el-input-number>
      </el-form-item>
      <el-form-item label="Title Color">
        <el-color-picker v-model="settings.lowerThirdTitleColor" :predefine="['#FFFFFF']" @change="update"></el-color-picker>
      </el-form-item>
      <el-form-item label="Title Offset (X,Y)">
        <el-input-number v-model="settings.lowerThirdTitleX" @change="update" :min="0"></el-input-number>&nbsp;
        <el-input-number v-model="settings.lowerThirdTitleY" @change="update" :min="0" :max="200"></el-input-number>&nbsp;
        <el-switch v-model="settings.lowerThirdTitleCenter" @change="update" active-text="Center"></el-switch>
      </el-form-item>
      <el-form-item label="Description Size">
        <el-input-number v-model="settings.lowerThirdDescriptionFontSize" @change="update" :min="10" :max="100"></el-input-number>
      </el-form-item>
      <el-form-item label="Description Color">
        <el-color-picker v-model="settings.lowerThirdDescriptionColor" :predefine="['#FFFFFF']" @change="update"></el-color-picker>
      </el-form-item>
      <el-form-item label="Description Offset (X,Y)">
        <el-input-number v-model="settings.lowerThirdDescriptionX" @change="update" :min="0"></el-input-number>&nbsp;
        <el-input-number v-model="settings.lowerThirdDescriptionY" @change="update" :min="0"></el-input-number>&nbsp;
        <el-switch v-model="settings.lowerThirdDescriptionCenter" @change="update" active-text="Center"></el-switch>
      </el-form-item>
    </el-form>
    <el-divider></el-divider>
    <el-row style="margin-top: 15px" :gutter="10" type="flex" justify="end">
      <el-col style="width: 90px">
        <el-button size="small" @click="rename">Rename</el-button>
      </el-col>
      <el-col style="width: 90px">
        <el-button type="danger" size="small" @click="deleteEpisode">Delete</el-button>
      </el-col>
    </el-row>
    <el-dialog title="Import Lower Third" :visible.sync="importDialogVisible" width="70%" :close-on-click-modal="false">
      <el-input
        type="textarea"
        :autosize="{ minRows: 5, maxRows: 20 }"
        placeholder="one line per title and description (use space between title and description)"
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
		<el-dialog title="Edit" :visible.sync="isEditing" width="70%" v-if="isEditing" :close-on-click-modal="false">
      <el-input
        placeholder="title"
        v-model="editingItem.title"
      ></el-input>
			<el-input
				type="textarea"
        placeholder="description"
        v-model="editingItem.description"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editingItem = null" size="small"
          >Cancel</el-button
        >
        <el-button type="primary" @click="editConfirm" size="small"
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
			editingItem: null,
			insertingIndex: 0
    };
  },
  computed: {
    ...mapFields([
      "lowerThirds",
      "currentLowerThirdTemplateId",
      "currentLowerThirdId",
    ]),
    currentTemplate() {
      return this.lowerThirds.find((ep) => ep.id === this.$route.params.id);
    },
    settings() {
      return this.currentTemplate.settings;
    },
    isEditing() {
      return this.editingItem != null;
    }
  },
  methods: {
    update() {
      // update template if needed
      this.$store.dispatch("updateSettings");
    },
		clear() {
			this.$store.dispatch("showLowerThird", {templateId:null, itemId:null});
		},
    importLines() {
      this.importDialogVisible = true;
    },
    importConfirm() {
      this.importDialogVisible = false;
      if (this.importText.length) {
        const lines = this.importText.split(/\r?\n/);
        if (lines.length) {
          let newItems = [];
          for (const line of lines) {
            const elements = line.split(" ");
            if (elements.length >= 2) {
              newItems.push({ id: nanoid(), title: elements[0].trim(), description: elements[1].trim() });
            } else {
              newItems.push({ id: nanoid(), title: line.trim()});
            }
          }
          this.currentTemplate.items = this.currentTemplate.items.concat(newItems);
          this.$store.dispatch("save");
        }
      }
      this.importText = "";
    },
    removeAll() {
      this.currentTemplate.items = [];
      this.$store.dispatch("save");
    },
    removeLine(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        if (row.id === this.currentLowerThirdId) {
          this.clear();
        }
        this.currentTemplate.items.splice(index, 1);
        this.$store.dispatch("save");
      }
    },
    editLine(row, event) {
      event.stopPropagation();
			this.editingItem = row;
    },
    insertLine(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
				this.insertingIndex = index;
				this.editingItem = {
					id: nanoid()
				};
      }
    },
		editConfirm() {
			if (this.currentTemplate.items.includes(this.editingItem) === false) {
				this.currentTemplate.items.splice(this.insertingIndex, 0, this.editingItem);
				this.insertingIndex = 0;
			}
      this.$store.dispatch("showLowerThird", this.currentLowerThirdId); // update in case text changed
			this.$store.dispatch("save");
			this.editingItem = null;
		},
    indexOfRow(row) {
      return this.currentTemplate.items.findIndex((element) => {
        return (element.id === row.id);
      });
    },
    currentChanged(row) {
      this.$store.dispatch("showLowerThird", {templateId: this.$route.params.id, itemId: row.id});
    },
    rename() {
      MessageBox.prompt("a new name for this template?", "Rename", {inputValue: this.currentTemplate.title}).then(response => {
        const title = response.value;
        this.currentTemplate.title = title;
        this.$store.dispatch("save");
      });
    },
    deleteEpisode() {
      MessageBox.confirm("Are you sure to delete this template and all it's contents?", "Confirm").then(() => {
        const index = this.lowerThirds.indexOf(this.currentTemplate);
        if (index>=0) {
          this.$router.push("/");
          this.lowerThirds.splice(index, 1);
          this.$store.dispatch("save");
        }
      });
    },
    locateImage() {
      ipcRenderer.invoke("openImage").then((path) => {
        if (path) {
          this.settings.lowerThirdBg = "atom://" + path;
          this.update();
        }
      });
    },
    resetImage() {
      Object.assign(this.currentTemplate.settings, {
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
      });
      this.update();
    }
  },
};
</script>

<style scoped>

</style>