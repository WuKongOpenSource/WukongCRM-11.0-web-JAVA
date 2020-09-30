<template>
  <div v-loading="loading">
    <div class="content-title">
      <span>日程类型</span>
    </div>
    <div class="content-body">
      <flexbox
        v-for="(item, index) in list"
        :key="index"
        class="input-item">
        <div class="block_box">
          <div :style="{backgroundColor: item.color}" class="block"/>
          <span>{{ item.typeName }}</span>
        </div>
        <i
          class="wk wk-edit"
          @click="editItem(item)"/>
        <i
          class="el-icon-delete-solid"
          @click="deleteItem(item)"/>
      </flexbox>
      <el-button
        type="text"
        @click="addItem">+添加日程类型</el-button>

      <el-dialog
        :title="title"
        :visible.sync="showCreate"
        append-to-body
        width="580px"
        @close="close"
      >
        <el-form ref="form" :model="form" :rules="rule" label-position="left" label-width="80px">
          <el-form-item label="类型名称" prop="typeName">
            <el-input v-model="form.typeName" placeholder="请输入类型名称"/>
            <div :style="{backgroundColor: selectColor}" class="block_circle color_active"/>
          </el-form-item>
        </el-form>
        <flexbox>
          <label class="label_color">图标颜色</label>
          <div
            v-for="color in colorList"
            :style="{backgroundColor: color}"
            :key="color"
            class="block_circle"
            @click="changeColor(color)"/>
        </flexbox>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showCreate = false">取 消</el-button>
          <el-button v-debounce="save" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  calendarAddOrUpdateAPI,
  calendarQueryTypeListAPI,
  calendarDeleteAPI
} from '@/api/admin/other'
import calendarColor from './calendarColor'
// import Reminder from '@/components/Reminder'

export default {
  name: 'CalendarType',

  components: {
    // Reminder
  },

  data() {
    return {
      loading: false, // 展示加载中效果
      title: '新建日程类型',
      showCreate: false,
      colorList: calendarColor.colorList,
      selectColor: '#53D397',
      form: {
        typeName: '',
        color: '#53D397',
        typeId: ''
      },
      rule: {
        typeName: [
          { required: true, message: '请输入类型名称', trigger: 'blur' },
          { min: 0, max: 10, message: '请输入小于10个字符', trigger: 'blur' }
        ]
      },
      // 防抖：避免重复提交
      list: [] // 展示类型数据
    }
  },

  created() {
    this.getDetail()
  },

  methods: {
    /**
     * 获取详情
     */
    getDetail() {
      this.loading = true
      calendarQueryTypeListAPI()
        .then(res => {
          this.loading = false
          this.list = res.data || []
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 增加类型
     */
    addItem() {
      this.title = '新建日程类型'
      this.form = {
        typeName: ''
      }
      this.showCreate = true
    },

    /**
     * 编辑类型
     */
    editItem(item) {
      this.title = '编辑日程类型'
      this.form = item
      this.selectColor = item.color
      this.showCreate = true
    },
    /**
     * 删除事项操作
     */
    deleteItem(item) {
      this.$confirm('此操作将永久删除类型, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        calendarDeleteAPI(item.typeId).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getDetail()
        }).catch(() => {})
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    /**
     * 保存操作
     */
    save() {
      this.form.color = this.selectColor
      this.$refs['form'].validate((valid) => {
        if (valid) {
          calendarAddOrUpdateAPI(this.form)
            .then(res => {
              this.getDetail()
              this.showCreate = false
              this.$message.success('操作成功')
            })
            .catch(() => {
            })
        }
      })
    },

    /**
     * 选择颜色
     */
    changeColor(color) {
      this.selectColor = color
    },

    /**
     * 关闭时取消表单验证
     */
    close() {
      this.$refs['form'].resetFields()
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.content-title {
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.content-title > span {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
}

.content-body {
  height: calc(100% - 57px);
  padding: 8px 30px 30px;
  overflow-y: auto;
}

.reminder {
  margin-bottom: 8px;
}

/* 事项布局 */
.input-item {
  margin-top: 20px;
  margin-bottom: 10px;
  height: 30px;
  .el-icon-delete-solid,.wk-edit {
    cursor: pointer;
    margin-left: 20px;
    display: none;
  }
}
 .el-input {
    /deep/.el-input__inner{
      padding-left: 40px;
    }
  }
.input-item:hover {
  .el-icon-delete-solid,.wk-edit {
    display: inline;
  }
}
.block_box{
  width: 200px;
}
.block{
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 10px;
  vertical-align: text-bottom;
  display: inline-block;
}
.block_circle{
  width: 20px;
  height: 20px;
  margin-right: 10px;
  cursor: pointer;
  border-radius: 50%;
}
.color_active{
  position: absolute;
  top: 10px;
  left: 10px;
}
.label_color{
  width: 80px;
}
</style>
