<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>CMDB</el-breadcrumb-item>
      <el-breadcrumb-item>资产类型列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="always">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-button type="primary" @click="addDialogVisible = true"
            >增加资产类型</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="dataList" border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="name" label="名称"> </el-table-column>
        <el-table-column prop="version" label="版本"> </el-table-column>
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
      const { data: response } = await this.$http.get('cmdb/citypes/', {
        params: { page }
      })
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.dataList = response.results
      this.pagination = response.pagination
    }
  }
}
</script>

<style>
</style>