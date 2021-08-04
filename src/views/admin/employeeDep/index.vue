<template>
  <div class="employee-dep-management">
    <xr-header
      :content.sync="searchInput"
      placeholder="请输入员工名称/手机号"
      show-search
      icon-class="wk wk-s-seas"
      icon-color="#26D4DA"
      label="员工与部门管理"
      @search="headerSearch">
      <el-button
        v-if="userSaveAuth"
        slot="ft"
        class="xr-btn--orange"
        type="primary"
        @click="bulkImportClick">批量导入</el-button>
    </xr-header>
    <div class="system-content">
      <!-- 左边导航栏 -->
      <div
        v-loading="depLoading"
        class="system-nav">
        <div class="system-nav__title">
          企业组织架构
        </div>
        <div class="system-nav__content">
          <div class="section">
            <div class="section__title">员工</div>
            <div class="section__content">
              <flexbox
                v-for="(item, index) in employeeMenu"
                :key="index"
                :class="['menu-item', { 'is-select' : currentMenuData && currentMenuData.type == item.type}]"
                @click.native="changeUserClick(item)">
                <i
                  :class="item.icon"
                  class="menu-item__icon" />
                <div class="menu-item__content">{{ item.label }}&nbsp;<span v-if="item.count > 0" style="color: #999;">({{ item.count }})</span></div>
              </flexbox>
            </div>
          </div>

          <div class="section">
            <div class="section__title">部门
              <el-button
                v-if="strucSaveAuth"
                type="text"
                icon="el-icon-circle-plus"
                class="add-btn"
                @click="addStruc">创建部门</el-button>
            </div>
            <div class="section__content">
              <el-tree
                ref="tree"
                :data="showDepData"
                node-key="deptId"
                highlight-current
                default-expand-all
                @node-click="changeDepClick">
                <flexbox
                  slot-scope="{ node }"
                  :class="{ 'is-current': node.isCurrent}"
                  class="node-data">
                  <i
                    v-if="node.level == 1"
                    class="wk wk-department" />
                  <span
                    v-else
                    class="node-data__mark" />

                  <div class="node-data__label text-one-line ">{{ node.label }}</div>
                  <i
                    v-if="node.childNodes && node.childNodes.length"
                    :class="{ 'is-close': !node.expanded }"
                    class="wk wk-up-unfold" />
                </flexbox>
              </el-tree>
            </div>
          </div>

        </div>
      </div>
      <!-- 右边内容 -->
      <div class="system-view-table flex-index">
        <flexbox
          v-if="selectionList.length === 0"
          justify="space-between"
          class="table-top">
          <div class="table-top__title">
            <span>{{ `${currentMenuData ? currentMenuData.label : ''}` }}<template v-if="!isDepUserShow">{{ `：${userTotal || 0}` }}</template></span>
            <el-tooltip
              v-if="currentMenuData && currentMenuData.tips"
              :content="currentMenuData.tips"
              effect="dark"
              placement="top">
              <i class="wk wk-help wk-help-tips"/>
            </el-tooltip>
            <reminder
              v-if="currentMenuData && currentMenuData.type && currentMenuData.type == 'all'"
              class="all-user-reminder"
              content="未添加部门和角色的员工无法正常登录系统" />
          </div>
          <div>

            <el-checkbox
              v-if="isDepUserShow"
              v-model="isNeedChild"
              :true-label="1"
              :false-label="0"
              @change="refreshUserList">包含子部门</el-checkbox>
            <template v-if="userSaveAuth">
              <el-dropdown v-if="hasHrmAuth" @command="createEmployeeClick">
                <el-button
                  type="text"
                  icon="el-icon-circle-plus">添加</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="create">新建员工</el-dropdown-item>
                  <el-dropdown-item command="selectHrm">从人力资源选择员工</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button
                v-else
                type="text"
                icon="el-icon-circle-plus"
                @click="addEmployee">添加员工</el-button>
            </template>
            <el-button
              v-if="strucSaveAuth && currentMenuData && currentMenuData.id"
              type="text"
              icon="el-icon-circle-plus"
              @click="appendStruc(currentMenuData)">创建子部门</el-button>
            <el-dropdown
              v-if="currentMenuData && currentMenuData.id && strucMoreOptions.length > 0"
              trigger="click"
              @command="strucMoreHandleClick">
              <el-button icon="el-icon-more" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in strucMoreOptions"
                  :key="index"
                  :icon="item.icon | wkIconPre"
                  :command="item.type">{{ item.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </flexbox>
        <flexbox
          v-if="selectionList.length > 0"
          class="selection-bar">
          <div class="selected—title">已选中 <span class="selected—count">{{ selectionList.length }}</span> 项</div>
          <flexbox class="selection-items-box">
            <el-button
              v-for="(item, index) in selectionInfo"
              :icon="item.icon | wkIconPre"
              :key="index"
              type="primary"
              @click.native="selectionBarClick(item.type)">{{ item.name }}</el-button>
          </flexbox>
        </flexbox>
        <div class="flex-box">
          <el-table
            v-loading="loading"
            id="depTable"
            :data="tableData"
            :height="tableHeight"
            @selection-change="handleSelectionChange"
            @row-click="rowClick">
            <el-table-column
              v-if="tableUpdateAuth"
              type="selection"
              width="55" />
            <el-table-column
              prop="realname"
              width="150"
              show-overflow-tooltip
              label="姓名">
              <template slot-scope="{ row, column }">
                <span class="status-name">
                  <span :style="{'background-color' : getStatusColor(row.status)}" class="status-mark" />
                  <span v-if="row.userIdentity === 0" class="main-mark">主账号</span>
                  <span v-if="row.userIdentity === 1" class="main-mark">负责人</span>
                  <span>{{ row.realname }}</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              v-for="(item, index) in fieldList"
              :key="index"
              :width="item.width"
              :prop="item.field"
              :label="item.value"
              :formatter="tableFormatter"
              show-overflow-tooltip />
            <el-table-column />
          </el-table>
          <div class="p-contianer">
            <div class="status-des">
              <div
                v-for="item in statusOptions"
                :key="item.value"
                class="status-des-item">
                <div :style="{'background-color' : getStatusColor(item.value)}" />
                {{ item.label }}
              </div>
            </div>
            <el-pagination
              :current-page="currentPage"
              :page-sizes="pageSizes"
              :page-size.sync="pageSize"
              :total="total"
              class="p-bar"
              background
              layout="prev, pager, next, sizes, total, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </div>
    <!-- 导航新增部门 -->
    <el-dialog
      :visible.sync="depCreateDialog"
      :close-on-click-modal="false"
      :title="depCreateTitle"
      :before-close="depCreateClose"
      width="500px">
      <flexbox class="nav-dialog-div">
        <label>{{ depCreateLabel }}：</label>
        <el-input
          v-model="depCreateLabelValue"
          :maxlength="20"
          placeholder="请输入内容" />
      </flexbox>
      <flexbox
        v-if="depSelect != 0"
        class="nav-dialog-div">
        <label>上级部门：</label>
        <el-select
          v-model="depSelect"
          :clearable="false">
          <el-option
            v-for="item in superDepList"
            :key="item.deptId"
            :label="item.name"
            :value="item.deptId" />
        </el-select>
      </flexbox>
      <flexbox
        class="nav-dialog-div">
        <label>部门负责人：</label>
        <wk-user-select
          v-model="depOwnerUserId"
          radio
        />
      </flexbox>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="depCreateDialog = false">取 消</el-button>
        <el-button
          type="primary"
          @click="submitDialog">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 详情 -->
    <employee-detail
      v-if="employeeDetailDialog"
      :data="dialogData"
      @edit="editBtn"
      @command="handleCommand"
      @hide-view="employeeDetailDialog=false" />
    <!-- 重置密码 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="resetPasswordVisible"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :before-close="resetPasswordClose"
      title="重置密码"
      width="30%">
      <div class="el-password">
        <el-form
          ref="passForm"
          :model="passForm"
          :rules="rules">
          <el-form-item
            label="密码"
            prop="password">
            <el-input
              v-model="passForm.password"
              type="password" />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="resetPasswordClose">取 消</el-button>
        <el-button
          type="primary"
          @click="passSubmit(passForm)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 重置登录账号 -->
    <el-dialog
      v-loading="loading"
      :visible.sync="resetUserNameVisible"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :before-close="()=>{resetUserNameVisible = false}"
      title="重置登录账号"
      width="30%">
      <div class="el-password">
        <el-form
          ref="resetUserNameForm"
          :model="resetUserNameForm"
          :rules="dialogRules">
          <el-form-item
            label="新账号（手机号）"
            prop="username">
            <el-input v-model="resetUserNameForm.username" />
          </el-form-item>
          <el-form-item
            label="新密码"
            prop="password">
            <el-input
              v-model="resetUserNameForm.password"
              type="password" />
          </el-form-item>

          <template v-if="isManageReset">
            <el-popover
              v-model="slideVerifyShow"
              :disabled="slideVerifyPass || !canSlideVerify"
              placement="top-start"
              width="332"
              popper-class="no-padding-popover"
              trigger="click">
              <slide-verify
                :phone="resetUserNameForm.username"
                slider-text="向右滑动"
                @success="sliderSuccess"
                @fail="sliderFail"
                @refresh="sliderRefresh"
                @close="slideVerifyShow = false" />
              <div
                slot="reference"
                :class="{success: slideVerifyPass}"
                class="verify-picture">
                <template v-if="!slideVerifyPass">
                  <img
                    src="~@/assets/login/verify_picture.png"
                    alt=""
                    class="icon">
                  <span class="text">点击完成验证</span>
                </template>
                <template v-else>
                  <img
                    src="~@/assets/login/verify_success.png"
                    alt=""
                    class="icon">
                  <span class="text">验证成功</span>
                </template>
              </div>
            </el-popover>

            <el-form-item>
              <div class="sms-box">
                <el-input
                  ref="smscode"
                  v-model.trim="resetUserNameForm.smscode"
                  placeholder="请输入短信验证码" />
                <el-button
                  :disabled="codeTime !== codeSecond"
                  @click="getSmsCode">
                  <div class="btn-content">
                    <template v-if="codeTime === codeSecond">
                      <!--<span class="icon wk wk-shouji" />-->
                      <span>获取验证码</span>
                    </template>
                    <template v-else>
                      <span>重新发送({{ codeSecond }}s)</span>
                    </template>
                  </div>
                </el-button>
              </div>
            </el-form-item>
          </template>
        </el-form>
        <div
          class="tips"
          style="margin-top: 20px;">重置登录帐号后，员工需用新账号登录。请及时告知员工，确保正常使用</div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button @click="()=>{resetUserNameVisible = false}">取 消</el-button>
        <el-button
          type="primary"
          @click="passUserNameSubmit(resetUserNameForm)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 新建和编辑 -->
    <el-dialog
      v-loading="loading"
      v-if="employeeCreateDialog"
      :title="dialogTitle"
      :visible.sync="employeeCreateDialog"
      :close-on-click-modal="false"
      :modal-append-to-body="true"
      :append-to-body="true"
      :before-close="newHandleClose"
      width="60%">
      <el-form
        ref="dialogRef"
        :inline="true"
        :model="formInline"
        :rules="dialogRules"
        class="new-dialog-form"
        label-width="80px"
        label-position="top">
        <el-form-item
          v-for="(item, index) in tableList"
          :label="item.value"
          :prop="item.field"
          :key="index">
          <span slot="label">{{ item.value }}</span>
          <el-tooltip
            v-if="item.tips"
            slot="label"
            :content="item.tips"
            effect="dark"
            placement="top">
            <i class="wukong wukong-help_tips" />
          </el-tooltip>
          <template v-if="item.type == 'select'">
            <el-select
              v-model="formInline[item.field]"
              filterable>
              <el-option
                v-for="optionItem in optionsList[item.field]"
                :key="optionItem.id"
                :label="optionItem.name"
                :value="optionItem.id" />
            </el-select>
          </template>
          <template v-else-if="item.type == 'user'">
            <wk-user-select
              v-model="formInline[item.field]"
              radio
            />
          </template>
          <template v-else-if="item.type == 'structure'">
            <wk-dep-select
              v-model="formInline[item.field]"
              radio
              @change="depChange"
            />
          </template>
          <template v-else-if="item.type == 'selectCheckout'">
            <el-select
              v-model="formInline[item.field]"
              :popper-append-to-body="false"
              popper-class="select-popper-class"
              filterable
              multiple>
              <el-option-group
                v-for="group in groupsList"
                :key="group.pid"
                :label="group.name">
                <el-option
                  v-for="item in group.list"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId" />
              </el-option-group>
            </el-select>
          </template>
          <el-input
            v-else
            v-model="formInline[item.field]"
            :maxlength="100"
            :disabled="dialogTitle == '编辑员工' && item.field == 'username'" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer">
        <el-button
          type="primary"
          @click="newDialogSubmit">保 存</el-button>
        <el-button @click="employeeCreateDialog = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 批量导入 -->
    <bulk-import-user
      :show="bulkImportShow"
      @close="bulkImportShow=false"
      @success="refreshUserList" />
    <!-- 选择添加人资员工 -->
    <hrm-employee-add-dialog
      v-if="hrmAddDialogShow"
      :visible.sync="hrmAddDialogShow"
      :rules="dialogRules"
      :options-list="optionsList"
      :groups-list="groupsList"
      @change="refreshUserList"
    />
    <!-- 角色编辑 -->
    <edit-role-dialog
      v-if="editRoleDialogShow"
      :user-show="editRoleType === 'copyRole'"
      :selection-list="selectionList"
      :visible.sync="editRoleDialogShow"
      @change="getUserList"
    />
    <!-- 重置部门 -->
    <edit-dep-dialog
      v-if="editDepDialogShow"
      :selection-list="selectionList"
      :visible.sync="editDepDialogShow"
      @change="getUserList"
    />
  </div>
</template>

<script>
import {
  depDeleteAPI,
  depEditAPI,
  depSaveAPI,
  userAddAPI,
  userEditAPI,
  adminRoleGetRoleListAPI,
  adminUsersUpdatePwdAPI,
  adminUsersUsernameEditAPI,
  adminUsersManagerUsernameEditAPI,
  usersEditStatusAPI,
  adminUserCountNumOfUserAPI
} from '@/api/admin/employeeDep'

import { userListAPI, depListAPI } from '@/api/common' // 直属上级接口
import { sendSmsAPI } from '@/api/login'

import { mapGetters } from 'vuex'

import BulkImportUser from './components/BulkImportUser'
import EmployeeDetail from './components/EmployeeDetail'
import XrHeader from '@/components/XrHeader'
import Reminder from '@/components/Reminder'
import SlideVerify from '@/components/SlideVerify'
import HrmEmployeeAddDialog from './components/HrmEmployeeAddDialog'
import EditRoleDialog from './components/EditRoleDialog'
import EditDepDialog from './components/EditDepDialog'
import WkUserSelect from '@/components/NewCom/WkUserSelect'
import WkDepSelect from '@/components/NewCom/WkDepSelect'

import { chinaMobileRegex, objDeepCopy } from '@/utils'

export default {
  /** 系统管理 的 员工部门管理 */
  name: 'EmployeeDep',
  components: {
    EmployeeDetail,
    BulkImportUser,
    XrHeader,
    Reminder,
    SlideVerify,
    HrmEmployeeAddDialog,
    EditRoleDialog,
    EditDepDialog,
    WkUserSelect,
    WkDepSelect
  },
  data() {
    return {
      employeeMenu: [
        {
          icon: 'wk wk-employees',
          label: '所有员工',
          type: 'all',
          field: 'allUserCount',
          count: 0,
          tips: '未添加部门和角色的员工无法正常登录系统'
        },
        {
          icon: 'wk wk-new-employee',
          label: '新加入的员工',
          type: 'new',
          field: 'addNewlyCount',
          count: 0,
          tips: '入职7天内的员工'
        },
        {
          icon: 'wk wk-active-employee',
          label: '激活员工',
          type: 'active',
          field: 'activateCount',
          count: 0,
          tips: '已经登录系统的员工'
        },
        {
          icon: 'wk wk-inactive-employee',
          label: '未激活员工',
          type: 'inactive',
          field: 'inactiveCount',
          count: 0,
          tips: '未登录过系统的员工'
        },
        {
          icon: 'wk wk-disable-employees',
          label: '停用员工',
          type: 'disable',
          field: 'disableCount',
          count: 0,
          tips: '已禁用的员工，无法登录系统'
        }
      ],
      // 右边导航
      depCreateTitle: '新建',
      depCreateDialog: false, // 控制部门新增 编辑 数据
      depSelect: '',
      // 上级部门
      superDepList: [],
      depCreateLabel: '',
      depOwnerUserId: '', // 部门负责人
      allDepData: [], // 包含全部部门信息
      showDepData: [],
      depLoading: false, // 左侧部门loading效果
      // 列表
      loading: false, // 表的加载动画
      searchInput: '', // 搜索
      statusOptions: [
        { value: '0', label: '禁用' },
        { value: '1', label: '激活' },
        { value: '2', label: '未激活' }
      ],
      // selectModel: '', // 状态值 用于筛选
      /** 列表 */
      fieldList: [
        { field: 'username', value: '手机号（登录名）', width: '150' },
        { field: 'sex', value: '性别', type: 'select', width: '50' },
        { field: 'email', value: '邮箱', width: '150' },
        { field: 'deptName', value: '部门', type: 'select', width: '100' },
        { field: 'post', value: '岗位', width: '150' },
        {
          field: 'parentName',
          value: '直属上级',
          type: 'select',
          width: '150'
        },
        {
          field: 'roleName',
          value: '角色',
          type: 'selectCheckout',
          width: '150'
        }
      ],
      selectionList: [], // 批量勾选数据
      tableData: [],
      tableHeight: document.documentElement.clientHeight - 240, // 表的高度
      /** 分页逻辑 */
      currentMenuData: null,
      // structureValue: '', // 左侧列表选中的值 用于筛选
      currentPage: 1,
      isNeedChild: 1, // 是否展示子级部门 0不需要 1 需要
      pageSize: 15,
      pageSizes: [15, 30, 45, 60],
      total: 0,
      userTotal: 0, // 当前下总数
      /** ** */
      employeeDetailDialog: false,
      dialogData: {},
      // 新建和编辑
      employeeCreateDialog: false,
      dialogTitle: '新建员工',
      formInline: {},
      depCreateLabelValue: '',
      // 编辑部门时id
      treeEditId: '',
      optionsList: {
        sex: [
          { id: 0, name: '请选择' },
          { id: 1, name: '男' },
          { id: 2, name: '女' }
        ]
      },
      groupsList: [],
      // 重置密码
      resetPasswordVisible: false,
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/,
            message: '密码由6-20位字母、数字组成'
          }
        ],
        username: [
          { required: true, message: '手机号不能为空', trigger: 'blur' }
        ]
      },
      passForm: {},
      dialogRules: {
        realname: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/,
            message: '密码由6-20位字母、数字组成'
          }
        ],
        username: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: chinaMobileRegex,
            message: '目前只支持中国大陆的手机号码',
            trigger: 'blur'
          }
        ],
        email: [
          {
            pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            message: '请输入正确的邮箱格式',
            trigger: 'blur'
          }
        ],
        // parentId: [
        //   { required: true, message: '直属上级不能为空', trigger: 'change' }
        // ],
        deptId: [
          { required: true, message: '部门不能为空', trigger: 'change' }
        ],
        roleId: [{ required: true, message: '角色不能为空', trigger: 'change' }]
      },
      // 重置登录账号
      resetUserNameVisible: false,
      resetUserNameForm: {
        username: '',
        password: ''
      },
      isManageReset: false, // 是管理员重置密码
      slideVerifyShow: false,
      slideVerifyPass: false,
      codeTime: 60,
      codeSecond: 60,
      codeTimer: null,
      // 批量导入
      bulkImportShow: false,
      // 人力资源选择
      hrmAddDialogShow: false,
      // 角色操作
      editRoleType: '',
      editRoleDialogShow: false,
      // 重置部门
      editDepDialogShow: false
    }
  },
  computed: {
    ...mapGetters(['manage', 'hrm']),
    // 有人资权限
    hasHrmAuth() {
      return this.hrm
    },
    // 员工创建权限
    userSaveAuth() {
      return this.manage && this.manage.users && this.manage.users.userSave
    },
    // 员工编辑操作权限
    userUpdateAuth() {
      return this.manage && this.manage.users && this.manage.users.userUpdate
    },
    // 员工禁用启用权限
    userEnablesAuth() {
      return this.manage && this.manage.users && this.manage.users.userEnables
    },
    // 员工列表的勾选编辑
    tableUpdateAuth() {
      return this.userEnablesAuth && this.userUpdateAuth
    },
    // 部门新建权限
    strucSaveAuth() {
      return this.manage && this.manage.users && this.manage.users.deptSave
    },
    // 部门编辑权限
    strucUpdateAuth() {
      return this.manage && this.manage.users && this.manage.users.deptUpdate
    },
    // 部门删除权限
    strucDeleteAuth() {
      return this.currentMenuData && this.currentMenuData.pid !== 0 && this.manage && this.manage.users && this.manage.users.deptDelete
    },
    // 员工编辑角色权限
    userUpdateRoleAuth() {
      return this.manage && this.manage.permission
    },
    /**
     * 部门更多操作
     */
    strucMoreOptions() {
      const moreList = []
      if (this.strucUpdateAuth) {
        moreList.push({ type: 'edit', name: '编辑部门', icon: 'edit' })
      }

      if (this.strucDeleteAuth) {
        moreList.push({ type: 'delete', name: '删除部门', icon: 'delete' })
      }

      return moreList
    },

    selectionInfo: function() {
      let temps = []
      if (this.userEnablesAuth) {
        temps = [
          {
            name: '禁用',
            type: 'lock',
            icon: 'wk wk-remove'
          },
          {
            name: '激活',
            type: 'unlock',
            icon: 'wk wk-activation'
          }
        ]
      }

      if (this.userUpdateAuth) {
        if (this.selectionList.length === 1) {
          temps = temps.concat([
            {
              name: '编辑',
              type: 'edit',
              icon: 'wk wk-edit'
            },
            {
              name: '重置密码',
              type: 'reset',
              icon: 'wk wk-circle-password'
            },
            {
              name: '重置登录账号',
              type: 'resetName',
              icon: 'wk wk-reset'
            }
          ])
        } else {
          temps = temps.concat([
            {
              name: '重置密码',
              type: 'reset',
              icon: 'wk wk-circle-password'
            }
          ])
        }
      }

      if (this.userUpdateRoleAuth) {
        if (this.selectionList.length === 1) {
          temps.push({
            name: '复制角色',
            type: 'copyRole',
            icon: 'wk wk-icon-double-note'
          })
        }
        temps.push({
          name: '编辑角色',
          type: 'editRole',
          icon: 'wk wk-edit'
        })
      }

      if (this.userUpdateAuth) {
        temps.push({
          name: '重置部门',
          type: 'editDep',
          icon: 'wk wk-employees'
        })
      }


      return temps
    },
    /** 添加列表 */
    tableList: function() {
      if (this.dialogTitle === '新建员工') {
        return [
          { field: 'username', value: '手机号（登录名）' },
          { field: 'password', value: '登录密码' },
          { field: 'realname', value: '姓名' },
          { field: 'sex', value: '性别', type: 'select' },
          { field: 'email', value: '邮箱' },
          { field: 'deptId', value: '部门', type: 'structure' },
          { field: 'post', value: '岗位' },
          { field: 'parentId', value: '直属上级', type: 'user' },
          { field: 'roleId', value: '角色', type: 'selectCheckout' }
        ]
      } else {
        return [
          {
            field: 'username',
            value: '手机号（登录名）',
            tips: '如需修改登录名，请在列表勾选员工后进行操作'
          },
          { field: 'realname', value: '姓名' },
          { field: 'sex', value: '性别', type: 'select' },
          { field: 'email', value: '邮箱' },
          { field: 'deptId', value: '部门', type: 'structure' },
          { field: 'post', value: '岗位' },
          { field: 'parentId', value: '直属上级', type: 'user' },
          { field: 'roleId', value: '角色', type: 'selectCheckout' }
        ]
      }
    },

    /**
     * 能进行滑动验证
     */
    canSlideVerify() {
      return chinaMobileRegex.test(this.resetUserNameForm.username)
    },

    /**
     * 是查看部门员工
     */
    isDepUserShow() {
      return this.currentMenuData && this.currentMenuData.deptId
    }
  },
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 240
    }

    // 部门树形列表
    this.currentMenuData = this.employeeMenu[0]
    this.getDepTreeList()
    this.getUserList()
    this.getUserCount()
  },
  methods: {
    /**
     * 员工数量
     */
    getUserCount() {
      this.depLoading = true
      adminUserCountNumOfUserAPI().then(res => {
        this.depLoading = false
        const resData = res.data || {}
        this.employeeMenu.forEach(item => {
          item.count = resData[item.field]
        })
        this.userTotal = this.currentMenuData.count
      }).catch(() => {
        this.depLoading = false
      })
    },

    /**
     * 选择部门
     */
    changeDepClick(data) {
      this.currentMenuData = data
      this.userTotal = this.currentMenuData.currentNum
      // this.structureValue = data.id
      this.refreshUserList()
    },

    /**
     * 选择员工
     */
    changeUserClick(data) {
      // this.structureValue = ''
      this.currentMenuData = data
      this.userTotal = this.currentMenuData.count
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
     * 用户列表
     */
    getUserList() {
      this.loading = true
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        realname: this.searchInput
      }

      if (this.isDepUserShow) {
        params.isNeedChild = this.isNeedChild
      }

      if (this.currentMenuData) {
        // 员工有type值
        if (this.currentMenuData.type) {
          if (this.currentMenuData.type == 'active') {
            params.status = 1
          } else {
            params.label = {
              all: 0,
              new: 1,
              inactive: 2,
              disable: 3
            }[this.currentMenuData.type]
          }
        } else if (this.currentMenuData.id) {
          params.deptId = this.currentMenuData.id
        }
      }
      userListAPI(params)
        .then(res => {
          this.tableData = res.data.list
          this.total = res.data.totalRow
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * 头部搜索
     */
    headerSearch(search) {
      this.searchInput = search
      this.refreshUserList()
    },

    /**
     * 批量导入
     */
    bulkImportClick() {
      this.bulkImportShow = true
    },

    // /**
    //  * 展开闭合操作
    //  */
    // handleExpand(type, node, data) {
    //   if (type == 'close') {
    //     if (data.children) {
    //       node.expanded = false
    //     }
    //   } else if (type == 'open') {
    //     node.expanded = true
    //   }
    // },
    handleClose() {
      this.employeeDetailDialog = false
    },
    // 第一列点击事件
    rowClick(row, column, event) {
      this.dialogData = row
      if (column.property == 'realname') {
        this.employeeDetailDialog = true
      }
    },
    // 新建和编辑
    newHandleClose() {
      this.employeeCreateDialog = false
    },
    // 新建用户
    addEmployee() {
      this.getHandleEmployeeRelateData()
      this.dialogTitle = '新建员工'
      this.formInline = {
        roleId: [],
        deptId:
          this.currentMenuData && this.currentMenuData.id
            ? this.currentMenuData.id
            : '',
        parentId: this.currentMenuData && this.currentMenuData.ownerUserId
          ? this.currentMenuData.ownerUserId
          : ''
      }
      this.employeeCreateDialog = true
    },

    /**
     * 编辑员工单选change
     */
    depChange(_, data) {
      const obj = data && data.length > 0 ? data[0] : null
      this.$set(this.formInline, 'parentId', obj ? obj.ownerUserId : '')
    },

    /**
     * 选择或者新建员工
     */
    createEmployeeClick(command) {
      if (command === 'create') {
        this.addEmployee()
      } else if (command === 'selectHrm') {
        // 先获取个下拉数据
        this.getHandleEmployeeRelateData()
        this.hrmAddDialogShow = true
      }
    },

    /**
     * 新建或编辑员工 需要获取的信息
     */
    getHandleEmployeeRelateData() {
      this.getRoleList()
    },

    // 详情 -- 编辑用户
    editBtn() {
      this.dialogTitle = '编辑员工'
      this.getHandleEmployeeRelateData()
      var detail = {}
      for (let index = 0; index < this.tableList.length; index++) {
        const element = this.tableList[index]
        if (element.field !== 'password') {
          if (element.field === 'roleId') {
            detail[element.field] = this.dialogData.roleId
              ? this.dialogData.roleId
                .split(',')
                .map(function(item, index, array) {
                  return parseInt(item)
                })
              : []
          } else if (element.field === 'parentId') {
            detail.parentId = this.dialogData.parentId || ''
          } else if (element.field === 'deptId') {
            detail.deptId = this.dialogData.deptId
          } else {
            detail[element.field] = this.dialogData[element.field]
          }
        }
      }
      detail['userId'] = this.dialogData.userId
      this.formInline = detail
      this.employeeCreateDialog = true
    },

    /**
     * 获取角色列表
     */
    getRoleList() {
      // 角色列表
      adminRoleGetRoleListAPI()
        .then(res => {
          this.groupsList = res.data
        })
        .catch(() => {})
    },

    /**
     * 创建部门
     */
    addStruc() {
      const id =
        this.allDepData && this.allDepData.length ? this.allDepData[0].deptId : ''
      if (id) {
        this.depCreateLabelValue = ''
        this.depCreateLabel = '新增部门'
        this.depCreateTitle = '新增部门'
        this.depSelect = id
        this.getStructuresListBySuperior({ id: id, type: 'save' })
        this.depCreateDialog = true
      }
    },

    /**
     * 部门更多操作
     */
    strucMoreHandleClick(command) {
      if (command == 'edit') {
        this.editStruc(this.currentMenuData)
      } else if (command == 'delete') {
        this.deleteStruc(this.currentMenuData)
      }
    },

    /**
     * 新增部门
     */
    appendStruc(data) {
      this.depCreateLabelValue = ''
      this.depCreateLabel = '新增部门'
      this.depCreateTitle = '新增部门'
      this.depSelect = data.deptId
      this.depOwnerUserId = ''
      this.getStructuresListBySuperior({ id: data.id, type: 'save' })
      this.depCreateDialog = true
    },

    /**
     * 获取新增部门 上级部门信息
     */
    getStructuresListBySuperior(data) {
      this.superDepList = []
      depListAPI(data)
        .then(response => {
          this.superDepList = response.data
        })
        .catch(() => {})
    },

    /**
     * 编辑部门
     */
    editStruc(data) {
      this.depCreateLabelValue = data.label
      this.treeEditId = data.id
      this.depSelect = data.pid
      this.depOwnerUserId = data.ownerUserId
      this.depCreateTitle = '编辑部门'
      this.depCreateLabel = '编辑部门'
      this.getStructuresListBySuperior({ id: data.id, type: 'update' })
      this.depCreateDialog = true
    },

    /**
     * 删除部门
     */
    deleteStruc(data) {
      this.$confirm(`此操作将删除${data.name}部门，是否继续？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true
          depDeleteAPI({ id: data.id })
            .then(res => {
              this.getDepTreeList()
              this.currentMenuData = this.employeeMenu[0]
              this.$message.success('删除成功')
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 关闭新增或编辑
    depCreateClose() {
      this.depCreateDialog = false
    },
    // 新增或编辑确定按钮
    submitDialog() {
      if (this.depCreateLabel == '新增部门') {
        depSaveAPI({
          name: this.depCreateLabelValue,
          pid: this.depSelect,
          ownerUserId: this.depOwnerUserId
        }).then(
          res => {
            this.getDepTreeList()
            this.depCreateClose()
          }
        )
      } else {
        depEditAPI({
          name: this.depCreateLabelValue,
          deptId: this.treeEditId,
          pid: this.depSelect,
          ownerUserId: this.depOwnerUserId
        }).then(res => {
          this.$message.success('操作成功')
          this.getDepTreeList()
          this.depCreateClose()
        })
      }
    },
    // 获取树形列表
    getDepTreeList() {
      this.depLoading = true
      depListAPI({ type: 'tree' })
        .then(response => {
          this.allDepData = response.data
          this.showDepData = response.data || []
          this.depLoading = false
        })
        .catch(() => {
          this.depLoading = false
        })
    },

    // 用户新建
    newDialogSubmit() {
      this.$refs.dialogRef.validate(valid => {
        if (valid) {
          if (this.dialogTitle == '新建员工') {
            this.loading = true
            const formInline = objDeepCopy(this.formInline)
            formInline.roleId = formInline.roleId.join(',')
            userAddAPI(formInline)
              .then(res => {
                this.$message.success('新增成功')
                this.employeeCreateDialog = false
                this.refreshUserList()
                this.getUserCount()
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          } else {
            this.loading = true
            const formInline = objDeepCopy(this.formInline)
            formInline.roleId = formInline.roleId.join(',')
            userEditAPI(formInline)
              .then(res => {
                if (this.employeeDetailDialog) {
                  this.employeeDetailDialog = false
                }
                this.employeeCreateDialog = false
                this.$message.success('编辑成功')
                this.getUserList()
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
          }
        } else {
          // 提示第一个error
          if (this.$refs.dialogRef.fields) {
            for (
              let index = 0;
              index < this.$refs.dialogRef.fields.length;
              index++
            ) {
              const ruleField = this.$refs.dialogRef.fields[index]
              if (ruleField.validateState == 'error') {
                this.$message.error(ruleField.validateMessage)
                break
              }
            }
          }
          return false
        }
      })
    },
    // 详情里面点击事件
    handleCommand(command) {
      switch (command) {
        case 'reset':
          // 当前登录用户ID
          this.passForm = {
            password: ''
          }
          this.resetPasswordVisible = true
          break
        case 'status':
          usersEditStatusAPI({
            ids: [this.dialogData.userId],
            status: this.dialogData.status === 0 ? 1 : 0
          }).then(res => {
            this.employeeDetailDialog = false
            this.$message.success('修改成功')
            this.getUserList()
          })
          break
      }
    },
    /** 操作 */
    selectionBarClick(type) {
      var ids = this.selectionList
        .map(function(item, index, array) {
          return item.userId
        })
        .join(',')
      if (type === 'lock' || type === 'unlock') {
        var message = type === 'lock' ? '禁用' : '激活'
        this.$confirm('这些员工账号将被' + message + ', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.loading = true
            usersEditStatusAPI({
              ids: ids.split(','),
              status: type === 'unlock' ? 1 : 0
            })
              .then(res => {
                this.loading = false
                this.$message.success('修改成功')
                this.getUserCount()
                this.getUserList()
              })
              .catch(() => {
                this.loading = false
              })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else if (type === 'reset') {
        this.resetPasswordVisible = true
      } else if (type === 'resetName') {
        // 重置验证码弹窗变量
        this.isManageReset = false
        this.slideVerifyPass = false
        this.slideVerifyShow = false
        this.resetUserNameForm = {
          username: '',
          password: ''
        }
        this.resetUserNameVisible = true
      } else if (type === 'edit') {
        this.dialogData = this.selectionList[0]

        this.dialogTitle = '编辑员工'
        this.getHandleEmployeeRelateData()
        var detail = {}
        for (let index = 0; index < this.tableList.length; index++) {
          const element = this.tableList[index]
          if (element.field !== 'password') {
            if (element.field === 'roleId') {
              detail[element.field] = this.dialogData.roleId
                ? this.dialogData.roleId
                  .split(',')
                  .map(function(item, index, array) {
                    return parseInt(item)
                  })
                : []
            } else if (element.field === 'parentId') {
              detail.parentId = this.dialogData.parentId
            } else if (element.field === 'deptId') {
              detail.deptId = this.dialogData.deptId
            } else {
              detail[element.field] = this.dialogData[element.field]
            }
          }
        }
        detail['userId'] = this.dialogData.userId
        this.formInline = detail
        this.employeeCreateDialog = true
      } else if (type === 'editRole' || type === 'copyRole') {
        this.editRoleType = type
        this.editRoleDialogShow = true
      } else if (type === 'editDep') {
        this.editDepDialogShow = true
      }
    },
    // 重置密码 -- 关闭按钮
    resetPasswordClose() {
      this.resetPasswordVisible = false
    },
    // 重置密码 -- 确定按钮
    passSubmit(val) {
      this.$refs.passForm.validate(valid => {
        if (valid) {
          var ids = []
          if (this.selectionList.length > 0) {
            ids = this.selectionList
              .map(function(item, index, array) {
                return item.userId
              })
          } else {
            ids.push(this.dialogData.userId)
          }
          val.ids = ids
          this.loading = true
          adminUsersUpdatePwdAPI(val)
            .then(res => {
              this.$message.success('重置成功')
              this.resetPasswordClose()
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
    },
    /**
     * 重置登录账号
     */
    passUserNameSubmit(val) {
      this.$refs.resetUserNameForm.validate(valid => {
        if (valid) {
          if (this.selectionList.length > 0) {
            val.id = this.selectionList[0].userId
            if (this.isManageReset) {
              if (!this.resetUserNameForm.smscode) {
                this.$message.error('请输入验证码')
                return
              }
              this.loading = true
              adminUsersManagerUsernameEditAPI(val)
                .then(res => {
                  this.$message.success('重置成功')
                  this.resetUserNameVisible = false
                  this.loading = false
                  this.refreshUserList()
                })
                .catch(() => {
                  this.loading = false
                })
            } else {
              this.loading = true
              adminUsersUsernameEditAPI(val)
                .then(res => {
                  if (res.status === 3) {
                    this.$message.error('当前为系统注册账号（手机号），重置需要获取新手机号验证码')
                    this.isManageReset = true
                  } else {
                    this.$message.success('重置成功')
                    this.resetUserNameVisible = false
                    this.refreshUserList()
                  }
                  this.loading = false
                })
                .catch(() => {
                  this.loading = false
                })
            }
          }
        } else {
          return false
        }
      })
    },

    sliderSuccess() {
      setTimeout(() => {
        this.slideVerifyPass = true
        this.slideVerifyShow = false
      }, 500)
    },

    sliderFail() {},
    sliderRefresh() {},

    getSmsCode() {
      if (!this.canSlideVerify) {
        this.$message.error('请输入正确的手机号')
        return
      }

      if (!this.slideVerifyPass) {
        this.$message.error('请先进行滑动验证')
        return
      }

      sendSmsAPI({
        telephone: this.resetUserNameForm.username,
        type: 1 // 注册
      })
        .then(() => {
          this.startTimer()
        })
        .catch()
    },

    /**
     * 发送短信倒计时
     */
    startTimer() {
      if (this.codeSecond === this.codeTime) {
        this.codeSecond--
      }
      this.codeTimer = setTimeout(() => {
        this.codeSecond--
        if (this.codeSecond >= 0) {
          this.startTimer()
        } else {
          clearTimeout(this.codeTimer)
          this.codeTimer = null
          this.codeSecond = this.codeTime
        }
      }, 1000)
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
    // 勾选
    handleSelectionChange(val) {
      this.selectionList = val // 勾选的行
    },

    // 获取状态颜色 0 禁用 1 启用 2未激活
    getStatusColor(status) {
      if (status == 0) {
        return '#FF6767'
      } else if (status == 1) {
        return '#46CDCF'
      } else if (status == 2) {
        return '#CCCCCC'
      }
    },
    // 列表信息格式化
    tableFormatter(row, column) {
      if (column.property == 'sex') {
        return { 1: '男', 2: '女' }[row.sex]
      }
      return row[column.property]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/login/index.scss';
.verify-picture {
  margin-top: 20px;
}

.sms-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  .el-input {
    width: 210px;
  }
  .el-button {
    flex: 1;
    font-size: 12px;
    color: white;
    background-color: #3e6bea;
    border-radius: $xr-border-radius-base;
    border: 0 none;
    padding: 0;
    margin-left: 20px;

    .btn-content {
      width: 100%;
      height: 42px;
      @include center;
      .icon {
        font-size: 16px;
        margin-right: 5px;
      }
    }
    &:hover,
    &.is-disabled,
    &.is-disabled:hover {
      color: white;
      border-color: #517aec;
      background-color: #517aec;
    }
  }
}

.employee-dep-management {
  padding: 0 15px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.system-content {
  position: relative;
  height: 100%;
  flex: 1;
  display: flex;
  overflow: hidden;
}
.system-nav {
  width: 280px;
  height: 100%;
  overflow: auto;
  margin-right: 10px;
  background: #fff;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;

  &__title {
    padding: 15px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid $xr-border-line-color;
  }

  &__content {
    overflow: auto;
    height: calc(100% - 50px);
    overflow-y: overlay;
    overflow-x: overlay;
  }
}
// 菜单
.section {
  position: relative;
  &__title {
    position: relative;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    padding: 15px;
    .add-btn {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }
}

.menu-item {
  position: relative;
  cursor: pointer;
  padding: 12px 15px;
  color: #333;

  &__icon {
    font-size: 14px;
    margin-right: 8px;
    color: #8a94a6;
  }

  &__content {
    font-size: 14px;
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

.system-view-table {
  background: #fff;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
  position: absolute;
  top: 0;
  left: 295px;
  bottom: 0;
  right: 0;
}

.table-top {
  padding: 0 30px;
  height: 50px;

  &__title {
    font-size: 16px;
    color: #333;
  }

  .el-dropdown {
    margin-left: 7px;
  }
}

.all-user-reminder {
  width: auto;
  margin-left: 5px;
  display: inline-block;
}

.el-table /deep/ .el-table-column--selection .cell {
  padding-left: 14px;
}

// .status {
//   display: inline-block;
//   margin-left: 50px;
// }
// .status > span {
//   margin-right: 10px;
// }

.status-name {
  .status-mark {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 3px;
  }
  color: $xr-color-primary;
  cursor: pointer;
  .main-mark {
    background-color: #ff6a00;
    color: white;
    border-radius: 2px;
    font-size: 12px;
    padding: 0px 4px;
    margin: 0 3px;
  }
}
/* 详情 */
.employee-dep-management /deep/ .el-dialog__wrapper {
  margin-top: 60px !important;
}

.el-form {
  padding: 0;
}

/* 新建和编辑 */
.new-dialog-form {
  height: 47vh;
  overflow-y: auto;
  padding: 20px;
}
.new-dialog-form /deep/ .el-form-item {
  width: 50%;
  margin: 0;
  padding-bottom: 10px;
}
.new-dialog-form /deep/ .el-form-item .el-form-item__label {
  padding: 0;
}
.new-dialog-form {
  /deep/ .el-form-item:nth-child(even) {
    padding-left: 15px;
  }

  /deep/ .el-form-item:nth-child(odd) {
    padding-right: 15px;
  }
}
.new-dialog-form {
  .el-select {
    display: block;
  }
  .wk-dep-select,
  .wk-user-select {
    width: 100%;
  }
}
.new-dialog-form
  /deep/
  .el-form-item
  .el-form-item__content
  .el-select-group__wrap:not(:last-of-type)::after {
  display: none;
}
.new-dialog-form /deep/ .el-form-item .el-form-item__content .el-select-group {
  padding-left: 10px;
}
.new-dialog-form
  /deep/
  .el-form-item
  .el-form-item__content
  .el-select-group__title {
  border-bottom: 1px solid #e4e7ed;
  padding: 0 0 7px;
  margin: 0 20px 5px;
}

.nav-dialog-div {
  margin-bottom: 20px;
  label {
    width: 90px;
    display: block;
  }
}
.nav-dialog-div {
  .el-input,
  .el-select,
  .wk-user-select {
    flex: 1;
  }
}
/** 树形结构 */
.el-tree /deep/ .el-tree-node__expand-icon {
  display: none;
}
.el-tree /deep/ .el-tree-node__content {
  height: 40px;

  .node-data {
    // .node-img {
    //   width: 15px;
    //   height: 15px;
    //   display: block;
    //   margin-right: 8px;
    //   margin-left: 24px;
    // }
    height: 40px;
    padding: 0 15px;
    position: relative;
    border-radius: $xr-border-radius-base;

    .wk {
      font-size: 14px;
      color: #8a94a6;
      flex-shrink: 0;
    }

    .wk-department {
      margin-right: 8px;
    }

    &__mark {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #e6e6e6;
      margin-right: 8px;
      flex-shrink: 0;
    }

    &__label {
      flex: 1;
      color: #333;
      font-size: 14px;
      margin-right: 8px;
    }

    .wk-up-unfold {
      margin-left: 8px;
      transition: transform 0.3s;
    }

    .wk-up-unfold.is-close {
      transform: rotateZ(180deg);
    }
    // .node-label-set {
    //   display: none;
    // }
  }

  .node-data.is-current,
  .node-data:hover {
    background-color: $xr--background-color-base;
  }

  // .node-data:hover .node-label-set {
  //   display: block;
  // }
}
// .el-tree /deep/ .el-tree-node.is-current > .el-tree-node__content {
//   background-color: #ebf3ff;
//   border-right: 2px solid #46cdcf;
//   .node-label-set {
//     display: block;
//   }
// }
.system-nav /deep/ .el-tree-node > .el-tree-node__children {
  overflow: visible;
}
.system-nav /deep/ .el-tree > .el-tree-node {
  min-width: 100%;
  display: inline-block !important;
}

.system-nav
  /deep/
  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
  background-color: white;
}

.system-nav /deep/ .el-tree-node__content:hover {
  background-color: white;
}

/* 搜索框图标按钮 */
.icon-search .el-icon-search {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;
  line-height: 40px;
  text-align: center;
  cursor: pointer;
  font-size: 20px;
  color: #ccc;
}
/* 设置flex布局 */
.flex-index {
  display: flex;
  flex-direction: column;
}
/* 设置占位 */
.flex-box {
  flex: 1;
  // border-bottom: 1px solid $xr-border-line-color;
}
/* 搜索框 */
.icon-search {
  width: 280px;
  position: relative;
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

/** 勾选操作 */
.selection-bar {
  font-size: 12px;
  height: 50px;
  padding: 0 20px;
  color: #777;

  .selected—title {
    flex-shrink: 0;
    padding-right: 20px;
    color: #333;
    .selected—count {
      color: $xr-color-primary;
    }
  }
}

.selection-items-box {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 15px;
  .el-button {
    color: #666;
    background-color: $xr--background-color-base;
    border-color: $xr--background-color-base;
    font-size: 12px;
    height: 28px;
    border-radius: 14px;
    /deep/ i {
      font-size: 12px;
      margin-right: 5px;
    }
  }

  .el-button--primary:hover {
    background: $xr-color-primary;
    border-color: $xr-color-primary;
    color: #ffffff;
  }

  .el-button + .el-button {
    margin-left: 15px;
  }
}

.status-des {
  font-size: 12px;
  color: #777777;
  margin: 0 5px;
  position: absolute;
  left: 0;
  top: 7px;
  .status-des-item {
    margin: 8px;
    display: inline-block;
    div {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 3px;
      margin-right: 5px;
    }
  }
}

// 提示
// 提示标志
.wukong-help_tips {
  color: #999;
  font-size: 14px;
  margin-left: 3px;
  cursor: pointer;
}

.wukong-help_tips:hover {
  color: $xr-color-primary;
}

// 修改密码和修改登录名的样式
.el-password {
  .el-form-item {
    margin-bottom: 5px;
  }
}

.el-dialog__wrapper /deep/.el-dialog__body {
  padding: 20px;
}

.tips {
  font-size: 13px;
  color: #999;
}
@import '../styles/table.scss';
</style>

