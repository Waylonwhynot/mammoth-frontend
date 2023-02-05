<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
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
            >增加角色</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="dataList" border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="name" label="角色名称"> </el-table-column>
        <el-table-column fixed="right" label="操作" #default="{ row }">
          <el-tooltip content="分配权限" placement="bottom" effect="light">
            <el-button
              type="success"
              icon="el-icon-setting"
              size="mini"
              @click="handleSetPerm(row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="修改" placement="bottom" effect="light">
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="bottom" effect="light">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
          </el-tooltip>
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
    <!-- 赋权对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="addPermDialogVisible"
      @close="resetTree"
    >
      <el-tree
        ref="tree"
        node-key="id"
        show-checkbox
        :data="permList"
        :props="defaultProps"
        :default-checked-keys="selectedIds"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addPermDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addPerm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 增加对话框 -->
    <el-dialog
      title="增加角色"
      :visible.sync="addDialogVisible"
      @close="resetForm('add')"
    >
      <el-form :model="addForm" :rules="addRules" ref="add" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
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
    return {
      search: '',
      dataList: [],
      pagination: { total: 0, size: 20, page: 1 },
      addDialogVisible: false,
      addForm: {
        name: ''
      },
      addRules: {
        name: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 1, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur' }
        ]
      },
      // 赋权
      addPermDialogVisible: false,
      // permList 显示全体可用权限
      permList: [],
      currentRole: {},
      selectedIds: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    resetForm(name) {
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
      const { data: response } = await this.$http.get('users/roles/', {
        params: { page, search: this.search }
      })
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.dataList = response.results
      this.pagination = response.pagination
    },
    add() {
      const name = 'add'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(
            'users/roles/',
            this.addForm
          )
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.addDialogVisible = false
          this.$message('角色添加成功')
          this.getList()
        }
      })
    },
    async handleSetPerm(row) {
      console.log(row)
      const { id } = row
      console.log(id)
      // 查询到的是当前角色id对应的权限
      const { data: response } = await this.$http.get(
        `users/roles/${id}/perms/`
      )
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.permList = response.allPerms // 所有可用
      this.selectedIds = response.permissions // 当前角色的权限
      this.currentRole = row
      this.addPermDialogVisible = true
    },
    async addPerm() {
      const { id } = this.currentRole // 角色id？
      // 打勾了什么
      const name = 'tree'
      const permissions = this.$refs[name].getCheckedKeys() // 权限ids []
      // 赋权 permissions
      const { data: response } = await this.$http.patch(`users/roles/${id}/`, {
        permissions
      })
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.addPermDialogVisible = false
    },
    resetTree() {
      console.log('*****************')
      this.currentRole = {}
      this.permList = []
      this.selectedIds = []
    }
  }
}
</script>

<style>
</style>