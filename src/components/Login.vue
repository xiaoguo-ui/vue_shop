<template>
    <div class="login-container">
        <!-- 盒子 -->
        <div class="login-box">
            <!-- 头像 -->
            <div class="avatar-box">
                <img src="../assets/logo.png" alt="头像">
            </div>
            <!-- 登录表单 -->
            <div class="form-box">
                <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
                    <!-- 用户名 -->
                    <el-form-item prop="username">
                        <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                    </el-form-item>
                    <!-- 密码 -->
                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
                    </el-form-item>
                    <!-- 按钮 -->
                    <el-form-item class="form-button">
                        <el-button type="primary" @click="login">登录</el-button>
                        <el-button type="info" @click="resetLoginForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
export default {

  data () {
    return {
      // 登录表单数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单验证
      loginFormRules: {
        // 用户名
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    // 登录
    login () {
    // 验证
      this.$refs.loginFormRef.validate(async (valid) => {
        // 失败
        if (!valid) return ''
        // 发送请求
        const { data: res } = await this.$http.post('/login', this.loginForm)
        // 匹配
        if (res.meta.status === 200) {
        // 保存在session中
          window.sessionStorage.setItem('token', res.data.token)
          this.$message.success('登录成功')

          this.$router.push('/home')
        } else {
          this.$message.error('登录失败')
        }
      })
    },
    // 重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
// 背景颜色
.login-container {
    background-color: #2b4b6b;
    height:100%;
    // 登录盒子
    .login-box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        // 头像盒子
        .avatar-box{
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;

            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }
        // 表单
        .form-box{
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
            .form-button{
                display: flex;
                justify-content: flex-end;
            }
        }
    }
}
</style>
