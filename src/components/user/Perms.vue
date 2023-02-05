<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
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
      </el-row>
      <el-table :data="dataList" border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="name" label="权限名"> </el-table-column>
        <el-table-column prop="codename" label="权限"> </el-table-column>
        <el-table-column prop="content_type.app_label" label="应用名">
        </el-table-column>
        <el-table-column prop="content_type.model" label="model">
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
      pagination: { total: 0, size: 20, page: 1 }
    }
  },
  methods: {
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.getList(val)
    },
    async getList(page = 1) {
      if (!page) {
        page = 1
      }
      const { data: response } = await this.$http.get('users/perms/', {
        params: { page, search: this.search }
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