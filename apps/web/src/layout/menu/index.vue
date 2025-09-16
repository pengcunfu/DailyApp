<template>
  <div
    id="guide"
    class="menu"
    :style="{
      width: store.getters.isCollapse == true ? '' : '200px',
      height: '100%',
      color: themeConfig.textColor,
    }"
  >
    <div class="logo" v-if="!store.getters.isCollapse">
      <img src="../../assets/logo.png" alt="" style="margin-right: 5px" /> BIG
      CUTE
    </div>
    <div class="logo" v-else>
      <img src="../../assets/logo.png" alt="" />
    </div>
    <el-scrollbar style="height: 100%">
      <el-menu
        :default-active="activeMenu"
        :router="true"
        :collapse="store.getters.isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        :background-color="themeConfig.backgroundColor"
        :text-color="themeConfig.textColor"
        :active-text-color="themeConfig.primary"
      >
        <menuItems :menuList="menuList"></menuItems>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getMenuList } from '@api/apis.js'
import store from '../../store/index.js'
import menuItems from './components/menuItems.vue'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute()
const activeMenu = computed(() => {
  return route.path
})
const menuList = ref([])
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
const themeConfig = store.getters.themeConfig

// 临时硬编码菜单数据用于测试
const defaultMenuList = [
  {
    id: 1,
    name: "首页",
    path: "/home",
    icon: "House",
    children: []
  },
  {
    id: 2,
    name: "账单管理",
    path: "/bill",
    icon: "Money",
    children: [
      {
        id: 21,
        name: "账单列表",
        path: "/bill/index",
        icon: "List"
      },
      {
        id: 22,
        name: "消费统计",
        path: "/bill/statistics",
        icon: "TrendCharts"
      }
    ]
  },
  {
    id: 3,
    name: "待办事项",
    path: "/todo",
    icon: "Calendar",
    children: [
      {
        id: 31,
        name: "待办列表",
        path: "/todo/index",
        icon: "List"
      }
    ]
  }
];

onMounted(() => {
  // 首先设置默认菜单
  menuList.value = defaultMenuList;
  console.log('Default menu set:', menuList.value);
  
  // 然后尝试从API获取
  getMenuList().then((res) => {
    console.log('Menu API response:', res);
    const apiMenuList = res.data.menuList || res.data.data?.menuList || [];
    if (apiMenuList.length > 0) {
      menuList.value = apiMenuList;
      console.log('API menu loaded:', menuList.value);
    }
  }).catch((error) => {
    console.error('Failed to load menu:', error);
    console.log('Using default menu instead');
  })
})
</script>

<style scoped lang="scss">
.menu {
  // width: 200px;
  .logo {
    height: 48px;
    line-height: 48px;
    padding: 0 20px;
    list-style: none;
    cursor: pointer;
    position: relative;
    img {
      width: 25px;
      vertical-align: middle;
    }
  }
}
</style>
