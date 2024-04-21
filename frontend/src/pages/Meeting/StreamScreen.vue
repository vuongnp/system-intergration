<template>
  <div>
    <canvas id="canvas" style="display: none"></canvas>
    <a-row
      type="flex"
      justify="space-around"
      align="middle"
      class="share-screen"
    >
      <share-screen />
    </a-row>
    <camera-screen class="" />
  </div>
</template>
<script>
import { mapState } from "vuex";
import CameraScreen from "./StreamComponent/CameraScreen.vue";
import ShareScreen from "./StreamComponent/ShareScreen.vue";
import io from "socket.io-client";
import { PeerClass } from "./PeerClass";
import SimplePeer from "simple-peer";
// let socket = io.connect(process.env.VUE_APP_HOST_WS_MEETING);
let myPeer = [];
let yourPeer = [];

export default {
  components: { ShareScreen, CameraScreen },
  props: ["roomId"],
  data() {
    return {
      meetingSocket: io.connect(process.env.VUE_APP_HOST_WS_MEETING),
      username: localStorage.username,
      myPeer: [],
      yourPeer: [],
    };
  },
  computed: {
    ...mapState({
      mediaDevice: (state) => state.meeting.mediaDevice,
      isSharing: (state) => state.meeting.isSharing,
    }),
  },
  watch: {
    mediaDevice(value) {
      this.handleGetDevice(value);
      return value;
    },
    isSharing: {
      handler: function (value) {
        if (!value) return;
        let captureStream = null;
        captureStream = navigator.mediaDevices.getDisplayMedia({
          audio: false,
          video: true,
          cursor: "always",
        });
        captureStream
          .then((stream) => {
            var video = document.createElement("video");
            video.autoplay = true;
            video.srcObject = stream;
            var canvas = document.getElementById("canvas");
            canvas.width = 960;
            canvas.height = 540;
            var context = canvas.getContext("2d");
            context.width = canvas.width;
            context.height = canvas.height;
            var running = setInterval(() => {
              context.drawImage(video, 0, 0, context.width, context.height);
              var vid = canvas.toDataURL("image/webp");
              this.meetingSocket.emit("share-screen", {
                group_id: this.roomId,
                data: vid,
              });
              if (!stream.active) {
                this.meetingSocket.emit("stop-share-creen", {
                  group_id: this.roomId,
                });
                clearInterval(running);
              }
            }, 70);
          })
          .catch((err) => console.log(err));
      },
    },
  },
  created() {
    this.meetingSocket.emit("join-room", {
      roomId: this.roomId,
      clientId: this.meetingSocket.id,
      username: this.username,
    });
    this.meetingSocket.on("start-share-screen", (data) => {
      this.$store.commit("meeting/setDataScreen", data);
    });
    this.meetingSocket.on("stop-share-screen", (data) => {
      this.$store.commit("meeting/setDataScreen", null);
      this.$store.commit("meeting/setShareScreen", false);
    });
    this.meetingSocket.on("res-new-client", (data) => {
      this.$store.commit("meeting/pushNewClient", data);
    });
    this.meetingSocket.on("disconnected", (clientId) => {
      this.$store.commit("meeting/removeClient", clientId);
      myPeer = myPeer.filter((e) => e.clientId !== clientId);
      yourPeer = yourPeer.filter((e) => e.clientId !== clientId);
    });
    this.meetingSocket.on("new-client", (data) => {
      if (data.clientId !== this.meetingSocket.id) {
        if (this.$store.state.meeting.videoUser) {
          let newPeer = new PeerClass({
            clientId: data.clientId,
            username: data.username,
            peer: new SimplePeer({
              initiator: true,
              trickle: false,
              stream: this.$store.state.meeting.videoUser,
            }),
          });
          newPeer.peer.on("signal", (token) => {
            this.meetingSocket.emit("on-video", {
              clientId: data.clientId,
              socketId: this.meetingSocket.id,
              username: this.username,
              token: token,
            });
          });
          myPeer.push(newPeer);
        } else {
          this.meetingSocket.emit("res-new-client", {
            clientId: this.meetingSocket.id,
            socketId: data.clientId,
            username: this.username,
          });
        }
        this.$store.commit("meeting/pushNewClient", data);
      }
    });
    this.meetingSocket.on("off-video", (data) => {
      if (data.clientId !== this.meetingSocket.id) {
        this.$store.commit("meeting/resetOneClient", data);
        yourPeer = yourPeer.filter((e) => e.clientId !== data.clientId);
      }
    });
    this.meetingSocket.on("on-video", (data) => {
      let newPeer = new PeerClass({
        clientId: data.clientId,
        peer: new SimplePeer({
          trickle: false,
        }),
        username: data.username,
      });
      newPeer.peer.on("error", (error) => {
        newPeer.close();
      });
      newPeer.peer.signal(data.token);
      newPeer.peer.on("signal", (token) => {
        this.meetingSocket.emit("res-on-video", {
          clientId: this.meetingSocket.id,
          socketId: data.clientId,
          token: token,
          username: this.username,
        });
      });

      newPeer.peer.on("stream", (stream) => {
        this.$store.commit("meeting/setStreamClient", {
          clientId: data.clientId,
          username: data.username,
          stream: stream,
        });
      });

      yourPeer.push(newPeer);
    });

    this.meetingSocket.on("res-on-video", (data) => {
      let peerObj = myPeer.find((e) => e.clientId === data.clientId);
      if (peerObj) peerObj.peer.signal(data.token);
    });
  },
  beforeDestroy() {
    myPeer.forEach((peerObj) => {
      peerObj.peer.destroy();
    });
    yourPeer.forEach((peerObj) => {
      peerObj.peer.destroy();
    });
    this.$store.commit("meeting/resetAllClient");
    this.$store.commit("meeting/stopVideoUser");
    myPeer = [];
    yourPeer = [];
    this.meetingSocket.close();
  },
  methods: {
    handleGetDevice(media) {
      if (this.$store.state.meeting.videoUser) {
        this.$store.commit("meeting/stopVideoUser");
        this.meetingSocket.emit("off-video", {
          roomId: this.roomId,
          clientId: this.meetingSocket.id,
          username: this.username,
        });
        myPeer.forEach((peerObj) => {
          peerObj.peer.destroy();
        });
        myPeer = [];
      }
      if (media.camera || media.micro) {
        navigator.mediaDevices
          .getUserMedia({ audio: media.micro, video: media.camera })
          .then((stream) => {
            this.$store.state.meeting.listClient.forEach((client) => {
              let newPeer = new PeerClass({
                clientId: client.clientId,
                username: client.username,
                peer: new SimplePeer({
                  initiator: true,
                  trickle: false,
                  stream: stream,
                }),
              });
              newPeer.peer.on("error", (error) => {
                newPeer.close();
              });
              newPeer.peer.on("signal", (token) => {
                this.meetingSocket.emit("on-video", {
                  clientId: client.clientId,
                  socketId: this.meetingSocket.id,
                  username: this.username,
                  token: token,
                });
              });
              myPeer.push(newPeer);
            });

            this.$store.commit("meeting/setVideoUser", stream);
          })
          .catch((err) => {});
      }
    },
  },
};
</script>
<style scoped>
.share-screen {
  background: black;
  height: calc(100vh - 170px);
  height: -webkit-calc(100vh - 170px);
  height: -moz-calc(100vh - 170px);
  height: -o-calc(100vh - 170px);
  height: expression(100vh - 170px);
}
.camera-screen {
  height: 170px;
}
</style>