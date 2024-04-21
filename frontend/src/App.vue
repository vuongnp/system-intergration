<template>
  <div id="app">
      <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
#App{
}
.function-btn :hover {
  cursor: pointer ;
  color: #1890ff;
}
.flex{
  display: flex;
}
.justifi-center{
  justify-content: center;
}
.justifi-space-beetwen{
  justify-content: space-between;
}
.justifi-space-around{
  justify-content: space-around;
}
</style>
