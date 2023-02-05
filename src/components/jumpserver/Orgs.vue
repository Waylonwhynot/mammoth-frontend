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
    </el-card>
    <!-- 增加对话框 -->
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
  </div>
</template>

<script>
export default {
  created() {
    this.getList()
  },
  data() {
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
      } else if (id === 3) {
        // 增加主机
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