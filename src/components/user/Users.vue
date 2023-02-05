<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="always">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="search"
            class="input-with-select"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getList(1)"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="addDialogVisible = true"
            >增加用户</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="dataList" border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="登录名"> </el-table-column>
        <el-table-column prop="is_active" label="激活">
          <template v-slot="{ row }">
            <el-switch v-model="row.is_active" @change="handleChange(row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="管理员">
          <template #default="{ row }">
            {{ row.is_superuser ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话"> </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.id !== 1"
              content="分配角色"
              placement="bottom"
              effect="light"
            >
              <el-button
                type="info"
                icon="el-icon-user"
                size="mini"
                @click="handleUserAuth(row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              v-if="row.id !== 1"
              content="修改"
              placement="bottom"
              effect="light"
            >
              <el-button
                type="success"
                icon="el-icon-edit"
                size="mini"
                @click="handleUserEdit(row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              v-if="row.id !== 1"
              content="删除"
              placement="bottom"
              effect="light"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleDelUser(row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页栏 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="pagination.page"
        :page-size="pagination.size"
        layout="total, prev, pager, next, jumper"
        :total="pagination.total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      @close="resetForm('edit')"
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="edit"
        label-width="100px"
      >
        <el-form-item label="登录名">
          {{ editForm.username }}
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 增加对话框 -->
    <el-dialog
      title="增加用户"
      :visible.sync="addDialogVisible"
      @close="resetForm('add')"
    >
      <el-form :model="addForm" :rules="addRules" ref="add" label-width="100px">
        <el-form-item label="登录名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="addForm.checkPass"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="addForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="addRoleDialogVisible"
      @close="resetTree"
    >
      <el-tree
        ref="tree"
        node-key="id"
        show-checkbox
        :data="roleList"
        :props="{ label: 'name' }"
        :default-checked-keys="selectedIds"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getList()
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value !== this.addForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      search: '', // alt + shift + f
      dataList: [],
      pagination: { total: 0, size: 20, page: 1 },
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        phone: '',
        email: ''
      },
      addRules: {
        username: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      // 编辑
      editDialogVisible: false,
      editForm: {
        username: '',
        phone: '',
        email: ''
      },
      editRules: {},
      // 用户配置角色
      roleList: [],
      selectedIds: [],
      currentUser: {},
      addRoleDialogVisible: false
    }
  },
  methods: {
    resetForm(name) {
      console.log('+++++++++++++++++')
      this.$refs[name].resetFields()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.getList(val)
    },
    async getList(page = 1) {
      if (!page) {
        page = 1
      }
      const { data: response } = await this.$http.get('users/mgr/', {
        params: { page, search: this.search }
      })
      console.log(response)
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.dataList = response.results
      this.pagination = response.pagination
    },
    add() {
      console.log(this.addForm)
      const name = 'add'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(
            'users/mgr/',
            this.addForm
          ) // json
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.addDialogVisible = false
          this.$message('用户添加成功')
          this.getList()
        }
      })
    },
    async handleChange(row) {
      const { data: response } = await this.$http.patch(
        `users/mgr/${row.id}/`,
        { is_active: row.is_active }
      )
      if (response.code) {
        return this.$message.error(response.message)
      }
    },
    // 编辑
    handleUserEdit(row) {
      console.log(this.editForm)
      this.editForm = row // {id, username, email, phone}
      this.editDialogVisible = true
    },
    edit() {
      const { id, phone, email } = this.editForm
      const name = 'edit'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.patch(
            `users/mgr/${id}/`,
            {
              phone,
              email
            }
          ) // json this.editForm row
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.editDialogVisible = false
          this.$message('用户修改成功')
          this.getList(this.pagination.page)
        }
      })
    },
    // 删除用户
    handleDelUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 发起到后台的某种方法的请求
          const { data: response } = await this.$http.delete(`users/mgr/${id}/`)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getList(this.pagination.page)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 分配角色
    async handleUserAuth(row) {
      console.log(row) // id
      const { id } = row
      console.log(id)
      // 查询到的是当前用户有哪些角色？属于一个角色还是可以属于多个角色？
      const { data: response } = await this.$http.get(`users/mgr/${id}/roles/`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response, '!!!')
      this.roleList = response.allRoles // 所有可用角色
      this.selectedIds = response.roles // 当前角色
      this.currentUser = row
      this.addRoleDialogVisible = true
    },
    async addRole() {
      const { id } = this.currentUser
      const roles = this.$refs.tree.getCheckedKeys()
      const { data: response } = await this.$http.put(
        `users/mgr/${id}/roles/`,
        {
          roles
        }
      )
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.addRoleDialogVisible = false
    },
    resetTree() {
      console.log('*****************')
      this.currentUser = {}
      this.roleList = []
      this.selectedIds = []
    }
  }
}
</script>

<style lang="less" scoped>
</style>