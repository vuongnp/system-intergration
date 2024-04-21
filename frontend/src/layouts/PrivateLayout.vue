    <template>
  <a-layout id="components-layout-demo-custom-trigger">
    <side-bar />
    <a-layout>
      <!-- <a-layout-header v-if="false" style="background: #fff; padding: 0">
        <Header
          :collapsed="collapsed"
          @collapsed="(e) => (collapsed = !collapsed)"
        />
      </a-layout-header> -->
      <a-layout-content
        :style="{
          background: '#f3f2f1',
          minHeight: '280px',
        }"
      >
        <a-spin size="large" :spinning="false">
          <router-view />
        </a-spin>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import Header from "../components/Header.vue";
import SideBar from "../components/SideBar.vue";
export default {
  components: {
    SideBar,
    Header,
  },
  created() {
    // console.log(this.$route);
  },
  data() {
    return {
      collapsed: true,
    };
  },
};
</script>
<style>
.ant-layout-content {
  margin-left: 0;
  margin-right: 0!;
}
#components-layout-demo-custom-trigger {
  height: 100vh;
}
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
</style>