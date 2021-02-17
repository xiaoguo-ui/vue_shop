<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 主体内容 -->
        <el-card>
            <!-- 表格 -->
            <el-table :data="rightList"  width="100%" stripe border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="authName"  label="权限名称"></el-table-column>
                <el-table-column prop="path"  label="路径"></el-table-column>
                <el-table-column  label="权限等级">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.level == 0">等级一</el-tag>
                    <el-tag type="success" v-else-if="scope.row.level == 1">等级二</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.level == 2">等级三</el-tag>
                  </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
      rightList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      // 失败
      if (res.meta.status !== 200) this.$message.console.error(res.meta.msg)
      // 成功
      this.rightList = res.data
    }
  }

}
</script>

<style lang="less" scoped>
.el-card{
    margin-top: 15px;
}
</style>
