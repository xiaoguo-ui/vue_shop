<template>
    <div>
         <!-- 面包屑导航 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 主体内容 -->
        <el-card>
            <el-button type="primary" @click="()=> addRoleDialogVisible = true">添加角色</el-button>
            <!-- 表格 -->
            <el-table :data="roleList"  width="100%" stripe border>
                <!-- 权限列表 -->
                <el-table-column type="expand" width="50px">
                    <template slot-scope="scope">
                        <el-row :class="['el-row-bottom',index1 === 0 ? 'el-row-top' : '']" v-for="( item1,index1 ) in scope.row.children" :key="item1.id">
                            <!-- 一级 -->
                            <el-col :span="5">
                                <el-tag>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级，三级 -->
                            <el-col :span="19">
                                <el-row  v-for="(item2) in item1.children " :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeAuth(scope.row,item2)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                         <el-tag
                                            closable
                                            type="warning"
                                            v-for="(item3) in item2.children "
                                            :key="item3.id"
                                            @close="removeAuth(scope.row,item3)"
                                            >{{item3.authName}}
                                            </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName"  label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc"  label="角色描述"></el-table-column>
                <!-- 操作 -->
                <el-table-column  label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRight(scope.row)"> 分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

         <!-- 添加角色 -->
        <el-dialog
            title="提示"
            :visible.sync="addRoleDialogVisible"
            width="30%"
            >
            <!-- 主体区域 -->
            <el-form ref="addRoleFormRef" :model="addRoleForm" label-width="80px" :rules="addRolesFormRules">
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>

                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addRoleDialogVisible  = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
          <!-- 编辑角色 -->
        <el-dialog
            title="提示"
            :visible.sync="editRoleDialogVisible"
            width="30%"
            @close="()=> this.$refs"
            >
             <el-form ref="editRoleFormRef" :model="editRoleForm" label-width="80px" :rules="addRolesFormRules">
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
             </el-form>
                <span slot="footer">
                <el-button @click="editRoleDialogVisible  = false">取 消</el-button>
                <el-button type="primary" @click="saveEditRole(editRoleForm.id)">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限 -->
        <el-dialog
            title="提示"
            :visible.sync="setRightDialogVisible"
            width="30%"
            @close="defKey = []"
            >
            <el-tree
                :data="rightList"
                :props="rightProp"
                show-checkbox node-key="id"
                default-expand-all
                :default-checked-keys="defKey"
                ref="rightTreeRef"
                ></el-tree>
            <span slot="footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRight">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表
      roleList: [],
      // 所有权限列表
      rightList: [],
      // 树形控件绑定对象
      rightProp: {
        label: 'authName',
        children: 'children'
      },
      defKey: [],
      // 显示添加角色对话框
      addRoleDialogVisible: false,
      // 分配权限
      setRightDialogVisible: false,
      // 显示编辑角色
      editRoleDialogVisible: false,
      //   分配权限的ID
      roleId: '',
      //  添加用户信息
      addRoleForm: {},
      editRoleForm: {},
      // 验证添加角色信息
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    //  获取所有角色列表
    this.getRoleList()
  },

  methods: {
    // 获取所有用户列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) this.$message.console.error(res.meta.msg)

      this.roleList = res.data
    },
    // 添加角色
    async addRole () {
      // 预验证
      this.$refs.addRoleFormRef.validate(async (vaild) => {
        if (!vaild) this.$message.error('添加失败')
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        // 添加失败
        if (res.meta.status !== 201) this.$message.error(res.meta.msg)
        // 成功
        this.addRoleDialogVisible = false
        this.$message.success(res.meta.msg)
        this.getRoleList()
      })
    },
    // 删除授权
    removeAuth (row, item3) {
      this.$confirm(`此操作将永久删除${item3.authName}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        //  发送请求
        const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${item3.id}`)
        console.log(res)
        // 失败
        if (res.meta.status !== 200) this.$message.error(res.meta.msg)
        // 获取的是最新的权限
        row.children = res.data
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 设置权限
    async showRight (role) {
      // 设置ID
      this.roleId = role.id
      // 显示对话框
      this.setRightDialogVisible = true
      //  发送请求
      const { data: res } = await this.$http.get('rights/tree')
      // 失败
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      // 赋值
      this.rightList = res.data
      // 显示树组件
      this.getLeafKeys(role, this.defKey)
    },
    // 递归获取树形
    getLeafKeys (node, arr) {
      // 没有children属性，那就是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 设置权限
    async setRight () {
      // 获取选中的ID
      const keys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys()
      ]
      const rids = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: rids })
      // 失败
      if (res.meta.status !== 200) this.$message.error(res.meta.msg)
      // 关闭对话框
      this.setRightDialogVisible = false
      this.$message.success(res.meta.msg)
      // 获取数据
      this.getRoleList()
    },
    // 删除角色
    deleteRole (role) {
      this.$confirm(`此操作将永久删除${role.roleName}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}`)
        if (res.meta.status !== 200) return this.meta.msg
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getRoleList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    showEdit (role) {
      // 显示对话框
      this.editRoleDialogVisible = true
      // 显示数据
      this.editRoleForm = { roleDesc: role.roleDesc, roleName: role.roleName, id: role.id }
    },
    saveEditRole (id) {
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('失败')
        // 请求
        const { data: res } = await this.$http.put(`roles/${id}`, this.editRoleForm)
        // 失败
        if (res.meta.status !== 200) this.$message.error(res.meta.msg)
        // 关闭对话框
        this.editRoleDialogVisible = false
        // 成功
        this.$message.success('更新成功')
        this.getRoleList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-card{
    margin-top: 15px;
}
.el-table {
    margin-top: 15px;
}
.el-row-top {
    border-top: 1px solid #ccc;
}
.el-row-bottom {
    border-bottom: 1px solid #ccc;
}
.el-tag {
    margin: 7px;
}

</style>
