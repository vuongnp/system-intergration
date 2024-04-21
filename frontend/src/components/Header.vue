<template>
  <a-row>
    <!-- <a-col :span="3">
      <a-icon
        class="trigger"
        :type="collapsed ? 'menu-unfold' : 'menu-fold'"
        @click="() => $emit('collapsed')"
      />
    </a-col> -->
    <a-col :xl="3" lg="4" :offset="21">
      <a-popconfirm placement="left" ok-text="Yes" cancel-text="No">
        <template slot="title">
          <p>Sign out ?</p>
        </template>
        <!-- <a-button></a-button> -->
        <div class="user-account">
            <a-avatar>
            <a-icon slot="icon" type="user" />
          </a-avatar>
          <span> Username </span>
        </div>
      </a-popconfirm>
    </a-col>
  </a-row>
</template>

<script>
export default {
  props: ["collapsed"],
  data() {
    return {};
  },
  methods: {},
};
</script>
<style scoped>
.user-account:hover {
  cursor: pointer;
  color: #1890ff;
}
</style>
