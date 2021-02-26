<template>
  <flexbox
    v-loading="loading"
    align="flex-start"
    justify="flex-start"
    class="fields-index body">
    <flexbox-item class="body-left">
      <div class="body-left_title">字段库</div>
      <ul>
        <draggable
          :list="fieldLibList"
          :options="dragLeftConfig"
          :clone="dragLeftMove"
          class="lib-wrapper"
          @end="dragLeftEnd">
          <div
            v-for="item in fieldLibList"
            :key="item.id"
            class="lib-item"
            @click="handleLibFieldClick(item)">
            <i
              :class="item.icon"
              class="lib-item-icon" />
            <span>{{ item.name }}</span>
        </div></draggable>
      </ul>
    </flexbox-item>

    <div class="body-content">
      <flexbox
        align="flex-start"
        justify="flex-start"
        direction="column"
        class="body-content-warp">
        <el-header>
          <div class="title">编辑{{ title }}字段</div>
          <div>
            <el-button
              v-debounce="handleSave"
              type="primary">保存</el-button>
            <el-button @click="handleCancel">返回</el-button>
          </div>
        </el-header>
        <flexbox-item style="margin-left: 0" class="body-content-main">
          <el-main>
            <draggable
              :list="fieldArr"
              :options="dragListConfig"
              class="field-list"
              @end="dragListEnd">
              <flexbox
                v-for="(childArr, fatherIndex) in fieldArr"
                :key="fatherIndex"
                align="flex-start"
                justify="flex-start"
                class="field-row">
                <component
                  v-for="(field, childIndex) in childArr"
                  :key="childIndex"
                  :is="field | typeToComponentName"
                  :field="field"
                  :field-arr="fieldArr"
                  :point="[fatherIndex, childIndex]"
                  :active-point="selectedPoint"
                  @action="handleAction"
                  @click="handleSelect([fatherIndex, childIndex])" />
              </flexbox>
            </draggable>
          </el-main>
        </flexbox-item>
      </flexbox>
    </div>

    <flexbox-item style="margin-left: 0" class="body-right">
      <setting-field
        v-if="selectedField"
        :field="selectedField"
        :can-transform="canTransform"
        :transform-data="transformData"
        :can-unique="canUnique"
        @update-width="handleUpdateFieldWidth" />
    </flexbox-item>
  </flexbox>
</template>

<script>
import {
  customFieldHandleAPI,
  oaFieldHandleAPI,
  customFieldListAPI,
  oaExamineFieldListAPI
} from '@/api/admin/crm'
import { filedGetFieldAPI } from '@/api/crm/common'
import { isEmpty } from '@/utils/types'

import {
  FieldInput,
  FieldTextarea,
  FieldSelect,
  FieldCheckbox,
  FieldFile,
  FieldBoolean,
  FieldPercent,
  FieldPosition,
  FieldLocation,
  FieldDetailTable,
  FieldWritingSign,
  FieldDateInterval,
  FieldDescText
} from './components/FieldItem'
import SettingField from './components/SettingField'

import draggable from 'vuedraggable'

import Field from './field'
import FieldTypeLib from './fieldTypeLib'
import { objDeepCopy } from '@/utils/index'
import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  name: 'FieldsIndex',
  components: {
    FieldInput,
    FieldTextarea,
    FieldSelect,
    FieldCheckbox,
    FieldFile,
    FieldBoolean,
    FieldPercent,
    FieldPosition,
    FieldLocation,
    FieldDetailTable,
    FieldWritingSign,
    FieldDateInterval,
    FieldDescText,
    SettingField,
    draggable
  },
  filters: {
    /** 根据type 找到组件 */
    typeToComponentName(item) {
      if (item.type === 0) return 'FieldInput'
      if ([
        'text',
        'number',
        'floatnumber',
        'mobile',
        'email',
        'date',
        'datetime',
        'user',
        'structure',
        'contacts',
        'customer',
        'contract',
        'business',
        'single_user',
        'website'
      ].includes(item.formType)) {
        return 'FieldInput'
      }
      switch (item.formType) {
        case 'textarea': // 多行文本
          return 'FieldTextarea'
        case 'select': // 选项
          return 'FieldSelect'
        case 'checkbox': // 多选
          return 'FieldCheckbox'
        case 'file': // 附件
          return 'FieldFile'
        case 'boolean_value': // 布尔
          return 'FieldBoolean'
        case 'percent': // 百分数
          return 'FieldPercent'
        case 'position': // 地区定位
          return 'FieldPosition'
        case 'location': // 定位
          return 'FieldLocation'
        case 'detail_table': // 明细表格
          return 'FieldDetailTable'
        case 'handwriting_sign': // 手写签名
          return 'FieldWritingSign'
        case 'date_interval': // 日期区间
          return 'FieldDateInterval'
        case 'desc_text': // 描述文字
          return 'FieldDescText'
        // case 'form':
        //   return 'FieldTextarea'
        default:
          return 'FieldInput'
      }
    }
  },
  data() {
    return {
      moduleType: '', // 所属模块
      loading: false,

      fieldLibList: [], // 字段库
      dragLeftConfig: {
        delay: 50,
        group: {
          pull: 'clone',
          put: false,
          name: 'list'
        },
        forceFallback: true,
        sort: false
      },
      movedField: null, // 被拖拽的字段库字段

      dragListConfig: {
        delay: 50,
        group: 'list',
        forceFallback: true,
        fallbackClass: 'draggingStyle'
      },
      fieldArr: [],
      rejectHandle: true, // 请求未获取前不能操作

      selectedPoint: [null, null],
      selectedField: null,
      // 转移匹配字段源
      transformData: null
    }
  },
  computed: {
    // 能转移
    canTransform() {
      return this.moduleType == 'crm_leads'
    },
    canUnique() {
      return this.moduleType != 'oa_examine' // 办公审批不允许设置唯一
    },
    title() {
      return {
        crm_leads: '线索',
        crm_customer: '客户',
        crm_contacts: '联系人',
        crm_business: '商机',
        crm_contract: '合同',
        crm_product: '产品',
        crm_receivables: '回款',
        crm_visit: '客户回访',
        crm_marketing: '市场活动'
      }[this.moduleType] || ''
    }
  },
  watch: {
    selectedField: {
      handler() {
      },
      deep: true
    }
  },
  created() {
    this.moduleType = this.$route.params.type || ''
    this.initCom()

    // 配置转移字段
    if (this.canTransform) {
      this.getTransformField()
    }
  },
  methods: {
    /**
     * 初始化
     */
    initCom() {
      if (this.moduleType === 'crm_marketing') {
        this.fieldLibList = FieldTypeLib.filter(item => {
          return [
            'user',
            'structure',
            'file'
          ].includes(item.formType)
        })
      } else {
        this.fieldLibList = FieldTypeLib
      }
      this.getFieldList()
    },

    /**
     * 获取字段列表
     */
    getFieldList() {
      this.loading = true
      let request = null
      const params = {}
      const config = this.$route.params

      if (this.moduleType === 'oa_examine') {
        request = oaExamineFieldListAPI
        params.categoryId = config.id
      } else {
        request = customFieldListAPI
      }

      if (config.label) {
        params.label = config.label
      }

      request(params)
        .then(res => {
          this.fieldArr = res.data || []

          if (res.data.length > 0) {
            this.handleSelect([0, 0])
          }
          this.rejectHandle = false
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 点击左侧字段库进行添加
     * @param field {Object}
     */
    handleLibFieldClick(field) {
      this.movedField = field
      this.dragLeftEnd()
    },

    /**
     * 左侧字段库拖拽
     * @param field {Object}
     */
    dragLeftMove(field) {
      this.movedField = field
    },

    /**
     * 左侧字段库拖拽结束
     */
    dragLeftEnd(evt) {
      if (this.rejectHandle) return
      const newField = new Field({
        name: this.movedField.name,
        formType: this.movedField.formType
      })
      newField.stylePercent = 100
      newField.operating = 255
      if (this.movedField.formType === 'desc_text') {
        newField.name = ''
      }
      let rowNum = null
      if (evt && evt.newIndex) {
        rowNum = evt.newIndex
      } else {
        rowNum = this.selectedPoint[0] + 1
      }
      this.fieldArr.splice(rowNum, 0, [newField])
      this.handleSelect([rowNum, 0])
    },

    /**
     * 拖动 list
     */
    dragListEnd(evt) {
      console.log('drag list')
      // this.selectedPoint[0] = evt.newIndex
      this.selectedPoint.splice(0, 1, evt.newIndex)
    },

    /**
     * 字段操作
     * @param action {String} 动作
     * @param point {Array} 字段的坐标
     */
    handleAction(action, point) {
      switch (action) {
        case 'top':
          this.handleActionMoveTop(point)
          break
        case 'bottom':
          this.handleActionMoveBottom(point)
          break
        case 'left':
          this.handleActionExchange(point, -1)
          break
        case 'right':
          this.handleActionExchange(point, 1)
          break
        case 'copy':
          this.handleActionCopy(point)
          break
        case 'delete':
          this.handleDelete(point)
      }
    },

    /**
     * 上移字段
     * @param point {Array} 字段的坐标
     */
    handleActionMoveTop(point) {
      const row = this.fieldArr[point[0] - 1]
      if (!row || row.length === 4) return
      const field = this.fieldArr[point[0]][point[1]]

      // 给新行追加字段
      row.push(objDeepCopy(field))
      let config = this.getWidth(row.length)
      row.forEach(o => {
        o.stylePercent = config.stylePercent
      })
      this.$set(this.fieldArr, point[0] - 1, row)

      // 把字段从原来的行中删除
      const oldRow = this.fieldArr[point[0]]
      oldRow.splice(point[1], 1)
      if (oldRow.length === 0) {
        this.fieldArr.splice(point[0], 1)
      } else {
        config = this.getWidth(oldRow.length)
        oldRow.forEach(o => {
          o.stylePercent = config.stylePercent
        })
        this.$set(this.fieldArr, point[0], oldRow)
      }
      this.handleSelect([point[0] - 1, row.length - 1])
    },

    /**
     * 下移字段
     * @param point {Array} 字段的坐标
     */
    handleActionMoveBottom(point) {
      const field = this.fieldArr[point[0]][point[1]]
      field.stylePercent = 100
      // 把字段放到新行
      this.fieldArr.splice(point[0] + 1, 0, [field])
      // 把字段从原来的行删除
      this.fieldArr[point[0]].splice(point[1], 1)
      // 修改原来行的字段占比
      const row = this.fieldArr[point[0]]
      const config = this.getWidth(row.length)
      row.forEach(o => {
        o.stylePercent = config.stylePercent
      })
      this.$set(this.fieldArr, point[0], row)
      this.handleSelect([point[0] + 1, 0])
    },

    /**
     * 左右移动交换位置
     * @param point {Array} 字段的坐标
     * @param step {Number} 1 向右移动 -1 向左移动
     */
    handleActionExchange(point, step) {
      const row = this.fieldArr[point[0]]
      const field = this.fieldArr[point[0]][point[1]]
      row.splice(point[1], 1)
      row.splice(point[1] + step, 0, field)
      this.handleSelect([point[0], point[1] + step])
    },

    /**
     * 拷贝字段
     * @param point {Array} 字段的坐标
     */
    handleActionCopy(point) {
      const field = this.fieldArr[point[0]][point[1]]
      const copyField = objDeepCopy(field)
      delete copyField.fieldId
      delete copyField.fieldName
      delete copyField.relevant
      copyField.fieldType = 0
      copyField.operating = 255
      if (copyField.formType === 'desc_text') {
        copyField.name = ''
      }
      this.fieldArr.splice(point[0] + 1, 0, [copyField])
      this.handleSelect([point[0] + 1, point[1]])
    },

    /**
     * 修改字段占比
     */
    handleUpdateFieldWidth() {
      console.log('update width')
      const row = this.fieldArr[this.selectedPoint[0]]

      // 本行占比大于100% 溢出到下一行
      const arr = []
      let child = [] // 行
      let totalWidth = 0
      for (let i = 0; i < row.length; i++) {
        const item = row[i]
        totalWidth += item.stylePercent
        if (totalWidth < 100) {
          // 长度小于 100%
          child.push(item)
        } else if (totalWidth > 100) {
          // 长度大于 100%
          arr.push(objDeepCopy(child))
          child = []
          child.push(item)
          totalWidth = item.stylePercent
        } else {
          // 长度等于 100%
          child.push(item)
          arr.push(objDeepCopy(child))
          child = []
          totalWidth = 0
        }
      }
      if (child.length > 0) {
        arr.push(child)
      }

      // 如果从一行变成多行
      if (arr.length > 1) {
        let rowNum = this.selectedPoint[0] // 行坐标
        let columnNum = this.selectedPoint[1] // 列坐标
        this.fieldArr.splice(rowNum, 1, ...arr)
        let step = 0
        for (let i = 0; i < arr.length; i++) {
          step += arr[i].length
          if (step >= columnNum + 1) {
            rowNum += i
            columnNum = columnNum - step + arr[i].length
            break
          }
        }
        this.handleSelect([rowNum, columnNum])
      }
    },

    getWidth(length) {
      if (length === 1) return { stylePercent: 100 }
      if (length === 2) return { stylePercent: 50 }
      if (length > 2) return { stylePercent: 25 }
    },

    /**
     * 删除字段
     * @param point {Array} 字段的坐标
     */
    handleDelete(point) {
      this.$confirm('确定删除该自定义字段吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.fieldArr[point[0]].splice([point[1]], 1)
          // 如果当前行已经没有元素则删除
          if (this.fieldArr[point[0]].length === 0) {
            this.fieldArr.splice(point[0], 1)
          }
          this.$nextTick(() => {
            this.selectedPoint = [null, null]
            this.selectedField = null
          })
        })
        .catch(() => {})
    },

    /**
     * 字段列表点击选择
     * @param point {Array} 字段的坐标
     */
    handleSelect(point) {
      console.log('index click: ', point)
      this.selectedPoint = point
      this.selectedField = this.fieldArr[point[0]][point[1]]
      // if (this.selectedPoint === index) {
      //   // 表自定义字段的刷新`
      //   if (index >= 0) {
      //     this.form = this.fieldArr[index]
      //   }
      // }
    },

    /**
     * 保存
     */
    handleSave() {
      if (this.rejectHandle) return

      const arr = []
      this.loading = true
      // 追加坐标
      objDeepCopy(this.fieldArr).forEach((father, fatherIndex) => {
        father.forEach((child, childIndex) => {
          arr.push({
            ...child,
            formPosition: `${fatherIndex},${childIndex}`
          })
        })
      })

      const limitFields = 'select|update|union|and|or|delete|insert|trancate|char|substr|ascii|declare|exec|count|master|into|drop|execute'.split('|')
      const names = []
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        const position = item.formPosition.split(',')
        const positionStr = `第${Number(position[0]) + 1}行第${Number(position[1]) + 1}列`
        item.name = (item.name || '').trim()
        if (item.formType !== 'desc_text') {
          if (!item.name) {
            this.$message.error(positionStr + '自定义字段，标识名不能为空')
            this.loading = false
            return
          }
          if (limitFields.includes(item.name)) {
            this.$message.error(positionStr + '自定义字段标识名与系统字段重复，请使用其他字段！')
            this.loading = false
            return
          }
          if (names.includes(item.name)) {
            this.$message.error(positionStr + '自定义字段标识名重复')
            this.loading = false
            return
          }
          names.push(item.name)
        } else {
          if (!isEmpty(item.defaultValue) && item.defaultValue.length > 2000) {
            this.$message.error(positionStr + '描述文字类型字段最多设置2000字')
            this.loading = false
            return
          }
        }
        delete item.sysConfig
        if (!item.type) {
          const findRes = FieldTypeLib.find(o => o.formType === item.formType)
          if (findRes) item.type = findRes.type
        }
      }

      // 请求参数
      const params = {
        data: arr
      }
      const routerParams = this.$route.params
      if (routerParams.label !== 'none') {
        params.label = routerParams.label
      }
      if (this.moduleType === 'oa_examine') {
        params.categoryId = routerParams.id
      }
      if (this.moduleType === 'crm_marketing') {
        params.formId = routerParams.id
      }
      console.log('save, ', params)
      // this.loading = false
      // return

      const request = {
        oa_examine: oaFieldHandleAPI
      }[this.moduleType] || customFieldHandleAPI

      request(params)
        .then(() => {
          this.$message({
            type: 'success',
            message: '操作成功'
          })
          this.loading = false
          this.getFieldList()
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 获取添加字段
     */
    getTransformField() {
      filedGetFieldAPI({
        label: crmTypeModel['customer'],
        type: 1 // 一维数组
      })
        .then(res => {
          const data = {
            text: [],
            textarea: [],
            select: [],
            checkbox: [],
            number: [],
            floatnumber: [],
            mobile: [],
            email: [],
            date: [],
            datetime: [],
            user: [],
            structure: [],
            boolean_value: [],
            percent: [],
            position: [],
            location: [],
            handwriting_sign: [],
            date_interval: []
          }

          for (let index = 0; index < res.data.length; index++) {
            const element = res.data[index]
            const array = data[element.formType]
            if (array) {
              array.push({
                label: element.name,
                value: element.fieldId
              })
            }
          }

          this.transformData = data
        })
        .catch(() => {})
    },

    /**
     * 返回
     */
    handleCancel() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mixin.scss';

.fields-index {
  &.body {
    width: 100%;
    position: relative;
    width: 100%;
    height: calc(100% + 15px);
    user-select: none;
    overflow: hidden;

    .body-left {
      width: 265px;
      max-width: 265px;
      height: 100%;
      overflow-y: auto;
      background-color: white;
      .body-left_title {
        .wk-icon-fields {
          margin-right: 10px;
        }
        font-weight: bold;
        font-size: 14px;
        margin: 20px 20px 15px;
      }

      .lib-wrapper {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        padding: 0 10px;
        .lib-item {
          flex: 0 0 50%;
          font-size: 13px;
          background-color: white;
          padding: 5px 10px;
          line-height: 22px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 13px;

          .lib-item-icon {
            display: inline-block;
            color: #999;
            margin-right: 8px;
          }

          &:hover {
            background-color: #f7f8fa;
          }
        }
      }
    }

    .body-content {
      padding: 15px;
      flex: 1;
      height: 100%;

      .body-content-warp {
        max-width: 900px;
        margin: 0 auto;
        height: 100%;
        box-shadow: 0 2px 12px 0 rgba($color: #000, $alpha: 0.1);
        border-radius: $xr-border-radius-base;
        overflow: hidden;
        background-color: white;
        .el-header {
          width: 100%;
          // border-bottom: 1px solid $xr-border-line-color;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }
        }
        .body-content-main {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          padding: 10px 16px 30px;
          .el-main {
            .no-list {
              margin: 200px 0;
              color: #ccc;
              @include center;
            }
          }
        }
      }
    }

    .body-right {
      width: 280px;
      max-width: 280px;
      height: 100%;
      overflow-y: auto;
      background-color: white;
    }
  }
}
</style>
