<template>
    <div>
        <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="catelist"
            :props="cateProps"
            v-model="selectedCateKeys"
            clearable
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" @click="addDialogVisible=true">添加属性</el-button>
          <el-table :data="onlyData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      // 分类数据
      catelist: [],
      // 级联的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联绑定的ID数组
      selectedCateKeys: [],
      // 激活标签
      activeName: 'many',
      // 动态属性面板
      manyData: [],
      // 静态属性面板
      onlyData: [],
      // 展示添加的对话框
      addDialogVisible: false,
      // 添加的表单数据
      addForm: {},
      // 添加表单的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 展示修改对话框
      editDialogVisible: false,
      // 修改的表单数据
      editForm: {},
      // 修改表单的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 计算级联选的ID
    cateId () {
      // 是第三项
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 计算title 的属性
    titleText () {
      if (this.activeName === 'many') {
        return '动态属性'
      }
      return '静态属性'
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //   级联选择器事件
    handleChange () {
      this.getParamData()
    },
    // tab 变动处理的函数
    handleTabClick () {
      this.getParamData()
    },
    // 对话框的关闭事件
    addDialogClosed () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 重置修改的表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 显示编辑
    async showEditDialog (id) {
      // 请求
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`, { params: { attr_sel: this.activeName } }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      // 赋值
      this.editForm = res.data
      this.editDialogVisible = true
    },

    /* -------------------------------------- */
    // 获取商品的列表
    async getCateList () {
      //  请求
      const { data: res } = await this.$http.get('categories')
      //   失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.meg)
      // 赋值
      this.catelist = res.data
    },
    // 获取参数列表
    async  getParamData () {
      // 只允许选择三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
      }
      // 请求
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      // 失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 判断属于哪一个分类下的
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }

      console.log(this.onlyData)
    },
    // 添加参数
    addParams () {
      // 预先验证
      this.$refs.addFormRef.validate(async (vaild) => {
        if (!vaild) return
        // 验证成功的请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        // 请求失败
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 成功
        this.$message.success(res.meta.msg)
        // 隐藏对话框
        this.addDialogVisible = false
        // 获取所有参数
        this.getParamData()
      })
    },
    // 修改参数信息
    editParams () {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 请求
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        console.log(res)
        // 请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }

        this.$message.success('修改参数成功！')
        this.getParamData()
        this.editDialogVisible = false
      })
    },
    removeParam (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 删除的业务逻辑
        const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
        )

        if (res.meta.status !== 200) return this.$message.error('删除参数失败！')

        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        // 获取参数
        this.getParamData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }

  }
}
</script>

<style lang="less" scoped>
.el-card ,.el-table{
    margin-top: 15px;
}

</style>
