 
<template>
  <div class="post-form">
    <textarea placeholder="Create a new post" v-model="content" />
    <div class="post-form-action">
      <div v-if="fileSend" class="preview-file">
        <div class="flex upload-preview">
          <div>
            <a-icon type="paper-clip" />
            <span style="color: #1890ff">
              {{ fileSend.name | trimNameFile }}</span
            >
          </div>
          <div
            style="padding-left: 8px"
            class="function-btn"
            @click="
              () => {
                fileSend = null;
                $refs.fileupload.value = null;
              }
            "
          >
            <a-icon type="delete"></a-icon>
          </div>
        </div>
      </div>
      <span class="function-btn" style="float: right" @click="handleSubmitPost">
        <a-icon class="action-post-icon" type="right-square"> </a-icon>
      </span>
      <div style="display: flex">
        <div class="function-btn" @click="handleClickUpload">
          <input
            ref="postFileUpload"
            @change="fileChange"
            type="file"
            style="display: none"
          />
          <a-icon type="upload" class="action-post-icon" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { trimNameFile } from '../../utils/filters';
export default {
  props:['socket'],
  filters: {
    trimNameFile: trimNameFile
  },
  data() {
    return {
      roomId: this.$route.params.id,
      fileSend: null,
      uploading: false,
      content: "",
    };
  },

  methods: {
    resetForm(){
      this.fileSend = null;
      this.content = '';
      this.$refs.postFileUpload.values = null;
    },

    handleSubmitPost() {
      this.socket.emit('create-post', {
        group_id: this.roomId,
        content: this.content,
        file: this.fileSend
      });
      this.resetForm();
      // this.$store.dispatch("post/submitCreatePost", {
            //     file: this.fileSend,
            //     content: this.content,
            //     group_id: this.roomId
            // })
    },
    handleClickUpload() {
      this.$refs.postFileUpload.click();
    },
    fileChange(event) {
      var input = event.target.files;
      const reader = new FileReader();
      reader.readAsDataURL(input[0]);
      reader.onload = (e) => {
        this.fileSend = {
          name: event.target.files[0].name,
          content: e.target.result,
        };
      };
    },
  },
};
</script>

<style scoped>
.preview-file {
  position: absolute;
  bottom: 100%;
  width: 100%;
}
.post-form {
  position: absolute;
  background: rgb(243, 242, 241);
  bottom: 0;
  width: calc(100% - 300px);
  padding: 16px 48px 8px 78px;
}
input,
textarea {
  position: relative;
  width: 100%;
  padding: 8px 16px 8px 16px;
  border: none;
  outline: none;
  border-bottom: 2px solid #1890ff;
  border-top: 1px solid #e8e8e8;
}
</style>