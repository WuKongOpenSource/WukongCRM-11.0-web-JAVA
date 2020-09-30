<template>
  <div class="role-authorization">
    <xr-header
      ref="xrHeader"
      show-search
      label="角色权限控制"
      icon-class="wk wk-user"
      icon-color="#19B5F6"
      @search="headerSearch" />
    <div class="role-box">
      <!-- 左边导航 -->
      <div
        v-loading="roleMenuLoading"
        class="nav">
        <div class="nav__hd">
          {{ title }}
          <el-button
            type="text"
            icon="el-icon-circle-plus"
            class="add-btn"
            @click="newRoleBtn">创建角色</el-button>
        </div>
        <!-- 角色列表 -->
        <div class="role-nav-box">
          <div
            v-for="(item, index) in roleList"
            :key="index"
            :class="{'is-select' : item.roleId == roleActive.roleId}"
            class="menu-item"
            @click="roleMenuSelect(item)">
            {{ item.roleName }}
            <div
              v-if="item.remark != 'admin' && item.remark != 'project'"
              class="icon-close">
              <el-dropdown
                trigger="click"
                @command="roleHandleClick">
                <i
                  class="el-icon-arrow-down"
                  @click="roleDropdownClick(item)"/>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- 角色编辑 -->
      <el-dialog
        :title="roleTitle"
        :visible.sync="newRoleVisible"
        :before-close="newRoleClose"
        :close-on-click-modal="false"
        width="30%">
        <label class="label-title">角色名称</label>
        <el-input
          v-model="role.title"
          :maxlength="100"
          class="input-role"/>
        <span
          slot="footer"
          class="dialog-footer">
          <el-button
            type="primary"
            @click="newRoleSubmit">确 定</el-button>
          <el-button @click="newRoleClose">取 消</el-button>
        </span>
      </el-dialog>

      <!-- 右边内容 -->
      <div class="content-box">
        <el-tabs v-model="mainMenuIndex">
          <el-tab-pane
            label="角色员工"
            name="user">
            <div
              v-loading="userLoading"
              class="content-table">
              <flexbox class="content-table-header">
                <div class="content-table-header-reminder">
                  <reminder
                    v-if="showReminder"
                    :content="getReminderContent()"/>
                </div>
                <el-button
                  size="medium"
                  class="xr-btn--orange"
                  type="primary"
                  @click="addEmployees"> 关联员工 </el-button>
              </flexbox>
              <el-table
                :data="tableData"
                :height="tableHeight"
                style="width: 100%">
                <el-table-column
                  v-for="(item, index) in tableList"
                  :prop="item.field"
                  :label="item.label"
                  :key="index"
                  show-overflow-tooltip/>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <!-- <span class="el-icon-edit content-table-span"
                      @click="editBtn(scope.row)"></span> -->
                    <span
                      class="el-icon-delete content-table-span"
                      @click="delectEmployees(scope.row)"/>
                  </template>
                </el-table-column>
              </el-table>
              <div class="p-contianer">
                <el-pagination
                  :current-page="currentPage"
                  :page-sizes="pageSizes"
                  :page-size.sync="pageSize"
                  :total="total"
                  class="p-bar"
                  background
                  layout="prev, pager, next, sizes, total, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"/>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-if="roleActive && showRuleSet"
            label="角色权限"
            name="rule">
            <!-- 权限管理 -->
            <div
              v-loading="ruleLoading"
              class="jurisdiction-box">
              <el-button
                v-if="roleActive"
                size="medium"
                type="primary"
                class="jurisdiction-edit"
                @click="ruleSubmit"> 保存 </el-button>
              <el-tabs v-model="ruleMenuIndex">
                <el-tab-pane
                  v-for="(item, index) in ruleMenuList"
                  :key="index"
                  :label="item.label"
                  :name="item.index">
                  <div
                    v-if="item.type == 'tree'"
                    :style="{ height: treeHeight + 'px'}"
                    class="jurisdiction-content">
                    <div class="jurisdiction-content-checkbox">
                      <el-tree
                        :data="item.data"
                        :ref="'tree' + item.index"
                        :indent="0"
                        :expand-on-click-node="false"
                        :props="defaultProps"
                        show-checkbox
                        node-key="menuId"
                        style="height: 0;"
                        empty-text=""
                        default-expand-all>
                        <span
                          slot-scope="{ node }"
                          :class="{ 'node-label': node.level == 1 || node.level == 2} ">{{ node.label }}<el-button
                            v-if="node.level == 2 && canSetField(node.data.realm)"
                            icon="wk wk-manage"
                            type="text"
                            @click="fieldSetClick(node)" >字段授权</el-button></span>
                      </el-tree>
                    </div>
                  </div>
                  <div
                    v-else
                    class="jurisdiction-content">
                    <div class="data-radio">
                      <el-radio-group v-model="item.value">
                        <el-radio :label="1">本人</el-radio>
                        <el-radio :label="2">本人及下属</el-radio>
                        <el-radio :label="3">本部门</el-radio>
                        <el-radio :label="4">本部门及下属部门</el-radio>
                        <el-radio :label="5">全部</el-radio>
                      </el-radio-group>
                    </div>
                  </div>

                </el-tab-pane>
              </el-tabs>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-- 关联员工 -->
    <relate-empoyee
      :visible.sync="relateEmpoyeeShow"
      :role-id="roleId"
      @save="employeesSave"/>
    <!-- 字段授权 -->
    <field-set-dialog
      :visible.sync="setFieldShow"
      :role-id="roleId"
      :label="setFieldLabel"
    />
  </div>
</template>

<script>
import { userListAPI } from '@/api/common'
import {
  systemRuleByTypeAPI,
  roleAddAPI,
  roleDeleteAPI,
  roleCopyAPI,
  roleUpdateAPI,
  updateRoleMenuAPI,
  unbindingUserAPI,
  systemRoleByTypeAPI
} from '@/api/admin/role'

import RelateEmpoyee from './components/RelateEmpoyee'
import FieldSetDialog from './components/FieldSetDialog'
import Reminder from '@/components/Reminder'
import XrHeader from '@/components/XrHeader'

import crmTypeModel from '@/views/crm/model/crmTypeModel'

export default {
  components: {
    RelateEmpoyee,
    FieldSetDialog,
    Reminder,
    XrHeader
  },

  data() {
    return {
      pid: '',
      title: '',
      searchInput: '',
      tableData: [], // 与角色关联的员工
      tableHeight: document.documentElement.clientHeight - 305, // 表的高度
      treeHeight: document.documentElement.clientHeight - 230, // 表的3度
      currentPage: 1,
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0,
      tableList: [
        { label: '姓名', field: 'realname' },
        { label: '部门', field: 'deptName' },
        { label: '职位', field: 'post' },
        { label: '角色', field: 'roleName' }
      ],

      // 新建角色
      newRoleVisible: false,
      role: {}, // 操作角色的框 关联的信息
      roleList: [], // 角色列表 list属性 是信息

      mainMenuIndex: 'user', // 角色员工  角色权限 切换 默认左边
      // 权限管理
      ruleMenuIndex: 'data', // 默认模块 工作台
      ruleMenuList: [],
      defaultProps: {
        children: 'childMenu',
        label: 'menuName'
      },
      relateEmpoyeeShow: false,
      // 选中的角色
      roleActive: null,
      dropdownHandleRole: null, // 下拉操作编辑角色
      // 新建编辑角色title
      roleTitle: '',
      //   加载
      roleMenuLoading: false,
      // 权限加载中
      ruleLoading: false,
      // 员工列表加载中
      userLoading: false,

      // 字段授权
      setFieldLabel: '',
      setFieldShow: false
    }
  },

  computed: {
    roleId() {
      if (this.roleActive) {
        return this.roleActive.roleId
      }
      return ''
    },

    // 展示角色权限
    showRuleSet() {
      if (this.roleActive) {
        return (
          this.roleActive.remark != 'admin' &&
          this.roleActive.remark != 'project'
        )
      }

      return false
    },

    // 展示提示问题
    showReminder() {
      if (this.roleActive) {
        return this.roleActive.remark == 'project'
      }

      return false
    }
  },

  watch: {},

  mounted() {
    /** 控制table的高度 */
    window.onresize = () => {
      this.tableHeight = document.documentElement.clientHeight - 305
      this.treeHeight = document.documentElement.clientHeight - 230
    }
    /** 获取权限信息 */
    this.pid = this.$route.params.pid
    this.title = this.$route.params.title
    this.getRulesList()
    this.getRoleList()
  },

  beforeRouteUpdate(to, from, next) {
    this.pid = to.params.pid
    this.title = to.params.title
    this.roleActive = null
    this.roleList = []
    this.mainMenuIndex = 'user'
    this.currentPage = 1
    this.total = 0
    this.tableData = []
    if (this.$refs.xrHeader) {
      this.$refs.xrHeader.search = ''
      this.searchInput = ''
    }
    this.getRulesList()
    this.getRoleList()
    next()
  },

  methods: {
    /**
     * 获取权限规则信息
     */
    getRulesList() {
      systemRuleByTypeAPI(this.pid).then(res => {
        if (res.data.data) {
          this.ruleMenuList = [
            {
              label: '模块功能',
              index: 'data',
              type: 'tree',
              value: [],
              data: [res.data.data]
            }
          ]
          if (res.data.bi) {
            this.ruleMenuList.push({
              label: '数据分析',
              index: 'bi',
              type: 'tree',
              value: [],
              data: [res.data.bi]
            })
          }
        } else {
          this.ruleMenuList = []
        }

        this.getRoleRulesInfo()
      })
    },

    /**
     * 获取角色列表
     */
    getRoleList() {
      this.roleMenuLoading = true
      systemRoleByTypeAPI(this.pid)
        .then(res => {
          this.roleList = res.data
          /** 判断数据是否存在 */
          let hasActive = false
          if (this.roleActive) {
            for (let index = 0; index < this.roleList.length; index++) {
              const item = this.roleList[index]
              if (item.roleId == this.roleActive.roleId) {
                this.roleActive = item
                this.getRoleRulesInfo()
                hasActive = true
                break
              }
            }
          }
          if (!hasActive && this.roleList.length) {
            this.roleActive = this.roleList[0]
            this.getRoleRulesInfo()
          }
          this.refreshUserList()
          this.roleMenuLoading = false
        })
        .catch(() => {
          this.roleMenuLoading = false
        })
    },

    /**
     * 关联员工
     */
    addEmployees() {
      this.relateEmpoyeeShow = true
    },

    /**
     * 关联员工确定
     */
    employeesSave(val) {
      this.relateEmpoyeeShow = false
      this.getUserList()
    },

    /**
     * 删除
     */
    delectEmployees(val) {
      this.$confirm('此操作将永久删除是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.userLoading = true
          unbindingUserAPI({
            userId: val.userId,
            roleId: this.roleActive.roleId
          }).then(res => {
            this.userLoading = false
            this.getUserList()
            this.$message.success('删除成功')
          }).catch(() => {
            this.userLoading = false
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    /**
     * 新建角色
     */
    newRoleClose() {
      this.newRoleVisible = false
    },
    newRoleBtn() {
      this.roleTitle = '新建角色'
      this.newRoleVisible = true
      this.role = {}
    },

    /**
     * 角色操作
     */
    roleDropdownClick(value) {
      this.dropdownHandleRole = value
    },
    roleHandleClick(command) {
      if (command == 'edit') {
        this.roleEditBtn(this.dropdownHandleRole)
      } else if (command == 'copy') {
        this.ticketsBtn(this.dropdownHandleRole)
      } else if (command == 'delete') {
        this.roleDelect(this.dropdownHandleRole)
      }
    },

    /**
     * 角色说明文字
     */
    getReminderContent() {
      if (this.roleActive && this.roleActive.remark == 'project') {
        return '项目管理员拥有“项目管理”模块所有权限，能看到并维护所有项目信息'
      }
      return ''
    },

    /**
     * 角色编辑
     */
    roleEditBtn(val) {
      this.roleTitle = '编辑角色'
      this.role = {
        title: val.roleName,
        pid: val.roleType,
        id: val.roleId
      }
      this.newRoleVisible = true
    },

    /**
     * 复制
     */
    ticketsBtn(val) {
      this.$confirm('确定此操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          roleCopyAPI({ roleId: val.roleId }).then(res => {
            this.$message.success('复制成功')
            this.getRoleList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    /**
     * 删除
     */
    roleDelect(val) {
      this.$confirm('此操作将永久删除是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          roleDeleteAPI({ roleId: val.roleId }).then(res => {
            if (this.roleList.length) {
              this.roleActive = this.roleList[0]
              // 点击角色 复制权限 用于编辑操作
              this.getRoleRulesInfo()
            }
            this.getRoleList()
            this.$message.success('删除成功')
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    newRoleSubmit() {
      if (!this.role.title) {
        this.$message.error('角色名称不能为空')
      } else {
        if (this.roleTitle == '新建角色') {
          roleAddAPI({
            roleName: this.role.title,
            roleType: this.pid
          }).then(res => {
            this.getRoleList()
            this.$message.success('添加成功')
            this.newRoleClose()
          })
        } else {
          roleUpdateAPI({
            roleName: this.role.title,
            roleType: this.role.pid,
            roleId: this.role.id
          }).then(res => {
            this.getRoleList()
            this.$message.success('编辑成功')
            this.newRoleClose()
          })
        }
      }
    },

    /**
     * 角色列表点击
     */
    roleMenuSelect(val) {
      this.roleActive = val

      if (this.mainMenuIndex == 'rule' && !this.showRuleSet) {
        this.mainMenuIndex = 'user'
      }

      this.getRoleRulesInfo()

      this.refreshUserList()
    },

    /**
     * 获取权限信息 需在roleActive获取之后
     */
    getRoleRulesInfo() {
      if (this.roleActive && this.ruleMenuList.length) {
        if (this.pid == 2 || this.pid == 10) {
          const lastItem = this.ruleMenuList[this.ruleMenuList.length - 1]
          if (lastItem.type != 'data') {
            this.ruleMenuList.push({
              label: '数据权限',
              index: 'info',
              type: 'data',
              value: this.roleActive.dataType
            })
          }
        }

        for (let index = 0; index < this.ruleMenuList.length; index++) {
          const element = this.ruleMenuList[index]
          if (element.type == 'tree') {
            element.rules = this.getRoleRules(
              this.roleActive.rules[element.index],
              element.data[0]
            )
            this.$nextTick(() => {
              const treeRefs = this.$refs['tree' + element.index]
              if (treeRefs) {
                if (
                  Object.prototype.toString.call(treeRefs) == '[object Array]'
                ) {
                  treeRefs.length && treeRefs[0].setCheckedKeys(element.rules)
                } else {
                  treeRefs.setCheckedKeys(element.rules)
                }
              }
            })
          } else {
            element.value = this.roleActive.dataType
          }
        }
      }
    },

    /**
     * 获得check的实际数据
     */
    getRoleRules(array, tree) {
      if (!array) {
        array = []
      }

      var hasRemove = false
      var copyArray = this.copyItem(array)
      for (
        let firstIndex = 0;
        firstIndex < tree.childMenu.length;
        firstIndex++
      ) {
        const firstItem = tree.childMenu[firstIndex]

        if (!firstItem.hasOwnProperty('children')) {
          if (firstItem.length + 1 != copyArray.length) {
            this.removeItem(copyArray, tree.id)
          }
          return copyArray
        }

        for (let index = 0; index < array.length; index++) {
          const element = array[index]
          var temps = []
          for (
            let secondIndex = 0;
            secondIndex < firstItem.childMenu.length;
            secondIndex++
          ) {
            const secondItem = firstItem.childMenu[secondIndex]
            if (secondItem.id == element) {
              temps.push(secondItem)
            }
          }
          if (temps.length != firstItem.childMenu.length) {
            hasRemove = true
            this.removeItem(copyArray, firstItem.id)
          }
        }
      }

      if (hasRemove) {
        this.removeItem(copyArray, tree.id)
      }

      var checkedKey = []
      for (let index = 0; index < copyArray.length; index++) {
        const element = copyArray[index]
        if (element) {
          checkedKey.push(parseInt(element))
        }
      }

      return checkedKey
    },
    copyItem(array) {
      var temps = []
      for (let index = 0; index < array.length; index++) {
        temps.push(array[index])
      }
      return temps
    },
    removeItem(array, item) {
      var removeIndex = -1
      for (let index = 0; index < array.length; index++) {
        if (item == array[index]) {
          removeIndex = index
          break
        }
      }
      if (removeIndex > 0) {
        array.splice(removeIndex, 1)
      }
    },
    containItem(array, item) {
      for (let index = 0; index < array.length; index++) {
        if (item == array[index]) {
          return true
        }
      }
      return false
    },

    /**
     * 头部搜索
     */
    headerSearch(search) {
      this.searchInput = search
      this.refreshUserList()
    },

    /**
     * 刷新员工列表
     */
    refreshUserList() {
      this.currentPage = 1
      this.getUserList()
    },

    /**
     * 员工列表
     */
    getUserList() {
      if (!this.roleActive) {
        return
      }

      this.userLoading = true
      userListAPI({
        page: this.currentPage,
        limit: this.pageSize,
        roleId: this.roleActive.roleId,
        realname: this.searchInput
      })
        .then(res => {
          this.tableData = res.data.list
          this.total = res.data.totalRow
          this.userLoading = false
        })
        .catch(() => {
          this.userLoading = false
        })
    },
    /**
     * 更改每页展示数量
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.refreshUserList()
    },

    /**
     * 更改当前页数
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getUserList()
    },

    // 权限提交
    ruleSubmit() {
      this.ruleLoading = true

      let rules = []
      let infoData = ''
      for (let index = 0; index < this.ruleMenuList.length; index++) {
        const element = this.ruleMenuList[index]
        if (element.type == 'tree') {
          const treeRefs = this.$refs['tree' + element.index]
          if (treeRefs) {
            if (Object.prototype.toString.call(treeRefs) == '[object Array]') {
              rules = rules.concat(treeRefs[0].getCheckedKeys())
            } else {
              rules = rules.concat(treeRefs.getCheckedKeys())
            }
          }
        } else {
          infoData = element.value
        }
      }

      updateRoleMenuAPI({
        menuIds: rules,
        dataType: infoData,
        roleId: this.roleActive.roleId,
        roleName: this.roleActive.roleName
      })
        .then(res => {
          this.getRoleList()
          this.$message.success('编辑成功')
          this.ruleLoading = false
        })
        .catch(() => {
          this.ruleLoading = false
        })
    },

    /**
     * 是否能字段设置
     */
    canSetField(type) {
      if (this.pid == 10) return false
      return ['leads', 'customer', 'contacts', 'business', 'contract', 'receivables', 'product', 'visit'].includes(type) &&
      this.ruleMenuIndex === 'data'
    },

    /**
     * 权限设置
     */
    fieldSetClick(node) {
      this.setFieldLabel = crmTypeModel[node.data.realm]
      this.setFieldShow = true
    }
  }
}
</script>

<style lang="scss" scoped>
.role-authorization {
  padding: 0 15px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.title {
  font-size: 18px;
  height: 40px;
  padding: 0 20px;
  line-height: 40px;
  margin: 10px 0;
  color: #333;
}
.role-box {
  height: calc(100% - 60px);
  overflow: hidden;
  position: relative;
}
.nav {
  width: 280px;
  background: #fff;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.nav__hd {
  position: relative;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid $xr-border-line-color;

  .el-button {
    position: absolute;
    top: 10px;
    right: 15px;
  }
}

.content-box {
  background: #fff;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  margin-left: 295px;
  height: 100%;
  overflow: hidden;
  padding-top: 10px;
  position: relative;
}
.content-table {
  overflow: hidden;
}
.content-table > .el-button {
  float: right;
  margin-bottom: 15px;
  margin-right: 30px;
}
.content-box .content-table-span {
  color: #2362FB;
  margin-left: 5px;
  cursor: pointer;
}

.content-table-header {
  padding: 0 15px 5px;
  .content-table-header-reminder {
    flex: 1;
    margin-right: 5px;
  }
}

/* 权限管理 */
.jurisdiction-content {
  height: calc(100% - 61px);
  position: relative;
  overflow: hidden;
}
.content-left {
  height: 100%;
  margin-right: 250px;
  overflow: hidden;
}
.content-right {
  width: 250px;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
}
.jurisdiction-box {
  padding-bottom: 15px;
  height: calc(100% - 61px);
  overflow: hidden;
  position: relative;
}
.jurisdiction-content-checkbox {
  border-right: 1px dashed $xr-border-line-color;
  height: calc(100% - 47px);
  overflow-y: scroll;
  padding: 20px;

  /deep/ .el-tree-node__content:hover {
    background-color: white;
    color: $xr-color-primary;
  }
}
.jurisdiction-content-checkbox
  .el-tree
  /deep/
  .el-tree-node
  > .el-tree-node__content {
  margin-bottom: 20px;
  width: 150px;
}
.jurisdiction-content-checkbox /deep/ .el-tree .el-tree-node {
  white-space: inherit;
  margin-bottom: 5px;
}
.jurisdiction-content-checkbox
  /deep/
  .el-tree
  > .el-tree-node
  > .el-tree-node__children
  > .is-expanded
  > .el-tree-node__children
  > .is-expanded {
  display: inline-block;
}
.role-authorization /deep/ .el-tree-node__expand-icon {
  display: none;
}
.data-radio {
  padding: 5px 30px;
}
.data-radio .el-radio {
  display: block;
  margin: 20px 0;
}
/* 新建角色 */
.input-role {
  padding: 10px 0 20px;
  width: 100%;
}
.role-nav-box {
  line-height: 30px;
  overflow-y: auto;
  padding: 20px 0;
  height: calc(100% - 50px);
}
// 菜单
.menu-item {
  color: #333;
  font-size: 13px;
  padding: 0 15px;
  height: 40px;
  line-height: 40px;
  cursor: pointer;
  position: relative;
  .icon-close {
    position: absolute;
    top: 0;
    right: 8px;
    z-index: 1;
    display: none;
  }
}

.menu-item:hover,
.menu-item.is-select {
  background-color: $xr--background-color-base;
}

.menu-item:hover::before,
.menu-item.is-select::before {
  content: ' ';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 2px;
  background-color: #5383ed;
}

.role-nav-box .menu-item:hover .icon-close {
  display: block;
  float: right;
}
.jurisdiction-edit {
  text-align: right;
  padding: 10px 30px;
  position: absolute;
  top: 0;
  right: 20px;
  z-index: 3;
}

/** 分页布局 */
.p-contianer {
  position: relative;
  background-color: white;
  height: 44px;
  .p-bar {
    float: right;
    margin: 5px 100px 0 0;
    font-size: 14px !important;
  }
}

// .el-tabs /deep/ .el-tabs__nav-wrap::after {
//   display: none !important;
// }

.el-tabs /deep/ .el-tabs__header {
  padding: 0 17px;
  margin: 0 0 15px !important;
}

.el-tabs /deep/ .el-tabs__item {
  font-size: 13px !important;
  height: 40px !important;
  line-height: 40px !important;
}

.node-label {
  font-weight: bold;
  font-size: 15px;
  position: relative;
  .el-button {
    position: absolute;
    top: -8px;
    right: -80px;
    /deep/ span {
      margin-left: 3px;
    }
  }
}

@import '../styles/table.scss';
</style>
