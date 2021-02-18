<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 主体内容 -->
        <el-card>
            <!-- 添加用户 -->
            <el-button type="primary" @click="showAddCate">添加用户</el-button>
            <tree-table
               :data="cateList"
               :columns="columns"
               :selection-type="false"
               :expand-type="false"
               border
               :show-row-hover="false"
               >
               <!-- 是否有效 -->
               <template slot="isOK" slot-scope="scope">
                   <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
                   <i class="el-icon-error" v-else></i>
               </template>
               <!-- 是否排序 -->
               <template slot="order" slot-scope="scope">
                   <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                   <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                   <el-tag type="warning" v-else>三级</el-tag>
               </template>
               <!-- 是否排序 -->
               <template slot="operation">
                   <el-button type="primary" size="mini" >编辑</el-button>
                   <el-button type="danger" size="mini" >删除</el-button>
               </template>
            </tree-table>

            <!-- 分页 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[2, 4, 6, 8]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="30%"
            @close="clearForm"
            >
            <!-- 主体区域 -->
            <el-form ref="addCateFormRef" :model="addCateForm" label-width="80px" :rules="addCateFormRules">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader
                        clearable
                        :multiple="true"
                        expand-trigger="hover"
                        :options="addCateList"
                        :props="casProps"
                        v-model="selectedkeys"
                        @change="parentCateChange">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      cateList: [],
      // 总记录条数
      total: 0,
      // 添加的
      addCateList: [],
      // 显示添加对话框
      addCateDialogVisible: false,
      // 添加表单数据
      addCateForm: {
        cat_name: '',
        cat_pid: '',
        cat_level: ''
      },
      // 级联的基本配置
      casProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: 'true'
      },
      // 选中的父分类
      selectedkeys: [],
      // 表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOK'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ]
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 处理分页
    handleSizeChange (newSize) {
      // 改变分页的大小
      this.queryInfo.pagesize = newSize
      // 获取
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      // 查询分页的条数
      this.queryInfo.pagenum = newPage
      // 重新获取
      this.getCateList()
    },
    // 展示添加对话框
    async showAddCate () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // 失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 成功
      this.addCateList = res.data
      // 显示
      this.addCateDialogVisible = true
    },
    // 添加表单数据的收集
    parentCateChange () {
      // 有选中父分类
      if (this.selectedkeys.length > 0) {
        //  父分类的id
        this.addCateForm.cat_pid = this.selectedkeys[this.selectedkeys.length - 1]
        // 为当前分类等级赋值
        this.addCateForm.cat_level = this.selectedkeys.length
      } else {
        // 没有选中
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 清空表单数据
    clearForm () {
      // 清空表单
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选择器
      this.selectedkeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    /* --------------处理视图-------------- */

    /* --------------获取数据接口------------- */
    // 获取用户数据
    async getCateList () {
      // 请求
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      // 失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 列表数据
      this.cateList = res.data.result
      // 总记录条数
      this.total = res.data.total
    },
    // 添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('失败')
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // 失败
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        console.log(res)
        this.$message.success(res.meta.msg)
        // 关闭对话框
        this.addCateDialogVisible = false
        this.getCateList()
      })
    }
  }
}
</script>

<style lang="less" scoped>

.el-card {
    margin-top: 15px;
}
.el-icon-success {
    color: lightgreen;
}
.el-icon-error {
    color: red;
}
.zk-table {
    margin: 15px 0;
}
</style>
