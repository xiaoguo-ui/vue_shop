<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 主体内容 -->
        <el-card>
            <el-row :gutter="20">
                <!-- 搜索框 -->
                <el-col :span="6">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear='getUsersList'>
                        <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
                    </el-input>
                </el-col>
                <!-- 按钮 -->
                <el-col :span="6">
                    <el-button type="primary" @click="()=>addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <el-table :data="userList" width="100%" stripe border>
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column prop="mg_state" label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <!-- 操作 -->
                <el-table-column label="操作">
                    <template slot-scope="scope">
                       <el-button
                        type="primary"
                        icon="el-icon-edit"
                        size="mini"
                        @click="openEditDialog(scope.row.id)"
                        >
                       </el-button>
                       <el-button
                       type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="open(scope.row)"
                       ></el-button>

                       <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRole(scope.row)"> </el-button>
                       </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
             <!-- 分页 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 3, 4]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加对话框 -->
        <el-dialog
            title="提示"
            :visible.sync="addDialogVisible"
            width="30%"
            @close="clearForm"
            >
            <!-- 主体区域 -->
            <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>

                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配角色 -->
        <el-dialog
            title="提示"
            :visible.sync="roleDialogVisible"
            width="30%"
            @colse="selectId  = '',editRole = {}"
            >
            <p>当前用户 : {{editRole.username}}</p>
            <p>当前角色 : {{editRole.role_name}}</p>
            <p>分配新角色 :
              <el-select v-model="selectId" clearable placeholder="请选择">
                <el-option v-for="(item) in roleList" :key="item.id" :label="item.roleName" :value="item.id">
                </el-option>
              </el-select>
            </p>
            <span slot="footer">
                <el-button @click="roleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改用户 -->
        <el-dialog
            title="提示"
            :visible.sync="EditDialogVisible"
            width="30%"
            >
            <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>

                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="EditDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEditUser(editForm.id)">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱
    const checkEmail = (rules, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      // 成功
      if (regEmail.test(value)) cb()

      cb(new Error('邮箱验证失败'))
    }
    // 验证手机号
    const checkMobile = (rules, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      // 成功
      if (regMobile.test(value)) cb()

      cb(new Error('手机验证失败'))
    }
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表
      userList: [],
      // 总条数
      total: 0,
      // 添加对话框的显示
      addDialogVisible: false,
      // 修改对话框
      EditDialogVisible: false,
      // 分配角色
      roleDialogVisible: false,
      // 添加用户数据
      addForm: {
        username: '111111',
        password: '111111',
        email: '123456@qq.com',
        mobile: '15246857895'
      },
      editRole: { },
      // 编辑用户
      editForm: {},
      // 角色列表
      roleList: [],
      selectId: '',
      // 添加的验证规则
      addFormRules: {
        // 用户名
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 手机
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]

      }
    }
  },

  created () {
    this.getUsersList()
  },

  methods: {
    // 清空表单
    clearForm () {
      this.$refs.addFormRef.resetFields()
    },
    // 处理分页
    handleSizeChange (newSize) {
      // 改变分页的大小
      this.queryInfo.pagesize = newSize
      // 获取
      this.getUsersList()
    },
    handleCurrentChange (newPage) {
      // 查询分页的条数
      this.queryInfo.pagenum = newPage
      // 重新获取
      this.getUsersList()
    },
    // 显示分配角色的对话狂
    async showRole (role) {
      // 显示
      this.roleDialogVisible = true
      // 赋值
      this.editRole = role
      // console.log(this.editRole)
      // 请求
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      this.roleList = res.data
    },
    // 以上为视图显示
    /** ----------------------------- */
    // 下面为接口数据
    // 获取用户列表
    async getUsersList () {
      // 请求
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      // 失败
      if (res.meta.status !== 200) this.$message.console.error(res.meta.msg)
      // 赋值
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 改变用户状态
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      // 失败
      if (res.meta.status !== 200) {
        // 重置
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(this.meta.msg)
      }
      // 成功
      this.$message.success(res.meta.msg)
    },
    // 添加用户
    async addUser () {
      this.$refs.addFormRef.validate(async (vaild) => {
        //   验证失败
        if (!vaild) return ''
        const { data: res } = await this.$http.post('users', this.addForm)
        // 验证成功，添加失败
        if (res.meta.status !== 201) { this.$message.error(res.meta.msg) }
        // 获取成功
        this.$message.success(res.meta.msg)
        // 关闭对话框
        this.addDialogVisible = false
        // 获取全部数据
        this.getUsersList()
      })
    },
    // 获取编辑用户的数据
    async openEditDialog (id) {
      this.EditDialogVisible = true
      const { data: res } = await this.$http.get(`users/${id}`)
      // 失败
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      // 赋值
      this.editForm = res.data
    },
    // 用户修改提交
    saveEditUser (id) {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('失败')
        // 请求
        const { data: res } = await this.$http.put(`users/${id}`, this.editForm)
        // 失败
        if (res.meta.status !== 200) this.$message.error(res.meta.msg)
        // 关闭对话框
        this.EditDialogVisible = false
        // 成功
        this.$message.success(res.meta.msg)

        this.getUsersList()
      })
    },
    // 删除用户
    open (user) {
      this.$confirm(`此操作将永久删除${user.username}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`users/${user.id}`)
        if (res.meta.status !== 200) return this.meta.msg
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getUsersList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 更新角色
    async updateRole () {
      const { data: res } = await this.$http.put(`users/${this.editRole.id}/role`, { rid: this.selectId })
      // 判定为空
      if (!this.selectId) return this.$message.error('请选择要分配的角色')
      // 请求失败
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      // 成功提示
      this.$message.success(res.meta.msg)
      // 隐藏
      this.roleDialogVisible = false
      // 获取列表
      this.getUsersList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
    margin-bottom: 20px;
}
.el-table{
    margin-top: 15px;
}
</style>
