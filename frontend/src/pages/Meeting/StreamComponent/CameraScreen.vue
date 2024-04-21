<template>
  <a-row class="video-row camera-screen">
    <div class="video">
      <div v-if="videoUser" style="position: relative">
        <video
          width="210px"
          height="140px"
          :srcObject.prop="videoUser"
          autoplay
        ></video>
        <div class="username-video">
          <p>
            {{ username }}
          </p>
        </div>
      </div>

      <div class="img-only" v-else>
        <a-avatar
          icon="user"
          :size="60"
          :src="hostResoucre + '/user/' + username + '.jpg'"
        ></a-avatar>
        <p class="username">{{ username }}</p>
      </div>
    </div>
    <div v-for="(client, id) in listClient" :key="id" class="video">
      <div v-if="client.stream" style="position: relative">
        <video
          width="210px"
          height="140px"
          :srcObject.prop="client.stream"
          autoplay
        ></video>
        <div class="username-video">
          <p>
            {{ client.username }}
          </p>
        </div>
      </div>

      <div class="img-only" v-else>
        <a-avatar
          icon="user"
          :size="60"
          :src="hostResoucre + '/user/' + client.username + '.jpg'"
        ></a-avatar>
        <p class="username">{{ client.username }}</p>
      </div>
    </div>
  </a-row>
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState({
      listClient: (state) => state.meeting.listClient,
      videoUser: (state) => state.meeting.videoUser,
    }),
  },
  data() {
    return {
      hostResoucre: process.env.VUE_APP_HOST_RESOURCE,
      username: localStorage.username,
    };
  },
  created() {
    // console.log(this);
  },
  // watch: {
  //   videoUser: (value) => {
  //     return value;
  //   },
  //   listClient: (value) => {
  //     console.log(value);
  //     // this.$refs.video.srcObject = value[0].stream;
  //     // console.log("render");
  //     return value;
  //   },
  // },
};
</script>
<style scoped>
.video-row {
  display: flex;
  overflow-x: scroll;
  /* width: 1vw; */
}
.video {
  margin: 5px 5px 0 5px;
  background: #fff;
  border: 1px;
  border-radius: 3px;
  height: 140px;
  width: 210px;
}
.img-only {
  padding: 35px 75px 30px 75px;
}
.username-video {
  position: absolute;
  color: white;
  bottom: 0px;
  width: 100%;
  margin-bottom: 6px;
  display: flex;
  justify-content: center;
}
.username-video > p {
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 16px;
  text-align: center;
  border-radius: 3px;
  margin-bottom: 0;
}
.username {
  text-align: center;
  position: relative;
  z-index: 5;
  bottom: 0;
  margin: 0;
  /* right: 0; */
}
</style>