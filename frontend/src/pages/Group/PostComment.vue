<template>
  <div class="list-item-footer">
    <div>
      <input v-model="comment" placeholder="Enter your answer" />
      <div class="function-btn" @click="submitComment">
        <a-icon type="enter" />
        Reply
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["item", "group_id", "socket"],
  data() {
    return {
      comment: "",
    };
  },
  methods: {
    submitComment() {
      if (this.comment.length)
        this.socket.emit("post-comment", {
          post_id: this.item?._id,
          comment: this.comment,
          group_id: this.group_id,
        });
      this.comment = "";
      // this.$store.dispatch('post/submitComment', this.comment)
    },
  },
};
</script>
<style scoped>
.function-btn:hover {
  cursor: pointer;
  color: #1890ff;
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
