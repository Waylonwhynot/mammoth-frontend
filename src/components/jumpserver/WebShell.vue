<template>
  <div>
    <div class="output">
      <el-card v-for="(o, index) in outputs" :key="index">
        <div>{{ o.stdout }}</div>
        <div>{{ o.stderr }}</div>
      </el-card>
    </div>
    <div>
      <el-input placeholder="请输入命令" @keyup.native.enter="handleCommand" v-model="command"></el-input>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.getHost()
  },
  data() {
    return {
      command: '',
      outputs: []
    }
  },
  methods: {
    getHost() {
      console.log(this)
      const { id } = this.$route.params
      console.log(id)
      // id 发起请求，获得id对应主机信息
      // 访问这个主机了
      console.log(window)
      if ('WebSocket' in window) {
        const ws = new WebSocket('ws://localhost:10800') // 客户端
        ws.onerror = (event) => {
          console.log(event, '出错了')
        }
        ws.onopen = (event) => {
          console.log(event, '已经连接到serve~~~~~~~')
          ws.send(
            JSON.stringify({
              token: window.localStorage.getItem('token'),
              hostId: id
            })
          )
        }
        ws.onclose = (event) => {
          console.log(event, '关闭连接')
        }
        ws.onmessage = (message) => {
          console.log(message, '@@@@')
          this.outputs.push(JSON.parse(message.data))
          console.log(this.outputs)
        }
        this.ws = ws
      } else {
        this.$message.error('浏览器不支持WebSocket，请更换浏览器或升级浏览器')
      }
    },
    handleCommand() {
      // 发什么
      console.log(this.command)
      this.ws.send(this.command)
      this.command = ''
    }
  }
}
</script>

<style>
</style>