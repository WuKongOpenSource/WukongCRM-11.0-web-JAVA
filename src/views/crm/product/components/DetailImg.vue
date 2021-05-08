<template>
  <div v-loading="loading" class="b-cont">
    <div class="detail-box">
      <div class="detail-item">
        <label class="detail-label"> 产品图片</label>

        <div class="detail">
          <flexbox class="detail-images">
            <div v-for="(item, index) in primaryList" :key="index" class="show-img">
              <img
                v-src="item.url"
                :key="item.url"
                style="object-fit: contain; vertical-align: top;">
              <div
                class="img-model">
                <i
                  class="el-icon-zoom-in set-img-zoom"
                  @click.stop="previewImage(primaryList, index)"/>
                <i
                  class="el-icon-delete set-img-delete"
                  @click.stop="deleteImg('main', index)"/>
              </div>
            </div>
            <div v-if="primaryList.length < 9" class="content-cross" @click="upLoadImg('main')">
              <input
                ref="primaryImgInput"
                accept="image/*"
                type="file"
                multiple
                class="file-input"
                @change="upLoad">
              <el-button
                type="text"
                icon="el-icon-plus"
                class="cross"/>
            </div>
          </flexbox>

          <div class="detail-tip">图片建议上传：290（宽） * 220(高) （最多只能上传<span>{{ 9 - primaryList.length }}</span>张图片）</div>
        </div>
      </div>
    </div>
    <div class="detail-box">
      <div class="detail-item">
        <label class="detail-label"> 产品详情图片</label>
        <div class="detail">
          <flexbox class="detail-images">
            <div v-for="(item, index) in detailList" :key="index" class="show-img">
              <img
                v-src="item.url"
                :key="item.url"
                style="object-fit: contain; vertical-align: top;"
                class="cross-two">
              <div
                class="img-model">
                <i
                  class="el-icon-zoom-in set-img-zoom"
                  @click.stop="previewImage(detailList, index)"/>
                <i
                  class="el-icon-delete set-img-delete"
                  @click.stop="deleteImg('detail', index)"/>
              </div>
            </div>
            <div v-if="detailList.length < 9" class="content-cross cross-two" @click="upLoadImg('detail')">
              <input
                ref="detailImgInput"
                accept="image/*"
                type="file"
                multiple
                class="file-input"
                @change="upLoad">
              <el-button
                type="text"
                icon="el-icon-plus"
                class="cross"/>
            </div>
          </flexbox>
          <div class="detail-tip">图片建议上传：750(宽) * 600(高)（最多只能上传<span>{{ 9 - primaryList.length }}</span>张图片）</div>
        </div>
      </div>
    </div>
  </div>

</template>

<script type="text/javascript">
import { crmFileSaveAPI, crmFileDeleteAPI } from '@/api/common'
import { filePathToBlob } from '@/utils'

export default {
  name: 'DetailImg',
  components: {},
  props: {
    detail: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      primaryList: [],
      detailList: [],
      type: 'main',
      loading: false
    }
  },
  watch: {
    detail: {
      handler(data) {
        if (data) {
          this.primaryList = data.mainFile || []
          this.detailList = data.detailFile || []
        }
      },
      immediate: true
    }
  },
  mounted() {
  },
  methods: {
    upLoadImg(type) {
      this.type = type
      if (type === 'main') {
        this.$refs.primaryImgInput.click()
      } else {
        this.$refs.detailImgInput.click()
      }
    },

    /**
     * 处理选择的图片
     */
    selectImg(url) {
      filePathToBlob(url).then(blob => {
        var type = url.split('.').slice(-1) || 'png'
        var name = url.split('/').slice(-1)
        const file = new File([blob], name, { type: `image/${type}` })
        var even = {
          target: {
            files: [file]
          }
        }
        this.upLoad(even)
      })
    },

    /**
     * 上传
     */
    upLoad(event) {
      var files = Array.from(event.target.files)
      if (this.type === 'main' && files.length + this.primaryList.length > 9) {
        files = files.slice(0, 9 - this.primaryList.length)
        this.$message.error('最多只能上传9张图片')
      } else if (files.length + this.detailList.length > 9) {
        files = files.slice(0, 9 - this.detailList.length)
        this.$message.error('最多只能上传9张图片')
      }

      for (let index = 0; index < files.length; index++) {
        const file = files[index]
        this.loading = true
        crmFileSaveAPI({ file: file }).then(res => {
          const data = res.data || {}
          if (this.type === 'main') {
            this.primaryList.push(data)
            this.loading = false
            this.$emit('change', 'mainFile', this.primaryList)
          } else {
            this.detailList.push(data)
            this.loading = false
            this.$emit('change', 'detailFile', this.detailList)
          }
        }).catch(() => {
          this.loading = false
        })
      }
    },

    /**
     * 删除图片
     */
    deleteImg(type, index) {
      const params = {}
      if (type == 'main') {
        params.id = this.primaryList[index].fileId
      } else {
        params.id = this.detailList[index].fileId
      }
      this.$confirm('此操作将永久删除该图片, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        crmFileDeleteAPI(params).then(res => {
          this.$message.success('删除成功')
          if (type == 'main') {
            this.primaryList.splice(index, 1)
            this.$emit('change', 'mainFile', this.primaryList)
            this.$emit('delete', 'mainFile', this.primaryList)
          } else {
            this.detailList.splice(index, 1)
            this.$emit('change', 'detailFile', this.detailList)
            this.$emit('delete', 'detailFile', this.detailList)
          }
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }).catch(() => {})
    },

    /**
     * 预览图片
     */
    previewImage(list, index) {
      this.$wkPreviewFile.preview({
        index: index,
        data: list
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.b-cont {
    position: relative;
}

.detail-box {
    .file-input {
        display: none;
    }
    .detail-item {
        margin-top: 8px;
    }
    .detail-label {
        font-weight: 500;
        margin-left: 20px;
        margin-top: 20px;
        word-break: keep-all;
        white-space: nowrap;
        font-size: 13px;
    }
    .detail-tip {
        color: #C1C1C1;
        font-size: 12px;
        margin-bottom: 20px;
    }

    // 详情
    .detail {
      padding: 0 20px;
    }

    // 图片详情
    .detail-images {
      overflow-x: auto;
      margin: 10px 0;
    }

    .show-img {
      position: relative;
      margin-right: 20px;
      flex-shrink: 0;
      cursor: pointer;

      img {
        width: 100px;
        height: 76px;
        border-radius: $xr-border-radius-base;
      }
      .img-model {
        visibility: hidden;
        position: absolute;
        z-index: 10;
        line-height: 88px;
        background-color: #2d3037;
        opacity: 0.8;
        border-radius: 6px;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;

        .set-img-delete {
            font-size: 20px;
            color: white;
            cursor: pointer;
        }
        .set-img-zoom {
            font-size: 20px;
            color: white;
            padding-left: calc(50% - 30px);
            cursor: pointer;
        }
      }
    }

    .show-img:hover {
      .img-model {
        visibility: visible;
      }
    }


    .content-cross {
        flex-shrink: 0;
        width: 100px;
        height: 76px;
        display: flex;
        cursor: pointer;
        border-radius: 6px;
        position: relative;
        text-align: center;
        border: 1px #c0ccda dashed;
        margin-bottom: 5px;

        .cross {
            color: #606266;
            font-size: 20px;
            margin-left: calc(50% - 10px);
        }
    }

    .cross-two {
        height: 80px !important;
    }
    /deep/.el-icon-zoom-in {
        margin-right: 10px;
    }
}
</style>
