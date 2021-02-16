<template>
      <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
          <div>
            <span>电商后台管理系统</span>
          </div>
          <el-button @click="logout" type="info">退出</el-button>
        </el-header>
        <!-- 主体区域 -->
        <el-container>
          <!-- 侧边 -->
          <el-aside width="200px">
            <!-- 内容 -->
            <el-menu
              background-color="#333744"
              text-color="#fff"
              active-text-color="#ffd04b"
              unique-opened
              router
              :default-active="activePath">
              <!-- 一级菜单 -->
              <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">

                <template slot="title">
                  <!-- 图标 -->
                  <i :class="iconsObj[item.id]"></i>
                  <span>{{ item.authName }}</span>
                </template>
                <!-- 二级菜单 -->
                 <el-menu-item
                    :index="'/' + itemChild.path"
                    v-for="itemChild in item.children"
                    :key="itemChild.id"
                    @click="saveNavState('/' + itemChild.path)">

                    <template slot="title">
                      <i class="el-icon-menu"></i>
                      <span>{{ itemChild.authName }}</span>
                    </template>
                 </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-aside>
          <!-- 显示区域 -->
          <el-main>
            <!-- 路由占位符 -->
            <router-view></router-view>
          </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      // 图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 二级菜单高亮显示
      activePath: ''

    }
  },

  created () {
    // 获取左侧菜单数据
    this.getMenuList()
    // 解决二级菜单高亮显示
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 保存二级菜单高亮显示
    saveNavState (active) {
      // 保存在session中
      window.sessionStorage.setItem('activePath', active)
      // 点击之后，重新赋值
      this.activePath = active
    },
    // 退出
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转路由
      this.$router.push('/login')
    },
    // 获取左侧菜单数据
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      // 失败
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      // 成功
      this.menuList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  background-color: #373d41;
}

.el-aside {
  background-color: #333744;
}

.el-menu {
  border-right:0;
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

</style>
