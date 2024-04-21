<template>
  <a-list item-layout="horizontal" :data-source="listData">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-list-item-meta :description="item.description">
        <a slot="title" @click="() => handleEditExercise(item)">{{
          item.name
        }}</a>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>
<script>
export default {
  props: ["type", "listData"],
  data() {
    return {};
  },
  methods: {
    handleEditExercise(item) {
      this.$store.dispatch("exercise/fetchOneItem", item?._id);
    },
  },
};
</script>