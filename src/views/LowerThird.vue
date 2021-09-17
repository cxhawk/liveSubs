<template>
  <div>
    <el-row :gutter="10" type="flex" justify="end">
      <el-col>
        <el-button icon="el-icon-close" size="small" type="danger" @click="clear" :disabled="currentLowerThirdId === null"
          >Clear
        </el-button>
      </el-col>
      <el-col style="width: 110px">
        <el-button icon="el-icon-plus" size="small" @click="importLines"
          >Import
        </el-button>
      </el-col>
      <el-col style="width: 110px">
        <el-popconfirm title="Are you sure？" @confirm="removeAll">
          <el-button icon="el-icon-delete" size="small" slot="reference"
            >Remove All</el-button
          >
        </el-popconfirm>
      </el-col>
    </el-row>
    <span style="font-size: 12px; color: gray">Click to show a line, press spacebar go next or ⌘ + ←/→ to move around</span>
    <el-table
      :data="lowerThirds"
      style="width: 100%; margin-top: 10px"
      v-if="lowerThirds"
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
          <el-button @click="insertLine(scope.row, $event)" type="text" size="small" icon="el-icon-s-unfold"
            ></el-button
          >
          <el-button @click="editLine(scope.row, $event)" type="text" size="small" icon="el-icon-edit"
            ></el-button
          >
          <el-button @click="removeLine(scope.row, $event)" type="text" size="small" icon="el-icon-delete"
            ></el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="Import Lines" :visible.sync="importDialogVisible" width="70%">
      <el-input
        type="textarea"
        :autosize="{ minRows: 5, maxRows: 20 }"
        placeholder="one line per item"
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
		<el-dialog title="Item" :visible.sync="editingItem" width="70%" v-if="editingItem">
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
      "currentLowerThirdId",
    ]),
  },
  methods: {
		clear() {
			this.$store.dispatch("showLowerThird", null);
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
            newItems.push({ id: nanoid(), title: line });
          }
          this.lowerThirds = this.lowerThirds.concat(newItems);
          this.$store.dispatch("save");
        }
      }
      this.importText = "";
    },
    removeAll() {
      this.lowerThirds = [];
      this.$store.dispatch("save");
    },
    removeLine(row, event) {
      event.stopPropagation();
      const index = this.indexOfRow(row);
      if (index >= 0) {
        this.lowerThirds.splice(index, 1);
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
			if (this.lowerThirds.includes(this.editingItem) === false) {
				this.lowerThirds.splice(this.insertingIndex, 0, this.editingItem);
				this.insertingIndex = 0;
			}
			this.$store.dispatch("save");
			this.editingItem = null;
		},
    indexOfRow(row) {
      return this.lowerThirds.findIndex((element) => {
        return (element.id === row.id);
      });
    },
    currentChanged(row) {
      this.$store.dispatch("showLowerThird", row.id);
    },
  },
};
</script>

<style scoped>

</style>