<template>
  <a-modal
    :visible="visibleModalSubmit"
    @cancel="handleClose"
    title="Upload your file"
  >
    <template slot="footer">
      <a-button key="back" @click="handleClose"> Cancel </a-button>
      <a-button
        key="submit"
        type="primary"
        :loading="loading"
        @click="handleOk"
      >
        Confirm
      </a-button>
    </template>
    <a-upload
      :file-list="fileList"
      :remove="handleRemove"
      :mutiple="false"
      :before-upload="beforeUpload"
    >
      <a-button> <a-icon type="upload" />Pick File </a-button>
    </a-upload>
    <!-- <a-button
      type="primary"
      :disabled="fileList.length === 0"
      :loading="uploading"
      style="margin-top: 16px"
      @click="handleUpload"
    >
      {{ uploading ? "Uploading" : "Start Upload" }}
    </a-button> -->
  </a-modal>
</template>
<script>
import { mapState } from "vuex";
export default {
  props: ["group_id"],
  data() {
    return {
      fileList: [],
      uploading: false,
    };
  },
  computed: {
    ...mapState({
      loading: (state) => state.exercise.loading,
      visibleModalSubmit: (state) => state.exercise.visibleModalSubmit,
    }),
  },
  methods: {
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    handleUpload() {},
    handleClose() {
      this.$store.commit("exercise/setVisibleModalSubmit", false);
      // this.$store.dispatch("exercise/resetForm", false);
    },
    handleOk(e) {
      const { fileList } = this;
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("file", file);
      });

     this.$store.dispatch("exercise/submitUpload", formData)
    },
  },
};
</script>