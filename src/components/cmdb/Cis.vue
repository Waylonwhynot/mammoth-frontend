<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>CMDB</el-breadcrumb-item>
      <el-breadcrumb-item>资产列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="always">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-button type="primary" @click="addDialogVisible = true"
            >增加资产</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="dataList" border style="width: 100%">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="fields[0].value" label="名称"> </el-table-column>
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
    <!-- 增加对话框 -->
    <el-dialog
      title="增加资产"
      :visible.sync="addDialogVisible"
      @close="resetForm('add')"
    >
      <el-form :model="addForm" :rules="addRules" ref="add" label-width="100px">
        <el-form-item label="资产类型" prop="citype">
          <el-select
            v-model="addForm.citype"
            placeholder="请选择"
            @change="handleTypeChange"
          >
            <el-option
              v-for="item in citypeList"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 动态创建CiType字段的表单项 -->
        <el-form-item
          v-for="(field, i) in addForm.fields"
          :label="field.label"
          :key="field.name"
          :prop="'fields.' + i + '.value'"
          :rules="
            field.required
              ? {
                  required: true,
                  message: field.label + '不能为空',
                  trigger: 'blur'
                }
              : {}
          "
        >
          <!-- 判断不是所有类型都是输入框，类型field.type === 'str' -->
          <div v-if="!field.type.startsWith('list:')">
            <el-input v-model="field.value"></el-input>
          </div>
          <div v-else>
            <!-- 点击按钮，会返回类型对应的字段们，动态创建他们 -->
            <el-button
              size="mini"
              plain
              icon="el-icon-plus"
              type="success"
              @click="handleAddChild(field)"
            ></el-button>
            <hr />
            <el-card
              v-for="(s, j) in field.subs"
              :key="`${field.name}.${i}.${j}`"
            >
              <!-- 每一个card中就是一个网络接口的表单，每一个网络接口的表单项要创建出来 -->
              <el-form-item
                v-for="(sf, k) in s.fields"
                :label="sf.label"
                :key="sf.name"
                :prop="'fields.' + i + '.subs.' + j + '.fields.' + k + '.value'"
                :rules="
                  sf.required
                    ? {
                        required: true,
                        message: sf.label + '不能为空',
                        trigger: 'blur'
                      }
                    : {}
                "
              >
                <el-input v-model="sf.value"></el-input>
              </el-form-item>
            </el-card>
          </div>
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
    this.getTypeList()
  },
  data() {
    return {
      search: '',
      dataList: [],
      citypeList: [],
      pagination: { total: 0, size: 20, page: 1 },
      addDialogVisible: false,
      addForm: {
        citype: null
        // domains: [] // reactive 变量  方式1
      },
      addRules: {
        citype: [
          { required: true, message: '请选择资产的类型', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm(name) {
      this.$refs[name].resetFields()
      this.$set(this.addForm, 'fields', [])
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.getList(val)
    },
    async getList(page = 1) {
      if (!page) {
        page = 1
      }
      const { data: response } = await this.$http.get('cmdb/cis/', {
        params: { page }
      })
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)
      this.dataList = response.results
      this.pagination = response.pagination
    },
    async getTypeList() {
      const { data: response } = await this.$http.get('cmdb/citypes/all/')
      if (response.code) {
        return this.$message.error(response.message)
      }
      this.citypeList = response
    },
    async handleTypeChange(id) {
      const { data: response } = await this.$http.get(`cmdb/citypes/${id}/`)
      if (response.code) {
        return this.$message.error(response.message)
      }
      // this.addForm.domains = response.fields // {id, fields}
      // 2方式
      this.$set(this.addForm, 'fields', response.fields)
    },
    async handleAddChild(field) {
      console.log(field, '~~~~~~~~')
      console.log(field.type.split(':'))
      const [, name, version = 1] = field.type.split(':')
      const { data: response } = await this.$http.get(
        `cmdb/citypes/${name}/${version}/`
      )
      if (response.code) {
        return this.$message.error(response.message)
      }
      console.log(response)

      if ('subs' in field === false) {
        this.$set(field, 'subs', []) // field对象有subs属性，还是reactive的
      }
      field.subs.push(response) // {id, fields}
    },
    add() {
      console.log(this.addForm)
      const name = 'add'
      this.$refs[name].validate(async (valid) => {
        if (valid) {
          console.log(this.addForm)
          const { data: response } = await this.$http.post(
            'cmdb/cis/',
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
.el-form-item .el-card .el-form-item {
  margin-bottom: 22px;
}
</style>