<template>
  <div>
    <img
      :class="dataSharing ? 'img-sharing' : 'img-screen'"
      v-bind:src="dataSharing ? dataSharing : '/meeting_icon.gif'"
    />
    <!-- <a-avatar shape="square" :size="64" icon="user" /> -->
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      dataSharing: (state) => state.meeting.dataSharing,
    }),
  },
};
</script>
<style  scoped>
.img-sharing {
  width: 100%;
  /* height: 100%; */
  max-height: calc(100vh - 170px);
  object-fit: contain;
}
.img-screen {
  /* width:  calc(100% - 300px);  */
  border-radius: 50%;
  width: 200px;
  box-shadow: 0px 0px 20px #1890ff;
  height: 200px;
  object-fit: cover;
}
</style>