<template>
  <a-form layout="inline">
    <a-row>
      <div v-if="fileSend" class="preview-file">
        <div class="flex-space-row upload-preview">
          <div>
            <a-icon type="paper-clip" />
            <span style="color: #1890ff">
              {{ fileSend.name | trimNameFile }}</span
            >
          </div>
          <div
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
      <a-form-item>
        <a-textarea
          style="width: 300px; max-height: 51.6px"
          v-model="content"
          @keyup.enter="sendMessage"
        ></a-textarea>
      </a-form-item>
    </a-row>
    <a-row class="space-row">
      <a-col :span="3" id="chooseFile">
        <a-form-item class="function-btn">
          <input
            ref="fileupload"
            @change="fileChange"
            type="file"
            id="selectFile"
            style="display: none"
          />
          <a-icon type="upload" class="action-post-icon" />
        </a-form-item>
      </a-col>
      <a-col :span="3"> </a-col>
      <a-col :span="2" offset="16" @click="sendMessage">
        <a-form-item class="function-btn">
          <a-icon type="right-square" class="action-post-icon" />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>
<script>
import { trimNameFile } from "../../../utils/filters";
export default {
  props: ["chatSocket", "roomId", "username"],
  data() {
    return {
      content: "",
      fileSend: null,
    };
  },
  filters: {
    trimNameFile: trimNameFile,
  },
  mounted() {
    document.getElementById("chooseFile").addEventListener("click", () => {
      document.getElementById("selectFile").click();
    });
  },
  methods: {
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
    sendMessage() {
      const d = new Date();
      const utc = d.toISOString();
      if (this.content.trim() != "" || this.fileSend) {
        if (this.fileSend) {
          this.chatSocket.emit(
            "send-message",
            this.roomId,
            {
              type: "text",
              content: this.content.trim(),
              sender: this.username,
              time: utc,
            },
            this.fileSend
          );
        } else
          this.chatSocket.emit("send-message", this.roomId, {
            type: "text",
            content: this.content.trim(),
            sender: this.username,
            time: utc,
          });
        this.content = "";
        this.$refs.fileupload.value = null;
        this.fileSend = null;
      }
    },
  },
};
</script>
<style  scoped>
.function-btn :hover {
  cursor: pointer;
  color: #1890ff;
}
.preview-file {
  position: absolute;
  bottom: 100%;
  width: 100%;
}
.upload-preview:hover {
  background: #e6f7ff;
}
.flex-space-row {
  padding: 4px 16px;
  margin: 4px 0;
  display: flex;
  justify-content: space-between;
}
.space-row {
  padding: 0 5px 0 5px;
}
</style>