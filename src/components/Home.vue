<template>
  <el-container>
    <el-header>
      <div class="logo">
        <img src="../assets/logo.png" alt="logo" />
        <div class="title">马哥教育猛犸运维系统平台</div>
        <i
          :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="isCollapsed = !isCollapsed"
        ></i>
      </div>
      <div>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            {{ user.username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="chgpwd">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <!-- 修改密码框 -->
      <el-dialog
        title="修改密码"
        :visible.sync="chgpwdDialogVisible"
        @close="resetForm('chgpwd')"
      >
        <el-form
          :model="chgpwdForm"
          :rules="chgpwdRules"
          ref="chgpwd"
          label-width="100px"
        >
          <el-form-item label="登录名">{{ user.username }}</el-form-item>
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              type="password"
              v-model="chgpwdForm.oldPassword"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="chgpwdForm.password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass">
            <el-input type="password" v-model="chgpwdForm.checkPass"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="chgpwdDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="chgpwd">确 定</el-button>
        </div>
      </el-dialog>
    </el-header>
    <el-container>
      <el-aside :width="isCollapsed ? '64px' : '210px'">
        <el-menu
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :collapse="isCollapsed"
          :collapse-transition="false"
        >
          <!-- 一级菜单项 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{ item.name }}</span>
            </template>
            <!-- 二级菜单项 循环 -->
            <el-menu-item
              :index="c.path"
              v-for="c in item.children"
              :key="c.id"
            >
              {{ c.name }}
            </el-menu-item>
            <!-- 下一句故意不在循环中 -->
            <el-menu-item index="1-6">选项3</el-menu-item>
          </el-submenu>

          <el-menu-item index="/welcome">
            <i class="el-icon-menu"></i>
            <span slot="title">导航二</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 嵌套路由，路由匹配的组件替换这里，画中画 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    // 组件已经被创建处理了，但是还没有挂到DOM中
    this.getMenuList()
    this.getUserInfo()
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value !== this.chgpwdForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      menulist: [],
      isCollapsed: false,
      user: {}, // 当前用户信息
      chgpwdDialogVisible: false,
      chgpwdForm: {
        password: '',
        oldPassword: '',
        checkPass: ''
      },
      chgpwdRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    logout() {
      window.localStorage.removeItem('token')
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: response } = await this.$http.get('users/menulist/')
      console.log(response)
      // 1 数据如何放到菜单中，
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.menulist = response
      // 2 每一次和后端请求都要使用headers带上token
    },
    async getUserInfo() {
      const { data: response } = await this.$http.get('users/mgr/whoami/') // 当前用户信息，id username logindate
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.user = response.user
    },
    handleCommand(command) {
      console.log(command)
      if (command === 'logout') {
        this.logout()
      } else if (command === 'chgpwd') {
        this.chgpwdDialogVisible = true
      }
    },
    chgpwd() {
      console.log('hhhhhhhhhhhhhhhhhhhh')
      const name = 'chgpwd'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(
            `users/mgr/${this.user.id}/setpwd/`,
            this.chgpwdForm
          )
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.editDialogVisible = false
          this.$message('用户修改成功')
          this.getList(this.pagination.page)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  background-color: #fff;
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 5px;
  .logo {
    display: flex;
    align-items: center;
    img {
      width: 40px;
    }
    .title {
      font-size: 30px;
      margin-left: 5px;
    }
    i {
      font-size: 32px;
      margin-left: 5px;
    }
  }
}

.el-aside {
  background-color: #123;
}

.el-main {
  background-color: #f0f2f5;
}

.el-menu {
  border-right: none;
}
</style>