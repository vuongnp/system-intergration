<template>
  <!-- <section class="display"> -->
  <div class="container">
    <div v-if="vector === false" class="text-stt">
      No feature vector yet! Update now
    </div>
    <div v-else-if="countface === 1" class="text-ok">
      Feature vector updated
    </div>
    <!-- </div> -->
    <div class="form-upload" v-if="uploaded === false">
      <input
        type="file"
        id="file"
        ref="file"
        v-on:change="handleFileUpload()"
      />
      <button v-on:click="submitImage()" class="btn-submit-img">
        Update
      </button>
    </div>
    <button
      v-if="attendance === true"
      v-on:click="startStream()"
      class="attendance-btn"
    >
      Attendance
    </button>
    <video ref="video" autoplay="true" playsinline />
    <canvas ref="srcCanvas" id="srcCanvas" />
    <div class="show-cam">
      <canvas ref="dstCanvas" id="dstCanvas" />
    </div>
    <div v-if="success === 0" class="result">Failure!</div>
    <div v-else-if="success === 1" class="result">Success!</div>
    <div v-if="countface === 0" class="text-stt">Face not found!</div>
    <div v-else-if="countface === 2" class="text-stt">
      Too many faces in camera!
    </div>
    <div v-else-if="countface === 10" class="text-stt">
      Fake!
    </div>
    <button v-if="success === 0" v-on:click="tryAgain()" class="attendance-btn">
      Try again
    </button>
    <!-- <div class="attendance-btn"> -->

    <!-- <canvas id="canvas" /> -->
  </div>

  <!-- </section> -->
</template>

<script>
import axios from "axios";

let embedding;
const username = localStorage.username;
const CAM_WIDTH = 1080;
const CAM_HEIGHT = 800;
const start_time = new Date().getTime();
let current_time;
let localStream;
let bboxes = [];
const SIM_SCORE = 0.5;
let similarity;
let count = 0;
const roomId = window.location.pathname.split("/")[2];
let stopped = false;
let instance;

const getEmbeddingDatabase = async () => {
  console.log(window.location.pathname.split("/")[2]);
  console.log("Loading embedding");
  await axios
    .get(`http://localhost:5050/get_embedding/${username}`)
    .then((response) => {
      console.log(response);
      if (response.data.code === "200") {
        embedding = response.data.embedding;
        console.log("Embedding loaded");
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
};
var constraints = { video: { width: 640, height: 480 } };
const processImgToServer = (canvasId) => {
  let type = "image/jpeg";
  let imgElement = document.getElementById(canvasId);
  var data = imgElement.toDataURL(type);
  data = data.replace("data:" + type + ";base64,", "");
  return data;
};
const drawAfterDetect = (canvasid, dets) => {
  // console.log("draw", dets.length);
  var canvasDes = document.getElementById(canvasid);
  var context = canvasDes.getContext("2d");
  context.beginPath();
  for (var i = 0; i < dets.length; i++) {
    let x = dets[i][0];
    let y = dets[i][1];
    let w = dets[i][2] - x;
    let h = dets[i][3] - y;
    context.rect(x, y, w, h);
    context.lineWidth = 5;
    context.strokeStyle = "green";
    context.stroke();
  }
};
export default {
  name: "Attendance",
  data() {
    return {
      // roomId: this.$route.params.id,
      file: "",
      uploaded: false,
      countface: -1,
      success: -1,
      attendance: true,
      vector: false,
    };
  },
  methods: {
    tryAgain() {
      window.location.reload();
    },
    submitImage() {
      let formData = new FormData();
      formData.append("file", this.file);
      formData.append("username", username);
      axios
        .post("http://localhost:5050/changedbvector", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(function (response) {
          console.log(response);
          instance.countface = response.data.code;
          if (response.data.code === 1) {
            embedding = response.data.embedding;
            instance.uploaded = true;
            instance.vector = true;
            setInterval(() => {
              window.location.reload();
            }, 2000);
          }
        })
        .catch(function (e) {
          console.log(e);
        });
    },
    async saveLog(){
      let item = {
        username: username,
        timestamp: new Date().getTime(),
        room_id: roomId
      }
      await axios
              .post(`http://localhost:5050/log_attendance`,item)
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.error("There was an error!", error);
              });
    },

    handleFileUpload() {
      this.file = this.$refs.file.files[0];
    },
    async startStream() {
      instance.attendance = false;
      instance.uploaded = true;
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (mediaStream) {
          var video = document.querySelector("video");
          localStream = mediaStream;
          video.srcObject = mediaStream;
          video.onloadedmetadata = function () {
            // console.log(e);
            video.play();
            var srcCanvas = document.getElementById("srcCanvas");
            var dstCanvas = document.getElementById("dstCanvas");
            srcCanvas.width = CAM_WIDTH;
            srcCanvas.height = CAM_HEIGHT;
            dstCanvas.width = CAM_WIDTH;
            dstCanvas.height = CAM_HEIGHT;
            var ctx = srcCanvas.getContext("2d");
            ctx.width = srcCanvas.width;
            ctx.height = srcCanvas.height;
            var ctx_dest = dstCanvas.getContext("2d");
            ctx_dest.width = dstCanvas.width;
            ctx_dest.height = dstCanvas.height;

            setInterval(() => {
              if (!stopped) {
                current_time = new Date().getTime();
                if (current_time - start_time > 40000) {
                  stopped = true;
                  instance.countface = -1;
                  instance.success = 0;
                  localStream.getTracks().forEach((track) => track.stop());
                }
                ctx.drawImage(video, 0, 0, CAM_WIDTH, CAM_HEIGHT);
                var imgstring = processImgToServer("srcCanvas");
                var data = {
                  img: imgstring,
                  username: username,
                  embedding: embedding,
                };
                axios
                  .post(`http://localhost:5050/verify`, data)
                  .then((response) => {
                    // console.log(response);
                    if (response) {
                      bboxes = response.data.dets;
                      if (response.data.code == 0) {
                        // this.setCountface(0);
                        instance.countface = 0;
                        console.log("non-face");
                      } else if (response.data.code == 2) {
                        // this.setCountface(2);
                        instance.countface = 2;
                      }else if (response.data.code == 10) {
                        // this.setCountface(2);
                        instance.countface = 10;
                      } else {
                        instance.countface = -1;
                        similarity = response.data.similarity;
                        if (similarity > SIM_SCORE) {
                          count++;
                        }
                        if (count === 60) {
                          stopped = true;
                          instance.countface = -1;
                          instance.success = 1;
                          localStream
                            .getTracks()
                            .forEach((track) => track.stop());
                          // save log
                          instance.saveLog();
                          setInterval(() => {
                            window.location.href =
                              window.location.origin + "/meeting/" + roomId;
                            // this.$router.push("/meeting/" + this.roomId);
                          }, 5000);
                        }
                      }
                      console.log(count);
                    }
                  })
                  .catch((error) => {
                    console.error("There was an error!", error);
                  });
                // console.log(bboxes);
                ctx_dest.drawImage(srcCanvas, 0, 0, CAM_WIDTH, CAM_HEIGHT);
                drawAfterDetect("dstCanvas", bboxes);
              } else {
                instance.countface = -1;
              }
            }, 100);
          };
        })
        .catch(function (err) {
          console.log(err);
        });
    },
  },
  mounted: function () {
    // console.log(this);
    instance = this;
    instance.vector = getEmbeddingDatabase();
    // this.startStream();
  },
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  // background-color: antiquewhite;
}
.text-ok {
  text-align: center;
  color: green;
  font-size: 22px;
  margin-top: 10px;
}
.text-stt {
  text-align: center;
  color: red;
  font-size: 30px;
  margin-top: 10px;
}
.result {
  text-align: center;
  font-size: 40px;
  font-weight: bold;
  // margin-top: 10px;
}
.form-upload {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.form-upload button {
  width: 15%;
  font-size: 25px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}
.form-upload button:hover {
  width: 15%;
  font-size: 25px;
  border-radius: 5px;
  cursor: pointer;
  background-color: gray;
  margin-bottom: 10px;
}
.attendance-btn {
  width: 20%;
  font-size: 25px;
  margin-left: 40%;
  border-radius: 5px;
  cursor: pointer;
}
.attendance-btn:hover {
  width: 20%;
  font-size: 25px;
  margin-left: 40%;
  border-radius: 5px;
  cursor: pointer;
  background-color: gray;
}
video {
  position: absolute;
  object-fit: cover;
  width: 0px;
  height: 0px;
}
#srcCanvas {
  // position: absolute;
  // z-index: 10;
  width: 1080px;
  height: 800px;
  display: none;
}
.show-cam {
  width: 1080px;
  height: 800px;
  margin: auto;
  margin-top: 50px;
}
#dstCanvas {
  width: 1080px;
  height: 800px;
}
</style>
