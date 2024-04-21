<template>
  <div class="flex justifi-space-beetwen" style="padding: 4px 16px">
    <div class="description-pane">
      <div class="description-item"><b>Name: </b> {{ selectedItem.name }}</div>
      <div class="description-item">
        <b>Description:</b> {{ selectedItem.description }}
      </div>
    </div>
    <div>
      <div class="description-item">
        <b> Deadline: </b> {{selectedItem.deadline | shortTime}}
      </div>
      <div class="description-item">
        <a-button v-if="selectedItem.owner.username === username"
        type="button" :icon="'edit'" @click="()=> $store.commit('exercise/setVisibleModal', true)">Edit</a-button>
        <a-button v-else type="button" :icon="'edit'" @click="()=> $store.commit('exercise/setVisibleModalSubmit', true)">Upload answer</a-button>
      <a-button v-if="selectedItem.owner.username === username" type="button" icon="delete" style="margin-left: 15px" @click="() => $store.dispatch('exercise/deleteExercise')"></a-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { shortTime } from '../../utils/filters';
export default {
  data(){
    return{
        username: localStorage.username,
    }
  
  },
  filters: {
    shortTime: shortTime
  },
  computed: {
    ...mapState({
      selectedItem: (state) => state.exercise.selectedItem,
    }),
  },
  methods:{
    //   ...mapMutations(['exercise/setVisibleModal'])
  }
};
</script>
<style scoped>
.description-item {
  margin: 8px;
}
</style>
