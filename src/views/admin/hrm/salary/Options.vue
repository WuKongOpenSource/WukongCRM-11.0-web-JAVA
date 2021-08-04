<!--
 * @Description: 悟空软件
 * @Author: 悟空
 * @LastEditors: yang
-->
<template>
  <div v-loading="loading" class="main">
    <xr-header
      icon-class="wk wk-double-gear"
      icon-color="#1CBAF5"
      label="工资表设置" />
    <div class="main-body">
      <template v-if="step == 0">
        <div
          v-for="(section, index) in sectionList"
          :key="index"
          class="section">
          <div class="section__title">{{ section.title }}</div>
          <div class="section__des">{{ section.des }}</div>

          <div v-if="index == 0" class="handle-bar">
            <el-button
              type="primary"
              @click="editClick">编辑</el-button>
          </div>

          <flexbox class="section__content" wrap="wrap" align="stretch">
            <el-card
              v-for="(item, itemIndex) in section.list"
              :key="itemIndex"
              class="section-item">
              <flexbox class="section-item__header">
                <div class="section-item__title text-one-line">{{ item.name }}</div>
                <template>
                  <span v-if="index == 1" class="section-item--system">
                    系统项
                  </span>
                </template>
              </flexbox>
              <div class="section-item__body">
                <div
                  v-for="(subItem, subIndex) in getSubChildren(item.children, index)"
                  :key="subIndex"

                  class="section-item__content text-one-line">{{ subItem.name }}</div>
                <div
                  v-if="item.children && item.children.length > 3"
                  class="section-item__content text-one-line">...</div>
              </div>
            </el-card>
          </flexbox>
        </div>
      </template>

      <template v-else-if="step == 1">
        <div
          v-for="(section, index) in sectionFirstList"
          :key="index"
          class="section">
          <div class="section__title">{{ section.title }}</div>
          <div class="section__des">{{ section.des }}</div>

          <div v-if="index == 0" class="handle-bar">
            <el-button
              type="primary"
              @click="nextClick">下一步</el-button>
            <el-button
              @click="cancelClick">取消</el-button>
          </div>

          <flexbox class="section__content" wrap="wrap" align="stretch">
            <el-card
              v-for="(item, itemIndex) in section.list"
              :key="itemIndex"
              class="section-item">
              <flexbox class="section-item__header">
                <div class="section-item__title text-one-line">{{ item.name }}</div>
                <template>
                  <el-switch
                    v-if="index == 0"
                    v-model="item.isOpen"
                    :inactive-value="0"
                    :active-value="1"/>
                  <span v-if="index == 1" class="section-item--system">
                    系统项
                  </span>
                </template>
              </flexbox>
              <div class="section-item__body">
                <div
                  v-for="(subItem, subIndex) in getSubChildren(item.children, index)"
                  :key="subIndex"
                  class="section-item__content text-one-line">{{ subItem.name }}</div>
                <div
                  v-if="item.children && item.children.length > 3"
                  class="section-item__content text-one-line">...</div>
              </div>
            </el-card>
          </flexbox>
        </div>
      </template>

      <template v-else-if="step == 2">
        <div
          v-for="(section, index) in sectionFirstList"
          :key="index"
          class="section">
          <div class="section__title">{{ section.title }}</div>
          <div class="section__des">{{ section.nextDes }}</div>

          <div v-if="index == 0" class="handle-bar">
            <el-button
              type="primary"
              @click="saveClick">保存</el-button>
            <el-button
              @click="backClick">返回</el-button>
          </div>

          <div class="section__content" wrap="wrap" align="stretch">
            <div
              v-for="(item, itemIndex) in section.list"
              v-show="item.isOpen == 1"
              :key="itemIndex"
              class="table-content">
              <el-table
                :data="item.children"
                style="width: 100%">
                <el-table-column
                  v-for="(item, index) in getTableFields(item)"
                  :key="index"
                  :prop="item.prop"
                  :label="item.label"
                  :width="item.width"
                  :formatter="fieldFormatter"
                  show-overflow-tooltip/>
                <el-table-column
                  label="操作"
                  fixed="right"
                  width="100">
                  <template slot-scope="scope">
                    <el-button v-if="index == 0" type="text" @click="deleteItems(scope.$index, item.children)">删除</el-button>
                    <template v-else>
                      <el-switch
                        v-model="scope.row.isShow"
                        :inactive-value="0"
                        :active-value="1"/><span style="color: #999; margin-left: 2px;">显示</span>
                    </template>
                  </template>
                </el-table-column>
                <flexbox v-if="item.showCreate" slot="append" class="create-bar">
                  <el-input
                    v-model="item.createName"
                    :maxlength="50"
                    class="name-input"
                    type="text"/>
                  <el-input
                    v-model="item.createRemarks"
                    :maxlength="50"
                    class="remarks-input"
                    type="text"/>
                  <el-button
                    @click="createCancelClick(item)">取消</el-button>
                  <el-button
                    type="primary"
                    @click="createSaveClick(item)">保存</el-button>
                </flexbox>
              </el-table>
              <el-dropdown
                v-if="index == 0"
                ref="bottomDropdown"
                :hide-on-click="false"
                trigger="click">
                <el-button type="text">添加薪资项</el-button>
                <el-dropdown-menu
                  slot="dropdown"
                >
                  <el-dropdown-item
                    v-for="(handleItem, handleIndex) in getHandleOptions(item)"
                    :key="handleIndex"
                    :icon="handleItem.isCustom ? 'el-icon-plus' : ''"
                    :command="handleItem.code"
                    @click.native="dropdownCommand(handleItem, item, itemIndex)">
                    <el-checkbox
                      v-if="!handleItem.isCustom"
                      v-model="handleItem.checked"
                      @change="checkboxChange($event,handleItem,item.children)">{{ handleItem.name }}</el-checkbox>
                    <template v-else>{{ handleItem.name }}</template>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {
  hrmSalaryOptionDetailAPI,
  hrmSalaryOptionUpdateAPI
} from '@/api/admin/hrm'

import XrHeader from '@/components/XrHeader'

import { objDeepCopy } from '@/utils'

export default {
  // 工资表设置
  name: 'SalaryOptions',
  components: {
    XrHeader
  },
  mixins: [],
  data() {
    return {
      loading: false,
      detailData: null,
      optionTempList: [],
      // 详情
      sectionList: [],
      // 编辑
      sectionFirstList: [],
      sectionNextList: [],
      step: 0
    }
  },
  computed: {

  },
  watch: {},
  created() {
    this.getDetail()
  },
  methods: {
    /**
     * 编辑
     */
    editClick() {
      this.getFirstPageData(this.detailData)
      this.step = 1
    },

    backClick() {
      this.step = 1
    },

    /**
     * 删除
     */
    deleteItems(index, list) {
      list.splice(index, 1)
    },

    saveClick() {
      this.$confirm('编辑后不影响历史工资的工资表，当前计薪的工资表需重新核算后生效?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const hideList = []
          const showList = []
          this.sectionFirstList[0].list.forEach(item => {
            if (item.isOpen === 0) {
              hideList.push(item.code)
            } else {
              showList.push(item)
            }
          })

          let optionList = []
          showList.forEach(item => {
            optionList = optionList.concat(item.children)
          })

          this.sectionFirstList[1].list.forEach(item => {
            optionList = optionList.concat(item.children || [])
          })



          this.loading = true
          hrmSalaryOptionUpdateAPI({
            optionList,
            hideList
          })
            .then(res => {
              this.loading = false
              this.step = 0
              this.getDetail()
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
    },

    /**
     * 详情
     */
    getDetail() {
      this.sectionList = []
      // 编辑
      this.sectionFirstList = []
      this.sectionNextList = []

      this.loading = true
      hrmSalaryOptionDetailAPI()
        .then(res => {
          this.loading = false
          this.detailData = res.data || {}

          this.getDetailPageData(this.detailData)
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 第一页数据
     */
    getDetailPageData(data) {
      const openOption = objDeepCopy(data.openOption || [])
      const optionList = []
      const systemList = []
      openOption.forEach(item => {
        if (item.isFixed) {
          const hideChilds = item.children.filter(item => item.isShow === 0)
          // 没有全关闭的系统项详情展示
          if (hideChilds.length != item.children.length) {
            systemList.push(item)
          }
        } else {
          optionList.push(item)
        }
      })

      this.sectionList = this.getSection(optionList, systemList)
    },

    /**
     * 第一页数据
     */
    getFirstPageData(data) {
      data = objDeepCopy(data)
      const templateOption = data.templateOption || []
      this.optionTempList = objDeepCopy(templateOption)

      const optionList = []
      const systemList = data.openOption.filter(item => item.isFixed == 1)
      const selectList = data.openOption.map(item => item.code)
      templateOption.forEach(item => {
        if (item.isFixed === 0) {
          item.isOpen = selectList.includes(item.code) ? 1 : 0
          if (item.isOpen == 1) {
            const openItem = data.openOption.find(openItem => openItem.code == item.code)
            if (openItem) {
              item.children = openItem.children || []
            }
          }
          optionList.push(item)
        }
      })

      this.sectionFirstList = this.getSection(optionList, systemList)
    },

    // /**
    //  * 编辑第二页数据
    //  */
    // getSecondPageData(data) {
    //   data = objDeepCopy(data)
    //   const openOption = data.openOption || []
    //   const optionList = []
    //   const systemList = []
    //   openOption.forEach(item => {
    //     if (item.isFixed) {
    //       systemList.push(item)
    //     } else {
    //       optionList.push(item)
    //     }
    //   })

    //   this.sectionNextList = this.getSection(optionList, systemList)
    // },

    getSection(optionList, systemList) {
      return [{
        title: '企业可选项',
        des: '选择企业工资表包含的所有工资项目类型，点开开关设置是否启用该项目类型，在下一步可以编辑具体的子项目',
        nextDes: '您可以新增或删除工资项，可以点击编辑项目名称和备注',
        list: optionList
      }, {
        title: '系统默认项',
        des: '系统默认项，即计薪过程的必要项目，默认启用',
        nextDes: '系统项是计薪过程中的必要项目，可以设置项目是否在工资表显示',
        list: systemList
      }]
    },

    getTableFields(data) {
      if (data.isPlus == 2 && data.isTax == 2) {
        return [{
          label: data.name,
          width: 200,
          prop: 'name'
        }, {
          label: data.remarks,
          prop: 'remarks'
        }]
      } else if (data.isPlus == 2) {
        return [{
          label: data.name,
          width: 200,
          prop: 'name'
        }, {
          label: data.remarks,
          prop: 'remarks'
        }, {
          label: '加/减项',
          width: 120,
          prop: 'isPlus'
        }]
      } else if (data.isTax == 2) {
        return [{
          label: data.name,
          width: 200,
          prop: 'name'
        }, {
          label: data.remarks,
          prop: 'remarks'
        }, {
          label: '是否计税',
          width: 120,
          prop: 'isTax'
        }]
      }
      return [{
        label: data.name,
        width: 200,
        prop: 'name'
      }, {
        label: data.remarks,
        prop: 'remarks'
      }, {
        label: '加/减项',
        width: 120,
        prop: 'isPlus'
      }, {
        label: '是否计税',
        width: 120,
        prop: 'isTax'
      }]
    },

    fieldFormatter(row, column, cellValue) {
      if (column.property == 'isPlus') {
        return {
          1: '加',
          0: '减'
        }[row[column.property]]
      } else if (column.property == 'isTax') {
        return {
          1: '是',
          0: '否'
        }[row[column.property]]
      }
      return row[column.property] || '--'
    },

    nextClick() {
      this.loading = true
      // 渲染慢 加loading
      setTimeout(() => {
        this.step = 2

        this.$nextTick(() => {
          this.loading = false
        })
      }, 300)
    },

    cancelClick() {
      this.step = 0
    },

    /**
     * 获取操作项
     */
    getHandleOptions(item) {
      const tempItem = this.optionTempList.find(option => option.code == item.code)
      if (tempItem) {
        const selectCodes = item.children.map(item => item.code)
        const handles = tempItem.children.map(tempItem => {
          tempItem.checked = selectCodes.includes(tempItem.code)
          return tempItem
        })
        if (handles.length) {
          const lastItem = objDeepCopy(handles[handles.length - 1])
          lastItem.isCustom = true
          lastItem.code += 1
          lastItem.name = '添加自定义项'
          handles.push(lastItem)
        }

        return handles
      } else {
        console.log('不存在')
        return []
      }
    },

    /**
     * 勾线添加删除操作
     */
    checkboxChange(check, item, list) {
      if (check) {
        list.push(item)
      } else {
        let rIndex = -1
        for (let index = 0; index < list.length; index++) {
          if (list[index].code == item.code) {
            rIndex = index
            break
          }
        }

        if (rIndex >= 0) {
          list.splice(rIndex, 1)
        }
      }
    },

    /**
     * 添加其他
     */
    dropdownCommand(handleItem, item, itemIndex) {
      // console.log(arguments)
      if (handleItem.isCustom) {
        let customItem = null
        for (let index = item.children.length - 1; index < 0; index--) {
          const element = item.children[index]
          if (element.isCustom) {
            customItem = element
            break
          }
        }

        // 创建data
        const createData = objDeepCopy(handleItem)
        createData.code = customItem ? customItem.code + 1 : handleItem.code
        item.createData = createData
        this.$set(item, 'showCreate', true)
        this.$refs.bottomDropdown[itemIndex].hide()
      }
    },

    /**
     * 取消新建自定义
     */
    createCancelClick(item) {
      this.resetItem(item)
      item.showCreate = false
    },

    createSaveClick(item) {
      if (!item.createName) {
        this.$message.error('请输入名称')
      } else {
        const createData = item.createData
        createData.isCustom = true
        createData.name = item.createName
        createData.remarks = item.createRemarks

        item.children.push(createData)
        this.resetItem(item)
        item.showCreate = false
      }
    },

    resetItem(item) {
      item.createName = ''
      item.createRemarks = ''
      item.createData = null
    },

    getSubChildren(list, index) {
      if (index == 1) {
        const newList = list.filter(item => item.isShow === 1)
        return newList && newList.length > 3 ? newList.slice(0, 3) : newList
      }
      return list && list.length > 3 ? list.slice(0, 3) : list
    }
  }
}
</script>
<style lang="scss" scoped>
.main {
  height:100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}

.main-body {
  height: calc(100% - 70px);
  background-color: white;
  border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
  padding: 15px 20px;
  overflow-y: auto;
}

.handle-bar {
  position: absolute;
  right: 20px;
  top: 0;
  z-index: 1;
}

.el-card {
  /deep/ .el-card__body {
    padding: 10px;
  }
}

.section {
  position: relative;

  &__title {
    font-weight: bold;
    font-size: 16px;
  }

  &__des {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }

  &__content {
    margin-top: 8px;
    padding-top: 15px;
    border-top: 1px solid #e6e6e6;
  }

  &-item {
    flex-shrink: 0;
    margin: 0 15px 15px 0;
    width: 200px;
    height: 145px;

    &__header {
      font-weight: bold;
      margin-bottom: 8px;
    }

    &__title {
      flex: 1;
      line-height: 20px;
    }

    .el-switch {
      flex-shrink: 0;
      margin-left: 8px;
    }

    &__body {
      padding: 8px;
      border-top: 1px solid #e6e6e6;
    }

    &__content {
      color: #999;
      line-height: 20px;
    }

    &--system {
      border: 1px solid #F9AB55;
      border-radius: 2px;
      color: #F9AB55;
      font-weight: normal;
      font-size: 12px;
      padding: 2px 3px;
    }
  }
}

.table-content + .table-content {
  margin-top: 15px;
}

.create-bar {
  height: 40px;
  line-height: 40px;
  .name-input {
    width: 170px;
  }

  .remarks-input {
    flex: 1;
  }

  .el-button {
    flex-shrink: 0;
  }

  .el-button:last-child {
    margin-right: 100px;
  }

  .el-input {
    margin: 0 15px;
  }
}

.section + .section {
  margin-top: 30px;
}

.el-table {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  border-bottom: none;
}

.el-table::before {
  display: none;
}

.el-dropdown {
  padding: 0 20px;
}
</style>
