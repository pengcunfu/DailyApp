<template>
  <el-container class="container">
    <el-aside v-if="isFrame" :style="{ backgroundColor: themeConfig.backgroundColor }"
      ><Menu></Menu
    ></el-aside>
    <el-container>
      <el-header v-if="isFrame">
        <Header></Header>
      </el-header>
      <el-main>
        <div class="main-tabs flx-row" v-if="themeConfig.istags">
          <tabs></tabs>
        </div>

        <div class="main-box">
          <router-view :class="{ shake: disabled }"></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup name="layout">
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import store from '../store/index.js'
import Header from './header/index.vue'
import Menu from './menu/index.vue'
import tabs from './Tabs/index.vue'
const themeConfig = store.getters.themeConfig
console.log(themeConfig.backgroundColor)

let router = useRouter()
const disabled = ref(false)
// onMounted(() => {
//   disabled.value = true
//   setTimeout(() => {
//     disabled.value = false
//   }, 1500)
// })

watch(
  () => router.currentRoute.value.path,
  (newValue, oldValue) => {
    console.log('watch', newValue)
    console.log('watch', oldValue)
    if (newValue == oldValue) {
    } else {
      disabled.value = true
      setTimeout(() => {
        disabled.value = false
      }, 1000)
    }
  },
  { immediate: true }
)

let isFrame = ref(true)
onMounted(() => {
  // 始终显示侧边栏和头部，因为这是独立的应用
  isFrame.value = true
})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
