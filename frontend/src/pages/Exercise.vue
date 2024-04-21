<template>
  <div>
    <exercise-modal :group_id="group_id" />
    <submit-file :group_id="group_id" />
    <evaluate-modal />
    <a-row>
      <a-col :xl="6" :lg="8">
        <a-card title="Assignments" :bordered="false">
          <div slot="extra">
            <a-button
              type="button"
              @click="
                () => {
                  $store.commit('exercise/resetFormData');
                  setVisibleModal(!visibleModal);
                }
              "
            >
              <a-icon type="plus"></a-icon>
            </a-button>
          </div>

          <a-collapse
            :bordered="false"
            class="list-exercise list-exercise-pane"
            v-model="activeKey"
          >
            <a-collapse-panel key="1" header="Current Assignments">
              <list-exercise
                :type="'CURRENT'"
                :listData="getExerciseByType('CURRENT')"
              />
            </a-collapse-panel>
            <a-collapse-panel key="2" header="Assignents expried">
              <list-exercise
                :type="'EXPIRED'"
                :listData="getExerciseByType('EXPIRED')"
              />
            </a-collapse-panel>
          </a-collapse>
        </a-card>
      </a-col>
      <a-col :xl="18" :lg="16">
        <a-card title="Detail" :bordered="false" :loading="spinning">
          <div slot="extra" style="min-height: 32px">

          </div>
          <div v-if="selectedItem != null" class="list-exercise">
            <exercise-header />
            <list-submit />
          </div>
          <div v-else class="list-exercise">
            <a-empty />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import moment from "moment";
import { mapMutations, mapState } from "vuex";
import ExerciseModal from "./Exercise/ExerciseModal/ExerciseModal.vue";
import ListExercise from "./Exercise/ListExercise.vue";
import ListSubmit from "./Exercise/ListSubmit.vue";
import ExerciseHeader from "./Exercise/ExerciseHeader.vue";
import SubmitFile from "./Exercise/ExerciseModal/SubmitFile.vue";
import EvaluateModal from "./Exercise/ExerciseModal/EvaluateModal.vue";

export default {
  components: {
    ListSubmit,
    ListExercise,
    ExerciseModal,
    ExerciseHeader,
    SubmitFile,
    EvaluateModal,
  },
  data() {
    return {
      text: `welcome guest in many households across the world.`,
      activeKey: ["1"],
      group_id: this.$route.params.id,
      listExerciseCurrent: [],
      listExerciseExpired: [],
    };
  },
  computed: {
    ...mapState({
      visibleModal: (state) => state.exercise.visibleModal,
      spinning: (state) => state.exercise.spinning,
      selectedItem: (state) => state.exercise.selectedItem,
      listExercise: (state) => state.exercise.listExercise,
    }),
  },
  watch: {
    listExercise(value) {
      let currentTime = moment().valueOf();
    },
  },
  created() {
    this.$store.commit("exercise/setSelectedGroupId", this.group_id);
    this.$store.dispatch("exercise/fetchAllExercise", this.group_id);
  },
  methods: {
    ...mapMutations({
      setVisibleModal: "exercise/setVisibleModal",
    }),
    getExerciseByType(type) {
      let currentTime = moment().valueOf();
      if (type === "CURRENT")
        return this.listExercise?.filter((e) => e.deadline >= currentTime);
      else return this.listExercise?.filter((e) => e.deadline < currentTime);
    },
  },
};
</script>
<style scoped>
.ant-card-body {
  padding: 0px 0px 0px 0px !important ;
}
.ant-card-head-title {
  min-height: 64px  !important;
}
.ant-collapse{
  background: transparent;
}
/* .list-exercise-pane {
  width: 350px;
} */

.list-exercise {
  height: calc(100vh - 150px);
  overflow: auto;
}
</style>