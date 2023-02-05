<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="logo" />
      </div>
      <el-form
        class="login_form"
        ref="login"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            show-password
            @keyup.enter.native="login"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
          <el-button @click="resetForm('login')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm(name) {
      // const name = 'login'
      this.$refs[name].resetFields()
    },
    login() {
      // 登录，用户名和密码发往后端认证。之前，要验证用户名和密码 this.login()
      const name = 'login'
      this.$refs[name].validate(async (valid) => {
        console.log(valid)
        if (valid) {
          // 成功了，发数据到后端
          console.log(this.loginForm)
          const { data: response } = await this.$http.post(
            'login/',
            this.loginForm
          ) // json
          console.log(response) // {code:xxx}
          // 成功了跳转 code 0 undefined ，没有错误看 {code:1, message:'xxxxx'}
          if (response.code) {
            // 失败了
            return this.$message.error(response.message)
          }
          // 成功了 {access:'tokenxxxxx', } localStorage sessionStorage
          // 存储token window
          window.localStorage.setItem('token', response.access)
          this.$router.push('/home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 35%;
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
}
</style>