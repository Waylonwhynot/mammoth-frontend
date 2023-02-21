<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>JumpServer</el-breadcrumb-item>
      <el-breadcrumb-item>主机列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="always">
      <!-- 组织结构层级树 -->
      <el-tree
        :data="orgList"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :props="defaultProps"
        @node-click="handleNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link"
                ><i class="el-icon-setting el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="[1, node, data]"
                  >增加分组</el-dropdown-item
                >
                <el-dropdown-item :command="[2, node, data]"
                  >删除分组</el-dropdown-item
                >
                <el-dropdown-item divided :command="[3, node, data]"
                  >增加主机</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </span>
        </span>
      </el-tree>
      <el-table :data="hostList" border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="ip" label="登录IP"> </el-table-column>
        <el-table-column prop="username" label="登录名"> </el-table-column>
        <el-table-column fixed="right" label="操作">
          <template #default="{ row }">
            <el-tooltip content="WEB终端" placement="bottom" effect="light">
              <el-button
                type="warning"
                icon="el-icon-monitor"
                size="mini"
                @click="handleClick(row)"
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
    <!-- 增加组织对话框 -->
    <el-dialog
      :title="`${addForm.parentName} 增加子分组`"
      :visible.sync="addDialogVisible"
      @close="resetForm('add')"
    >
      <el-form :model="addForm" :rules="addRules" ref="add" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 增加主机对话框 -->
    <el-dialog
      :title="`${addHostForm.orgName} 增加主机`"
      :visible.sync="addHostDialogVisible"
      @close="resetForm('addHost')"
    >
      <el-form
        :model="addHostForm"
        :rules="addHostRules"
        ref="addHost"
        label-width="100px"
      >
        <el-form-item label="登录IP" prop="ip">
          <el-input v-model="addHostForm.ip"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addHostForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addHostForm.password"></el-input>
        </el-form-item>
        <el-form-item label="上传私钥文件">
          <el-upload
            class="upload-demo"
            :headers="getHeaders()"
            :action="$http.defaults.baseURL + 'jumpserver/upload/'"
            :on-remove="handleRemove"
            :limit="1"
            :file-list="fileList"
            :on-success="handleSuccess"
          >
            <el-button size="small" type="primary">点击上传私钥文件</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传1个文件，且不超过1kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addHostDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addHost">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getList()
    // this.getHostList()
  },
  data() {
    var validatePassOrKeyfile = (rule, value, callback) => {
      if (value === '' && this.addHostForm.ssh_pkey_path === '') {
        callback(new Error('密码或密钥必须有一个!'))
      } else {
        callback()
      }
    }
    return {
      defaultProps: { label: 'name', children: 'children' },
      orgList: [{ id: 1000, label: 'xyz', children: [] }],
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
      // 主机
      addHostDialogVisible: false,
      addHostForm: {
        ip: '',
        username: '',
        password: '',
        ssh_pkey_path: ''
      },
      addHostRules: {
        ip: [{ required: true, message: '请输入登录IP', trigger: 'blur' }],
        username: [
          { required: true, message: '请输入登录用户名', trigger: 'blur' }
        ],
        password: [{ validator: validatePassOrKeyfile, trigger: 'blur' }]
      },
      fileList: [],
      hostList: [],
      pagination: { total: 0, size: 20, page: 1 }
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
    async getList() {
      // 需要分页吗？不需要
      const { data: response } = await this.$http.get('jumpserver/orgs/all/') // action all
      if (response.code) {
        return this.$message.error(response.message)
      }
      const vroot = { id: null, name: '资产树', children: null } // 虚拟根
      vroot.children = response.results
      this.orgList = [vroot]
    },
    handleCommand(command) {
      const [id, node, data] = command
      console.log(node.data === data)
      if (id === 1) {
        // console.log(node, data);
        // 增加子分组，对话框 新增分组 表单, parent是谁，name 谁
        console.log(data) // id我自己的id，用我的id作为新增节点pid
        this.addForm.parent = data.id
        this.addForm.parentName = data.name
        this.addDialogVisible = true
      } else if (id === 2) {
        // 删除改组和其下所以子组、主机
        this.del(data)
      } else if (id === 3) {
        // 增加主机
        this.addHostForm.org = data.id
        this.addHostForm.orgName = data.name
        this.addHostDialogVisible = true
      }
    },
    add() {
      const name = 'add'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(
            'jumpserver/orgs/',
            this.addForm
          )
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.addDialogVisible = false
          this.$message('添加成功')
          this.getList()
        }
      })
    },
    del(data) {
      console.log(data)
      const { id, name } = data
      this.$confirm(
        '删除[' +
          name +
          ']分组及其子分组，包括各分组的所管理的主机。<br>是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      )
        .then(async () => {
          // 发起到后台的某种方法的请求
          const { data: response } = await this.$http.delete(
            `jumpserver/orgs/${id}/`
          )
          console.log('~~~~~~~~~~~~~~~~~~~~')
          console.log(response)
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.getList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    handleRemove(file, fileList) {
      this.fileList = []
    },
    handleSuccess(response, file, fileList) {
      this.fileList = [response] // [{name:'xxx', url:'xxxxx'}]
    },
    getHeaders() {
      return { Authorization: 'Bearer ' + window.localStorage.getItem('token') }
    },
    addHost() {
      console.log(this.addHostForm)
      this.addHostForm.ssh_pkey_path = this.fileList.length
        ? this.fileList[0].url
        : ''
      const name = 'addHost'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          const { data: response } = await this.$http.post(
            'jumpserver/hosts/',
            this.addHostForm
          )
          if (response.code) {
            return this.$message.error(response.message)
          }
          this.addHostDialogVisible = false
          this.$message('添加成功')
          // this.getHostList()
        }
      })
    },
    async getHostList(page = 1, org) {
      if (!page) {
        page = 1
      }
      // 拿回所有主机信息？
      const { data: response } = await this.$http.get('jumpserver/hosts/', {
        params: { page, org }
      })
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.hostList = response.results
      this.pagination = response.pagination
    },
    handleNodeClick(data) {
      console.log(data)
      const { id: org } = data
      // org_id = 6 它所有的主机们 jumpserver/hosts/?page=1&org=6 条件查询
      this.getHostList(1, org)
    },
    handleClick(row) {
      console.log(row) // row.id host.id
      this.$router.push(`/jumpserver/webshell/${row.id}`) // 静态路由，跳转中不会访问后台
    }
  }
}
</script>

<style lang="less" scoped>
.el-tree {
  background-color: #fafafa;
  min-height: 400px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>