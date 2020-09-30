<template>
  <slide-view
    v-loading="loading"
    :listener-ids="['workbench-main-container']"
    :no-listener-class="noListenerClass"
    class="d-view"
    @afterEnter="viewAfterEnter"
    @close="hideView">
    <flexbox
      v-if="detail"
      orient="vertical"
      class="detail-main">
      <flexbox class="detail-header">
        <div
          :style="{ backgroundColor: detailIcon.color }"
          class="header-icon">
          <i :class="['wk', 'wk-' + detailIcon.icon]" />
        </div>
        <div class="header-name">{{ categoryName }}</div>
      </flexbox>
      <div class="detail-body">
        <!-- 基本信息 -->
        <flexbox
          :gutter="0"
          align="stretch"
          wrap="wrap">
          <flexbox-item
            v-for="(item, index) in list"
            v-if="item.formType !== 'examine_cause' && item.formType !== 'business_cause'"
            :span="0.5"
            :key="index"
            class="b-cell">
            <!-- <flexbox v-if="item.formType === 'user'"
                     align="stretch"
                     class="b-cell-b">
              <div class="b-cell-name">{{item.name}}</div>
              <div class="b-cell-value">
                <flexbox :gutter="0"
                         wrap="wrap"
                         style="padding: 0px 10px 10px 0px;">
                  <div v-for="(item, index) in item.value"
                       :key="index">
                    {{item.realname}}&nbsp;&nbsp;
                  </div>
                </flexbox>
              </div>
            </flexbox>

            <flexbox v-else-if="item.formType === 'structure'"
                     align="stretch"
                     class="b-cell-b">
              <div class="b-cell-name">{{item.name}}</div>
              <div class="b-cell-value">
                <flexbox :gutter="0"
                         wrap="wrap"
                         style="padding: 0px 10px 10px 0px;">
                  <div v-for="(item, index) in item.value"
                       :key="index">
                    {{item.name}}&nbsp;&nbsp;
                  </div>
                </flexbox>
              </div>
            </flexbox> -->

            <div
              v-if="item.formType === 'checkbox'"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">
                <flexbox
                  :gutter="0"
                  wrap="wrap"
                  style="padding: 0px 10px 10px 0px;">
                  <div
                    v-for="(item, index) in item.value"
                    :key="index">
                    {{ item }}&nbsp;&nbsp;
                  </div>
                </flexbox>
              </div>
            </div>

            <div
              v-else-if="item.formType === 'file'"
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">
                <flexbox
                  v-for="(file, index) in item.value"
                  :key="index"
                  class="f-item">
                  <i class="wukong wukong-file f-img" />
                  <div class="f-name">{{ file | fileName }}</div>
                  <el-button
                    type="text"
                    @click.native="handleFile('preview', item.value, index)">预览</el-button>
                  <el-button
                    type="text"
                    @click.native="handleFile('download', file, index)">下载</el-button>
                </flexbox>
              </div>
            </div>

            <div
              v-else
              class="b-cell-b">
              <div class="b-cell-name">{{ item.name }}</div>
              <div class="b-cell-value">{{ item.value }}</div>
            </div>
          </flexbox-item>
        </flexbox>
        <!-- 图片 附件 -->
        <div
          v-if="imgList.length > 0"
          class="img-box">
          <div
            v-for="(imgItem, k) in imgList"
            :key="k"
            class="img-list"
            @click="imgZoom(imgList, k)">
            <img
              v-src="imgItem.url"
              :key="imgItem.url">
          </div>
        </div>

        <!-- 附件 -->
        <div v-if="fileList.length" class="section">
          <div class="section__hd">
            <i class="wukong wukong-file" />
            <span>附件</span>
            <span>({{ fileList.length }})</span>
          </div>
          <div class="section__bd">
            <file-cell
              v-for="(file, fileIndex) in fileList"
              :key="fileIndex"
              :data="file"
              :list="fileList"
              :cell-index="fileIndex" />
          </div>
        </div>

        <!-- 行程 报销 -->
        <div
          v-if="type && type == 3 && travelList && travelList.length > 0"
          class="table-sections">
          <div class="table-sections__title">行程</div>
          <el-table
            :data="travelList"
            style="font-size: 13px;"
            align="center"
            header-align="center"
            stripe>
            <el-table-column
              v-for="(item, index) in travelField"
              :key="index"
              :prop="item.prop"
              :label="item.label"
              show-overflow-tooltip />
          </el-table>
        </div>

        <div
          v-if="type && type == 5 && travelList && travelList.length > 0"
          class="table-sections">
          <div class="table-sections__title">报销</div>
          <el-table
            :data="travelList"
            style="font-size: 13px;"
            align="center"
            header-align="center"
            stripe>
            <el-table-column
              v-for="(item, index) in expensesField"
              :key="index"
              :prop="item.prop"
              :label="item.label"
              show-overflow-tooltip />
            <el-table-column
              label="发票"
              width="50">
              <template slot-scope="scope">
                <flexbox justify="center">
                  <el-button
                    type="text"
                    @click.native="handleFile('preview', scope.row.img, 0)">{{ scope.row.img ? scope.row.img.length : 0 }}张</el-button>
                </flexbox>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 相关信息 -->
        <div
          v-if="Object.keys(relatedListData).length > 0"
          class="section">
          <div class="section__hd">
            <i class="wukong wukong-relevance" />
            <span>相关信息</span>
          </div>
          <div class="section__bd">
            <div
              v-for="(items, key) in relatedListData"
              :key="key">
              <related-business-cell
                v-for="(item, itemIndex) in items"
                :data="item"
                :cell-index="itemIndex"
                :type="key"
                :key="itemIndex"
                :show-foot="false"
                @click.native="checkRelatedDetail(key, item)" />
            </div>
          </div>
        </div>

        <!-- 审核信息 -->
        <div class="examine-section">
          <examine-info
            :id="id"
            :record-id="detail.examineRecordId"
            class="create-sections-content"
            examine-type="oa_examine"
            @on-handle="examineHandle" />
        </div>
      </div>
    </flexbox>
    <c-r-m-full-screen-detail
      :visible.sync="showRelatedDetail"
      :crm-type="relatedCRMType"
      :id="relatedID" />
  </slide-view>
</template>

<script>
import { oaExamineReadAPI, oaExamineGetFieldAPI } from '@/api/oa/examine'
import SlideView from '@/components/SlideView'
import ExamineInfo from '@/components/Examine/ExamineInfo'
import RelatedBusinessCell from '@/views/oa/components/RelatedBusinessCell'
import FileCell from '@/views/oa/components/FileCell'
import { downloadFile, fileSize } from '@/utils'
import ExamineMixin from '@/views/taskExamine/examine/components/ExamineMixin'

export default {
  /** 审批详情 */
  name: 'ExamineDetail',
  components: {
    SlideView,
    ExamineInfo,
    RelatedBusinessCell,
    CRMFullScreenDetail: () =>
      import('@/components/CRMFullScreenDetail'),
    FileCell
  },
  filters: {
    fileName(file) {
      const name = file.name && file.name.length > 10 ? (file.name.substring(0, 10) + '...') : file.name
      return name + '(' + fileSize(file.size) + ')'
    }
  },
  mixins: [ExamineMixin],
  props: {
    // 详情信息id
    id: [String, Number],
    // 列表索引
    detailIndex: [String, Number],
    detailSection: [String, Number],
    noListenerClass: {
      type: Array,
      default: () => {
        return ['list-box']
      }
    }
  },
  data() {
    return {
      loading: false,
      categoryId: '',
      type: '',
      detail: null,
      list: [], // 基本信息
      categoryName: '',

      fileList: [],
      imgList: [],

      travelList: [],
      travelField: [
        { prop: 'vehicle', label: '交通工具' },
        { prop: 'trip', label: '单程往返' },
        { prop: 'startAddress', label: '出发城市' },
        { prop: 'endAddress', label: '目的城市' },
        { prop: 'startTime', label: '开始时间' },
        { prop: 'endTime', label: '结束时间' },
        { prop: 'duration', label: '时长（天）' },
        { prop: 'description', label: '备注' }
      ],
      expensesField: [
        { prop: 'startAddress', label: '出发城市' },
        { prop: 'endAddress', label: '目的城市' },
        { prop: 'startTime', label: '开始时间' },
        { prop: 'endTime', label: '结束时间' },
        { prop: 'traffic', label: '交通费（元）' },
        { prop: 'stay', label: '住宿费（元）' },
        { prop: 'diet', label: '餐饮费（元）' },
        { prop: 'other', label: '其他费用（元）' },
        { prop: 'description', label: '费用明细描述' }
      ],

      // 相关详情的查看
      relatedID: '',
      relatedCRMType: '',
      showRelatedDetail: false
    }
  },
  computed: {
    /**
     * 相关信息
     */
    relatedListData() {
      const tempsData = {}
      const keys = ['contacts', 'customer', 'business', 'contract']
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        const list = this.detail[`${key}List`] || []
        if (list.length > 0) {
          tempsData[key] = list.map(item => {
            if (item.id) {
              item[`${key}Id`] = item.id
            }
            return item
          })
        }
      }
      return tempsData
    },

    /**
     * 详情logo
     */
    detailIcon() {
      return this.getCategoryIcon(this.detail.icon)
    }
  },
  watch: {
    id: function(val) {
      this.detail = null
      this.getDetail()
    }
  },
  mounted() {},
  methods: {
    /**
     * 动画完成方法
     */
    viewAfterEnter() {
      this.getDetail()
    },

    // 获取基础信息
    getBaseInfo() {
      this.loading = true
      oaExamineGetFieldAPI({
        examineId: this.id,
        isDetail: 1 // 1详情 2 编辑
      })
        .then(res => {
          this.list = res.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    getDetail() {
      this.loading = true
      oaExamineReadAPI(this.id)
        .then(res => {
          this.loading = false
          this.categoryId = res.data.categoryId
          this.type = res.data.type
          this.getBaseInfo()
          this.detail = res.data
          this.categoryName = this.detail.categoryTitle

          this.fileList = this.detail.file
          this.imgList = this.detail.img

          this.travelList = this.detail.examineTravelList
        })
        .catch(() => {
          this.loading = false
          this.hideView()
        })
    },
    //* * 点击关闭按钮隐藏视图 */
    hideView() {
      this.$emit('hide-view')
    },
    // 查看相关信息详情
    checkRelatedDetail(crmType, item) {
      this.relatedID = item[crmType + 'Id'] || item.id
      this.relatedCRMType = crmType
      this.showRelatedDetail = true
    },
    /**
     * 附件查看
     */
    handleFile(type, files, index) {
      if (type === 'preview') {
        if (files && files.length > 0) {
          this.$bus.emit('preview-image-bus', {
            index: index,
            data: files
          })
        }
      } else if (type === 'download') {
        downloadFile({ path: files.url, name: files.name })
      }
    },
    // 放大图片
    imgZoom(images, k) {
      this.$bus.emit('preview-image-bus', {
        index: k,
        data: images
      })
    },
    downloadFile(file) {
      downloadFile({ path: file.url, name: file.name })
    },
    // 审批操作
    examineHandle(data) {
      // this.$store.dispatch('GetOAMessageNum', 'examine')
      this.$emit('on-examine-handle', data, this.detailIndex)
      this.$emit('handle', data, this.detailIndex)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/content.scss';
.detail-main {
  height: 100%;
  overflow-y: auto;
  overflow-y: overlay;
}

.d-view {
  background-color: white;
  padding: 15px;
  /deep/ .el-card__body {
    height: 100%;
  }
}

.detail-header {
  .header-icon {
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    border-radius: $xr-border-radius-base;
    margin-right: 20px;
    .wk {
      color: white;
      font-size: 26px;
    }
  }
  .header-name {
    font-size: 16px;
    color: #333333;
    flex: 1;
    font-weight: 600;
  }
}



.related-business {
  margin: 15px 0;
  .label {
    font-size: 13px;
    margin-bottom: 7px;
  }
  p {
    cursor: pointer;
    color: #2362fb;
    background: #f5f7fa;
    line-height: 30px;
    margin-bottom: 5px;
    font-size: 13px;
    padding-left: 7px;
    border-radius: 2px;
    img {
      width: 16px;
      @include v-align;
    }
  }
}

.b-cell {
  .b-cell-b {
    width: auto;
    padding: 8px;
    line-height: 22px;
    .b-cell-name {
      width: 100px;
      margin-right: 10px;
      font-size: 12px;
      flex-shrink: 0;
      color: #666;
    }
    .b-cell-value {
      font-size: 14px;
      color: #333;
    }
    .b-cell-foot {
      flex-shrink: 0;
      display: block;
      width: 15px;
      height: 15px;
      margin-left: 8px;
    }
  }
}

.f-item {
  padding: 3px 0;
  height: 25px;
  .f-img {
    position: block;
    font-size: 12px;
    margin-right: 8px;
    color: $xr-color-primary;
  }
  .f-name {
    color: #666;
    font-size: 12px;
    margin-right: 10px;
  }
}

// 图片 附件
.img-box {
  margin: 10px 0;
  .img-list {
    display: inline-block;
    position: relative;
    margin-right: 10px;
    width: 80px;
    height: 60px;
    line-height: 60px;
    cursor: pointer;
    img {
      width: 80px;
      height: 60px;
    }
    .img-hover {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      font-size: 12px;
      color: #fff;
      display: none;
      span {
        @include cursor;
        display: inline-block;
      }
    }
  }
  .img-list:hover {
    .img-hover {
      display: inline-block;
    }
  }
}

// 详情其他模块
.section {
  padding: 10px 0;

  &__hd {
    span {
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }
    .wk {
      color: #363636;
      font-size: 15px;
      margin-right: 5px;
    }
  }

  &__bd {
    margin-top: 15px;
    padding-left: 25px;
  }
}

.secitons {
  position: relative;
  margin-top: 15px;
}

.detail-body {
  flex: 1;
  padding-top: 30px;
  overflow-y: auto;
  width: 100%;
}

// 行程 报销效果
.table-sections {
  margin-top: 8px;
  padding: 10px 0;
  &__title {
    font-size: 16px;
    font-weight: 600;
    padding-left: 15px;
    position: relative;
    margin-bottom: 15px;
  }

  &__title::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    height: 100%;
    border-radius: 2px;
    background-color: $xr-color-primary;
  }
}

// 审核信息
.examine-section {
  padding: 10px 20px;
  border: 1px solid $xr-border-line-color;
  border-radius: $xr-border-radius-base;
}

.d-view {
  position: fixed;
  width: 926px;
  top: 60px;
  bottom: 0px;
  right: 0px;
}
</style>

