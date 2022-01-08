<template>
  <div>
    <el-row :gutter="10" type="flex" justify="end">
      <el-col>
        <el-tooltip content="deactivate image (⌘+3)" placement="bottom" effect="light">
          <el-button icon="el-icon-close" size="small" type="danger" @click="clear" :disabled="currentImageId === null">Clear</el-button>
        </el-tooltip>
      </el-col>
      <el-col style="width: 120px">
        <el-button icon="el-icon-plus" size="small" @click="importLines">Add Item</el-button>
      </el-col>
      <el-col style="width: 120px">
        <el-popconfirm title="Are you sure？" @confirm="removeAll">
          <el-button icon="el-icon-delete" size="small" slot="reference">Remove All</el-button>
        </el-popconfirm>
      </el-col>
    </el-row>
    <el-table
      :data="images"
      style="width: 100%; margin-top: 10px"
      highlight-current-row
      @current-change="currentChanged"
      ref="table"
      row-key="id"
      :current-row-key="currentImageId"
    >
      <el-table-column type="index" width="50"> </el-table-column>
      <el-table-column label="Preview">
        <template slot-scope="scope">
          <video v-if="isVideo(scope.row.image)" :src="scope.row.image" controls autoplay loop style="height:250px"></video>
          <el-image v-else :src="scope.row.image" fit="scale-down" style="height:250px"></el-image>
        </template>
      </el-table-column>
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
    <el-dialog title="Add Image or Video File(s)" :visible.sync="importDialogVisible" width="70%" :close-on-click-modal="false">
      <el-form>
        <el-form-item v-for="url of importImageURLs" :key="url">
          <video v-if="isVideo(url)" :src="'atom://' + url" controls autoplay loop style="height:250px"></video>
          <el-image v-else :src="'atom://' + url" fit="scale-down" style="height:250px"></el-image>
        </el-form-item>
        <el-form-item><el-button icon="el-icon-folder-opened" @click="locateImages">Browse</el-button></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="importConfirm" size="small">Confirm</el-button>
      </span>
    </el-dialog>
		<el-dialog :title="insertingIndex ? 'Insert' : 'Edit'" :visible.sync="isEditing" width="70%" v-if="isEditing" :close-on-click-modal="false">
      <el-form>
        <el-form-item v-if="editingItem.image"><el-image :src="editingItem.image" fit="contain"></el-image></el-form-item>
        <el-form-item><el-button icon="el-icon-folder-opened" @click="locateImage">Change</el-button></el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editingItem = null" size="small">Cancel</el-button>
        <el-button type="primary" @click="editConfirm" size="small">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";
import { nanoid } from 'nanoid';
const { ipcRenderer } = window.require('electron');

export default {
  data() {
    return {
      importDialogVisible: false,
      importImageURLs: [],
			editingItem: null,
			insertingIndex: 0
    };
  },
  computed: {
    ...mapFields([
      "images",
      "currentImageId",
    ]),
    isEditing() {
      return this.editingItem != null;
    }
  },
  methods: {
		clear() {
			this.$store.dispatch("showImage", {imageId: null});
		},
    importLines() {
      this.importDialogVisible = true;
    },
    importConfirm() {
      this.importDialogVisible = false;
      if (this.importImageURLs.length) {
        for (let url of this.importImageURLs) {
          let newItem = {id: nanoid(), image: "atom://" + url};
          this.images.push(newItem);
        }
        this.$store.dispatch("save");
      }
      this.importImageURLs = [];
    },
    removeAll() {
      this.images = [];
      this.$store.dispatch("save");
    },
    removeLine(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        if (row.id === this.currentImageId) {
          this.clear();
        }
        this.images.splice(index, 1);
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
			if (this.images.includes(this.editingItem) === false) {
				this.images.splice(this.insertingIndex, 0, this.editingItem);
				this.insertingIndex = 0;
			}
      this.$store.dispatch("showImage", {imageId: this.currentImageId}); // update in case text changed
			this.$store.dispatch("save");
			this.editingItem = null;
		},
    indexOfRow(row) {
      return this.images.findIndex((element) => {
        return (element.id === row.id);
      });
    },
    currentChanged(row) {
      this.$store.dispatch("showImage", {imageId: row.id});
    },
    locateImages() {
      ipcRenderer.invoke("openImages").then((paths) => {
        if (paths) {
          console.log("URL: " + paths)
          this.importImageURLs = paths;
        }
      });
    },
    locateImage() {
      ipcRenderer.invoke("openImage").then((path) => {
        if (path) {
          if (this.editingItem) {
            this.editingItem.image = "atom://" + path;
          }
        }
      });
    },
    isVideo(url) {
      const extension = url.split('.').pop().toLowerCase();
      return extension == 'webm';
    }
  },
};
</script>

<style scoped>

</style>