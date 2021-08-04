<template>
  <div>
    <div class="handel-header">
      <crm-relative
        v-if="viewLoaded"
        ref="crmrelative"
        :visible.sync="showSelectView"
        :radio="false"
        :selected-data="selectedData"
        crm-type="product"
        @changeCheckout="selectInfos"/>
      <el-button
        type="primary"
        @click="addClick">添加产品</el-button>
    </div>
    <el-table
      :data="productList"
      style="width: 100%;">
      <el-table-column
        prop="name"
        show-overflow-tooltip
        label="产品名称"/>
      <el-table-column
        prop="categoryName"
        show-overflow-tooltip
        label="产品类别"/>
      <el-table-column
        prop="unit"
        show-overflow-tooltip
        label="单位"/>
      <el-table-column
        prop="price"
        show-overflow-tooltip
        label="标准价格"/>
      <el-table-column label="售价">
        <template slot-scope="scope">
          <el-input
            v-wk-number
            v-model="scope.row.salesPrice"
            placeholder="请输入"
            type="number"
            @input="salesPriceChange(scope)"/>
        </template>
      </el-table-column>
      <el-table-column label="数量">
        <template slot-scope="scope">
          <el-input
            v-wk-number
            v-model="scope.row.num"
            type="number"
            placeholder="请输入"
            @input="numChange(scope)"/>
        </template>
      </el-table-column>
      <el-table-column label="折扣（%）">
        <template slot-scope="scope">
          <el-input
            v-wk-number
            v-model="scope.row.discount"
            placeholder="请输入"
            type="number"
            @input="discountChange(scope)"/>
        </template>
      </el-table-column>
      <el-table-column
        prop="subtotal"
        label="合计"/>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button @click="removeItem(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <flexbox class="handle-footer">
      <div class="discount-title">整单折扣（%）：</div>
      <el-input
        v-wk-number
        v-model="discountRate"
        style="width: 80px"
        placeholder="请输入"
        type="number"
        @input="rateChange"/>
      <div class="total-info">已选中产品：
        <span class="info-yellow">{{ productList.length }}</span>&nbsp;种&nbsp;&nbsp;总金额：
        <el-input
          v-wk-number
          v-model="totalPrice"
          style="width: 120px"
          placeholder="请输入"
          type="number"
          @input="totalPriceChange"
          @blur="totalPrice || (totalPrice = 0)"/>&nbsp;元
      </div>
    </flexbox>
  </div>
</template>
<script type="text/javascript">
import ObjMixin from './ObjMixin'
import CrmRelative from '@/components/CreateCom/CrmRelative'

export default {
  name: 'XhProduct', // 关联产品
  components: {
    CrmRelative
  },
  mixins: [ObjMixin],
  props: {},
  data() {
    return {
      showSelectView: false, // 内容
      viewLoaded: false,
      productList: [],
      totalPrice: 0,
      discountRate: '',
      selectedData: { product: [] }
    }
  },
  computed: {},
  watch: {
    dataValue: function(value) {
      this.refreshProductList()
    },
    productList(newValue, oldValue) {
      // 如果新旧值不相同，说明外层进行了修改，重置勾选
      console.log('---ppp---', newValue, oldValue)
      if (newValue.length !== oldValue.length) {
        const selectIds = oldValue.map(item => item.productId)
        const addItems = []
        newValue.forEach(item => {
          if (!selectIds.includes(item.productId)) {
            addItems.push(item)
          }
        })

        const removeItems = []
        const newIds = newValue.map(item => item.productId)
        oldValue.forEach(item => {
          if (!newIds.includes(item.productId)) {
            removeItems.push(item)
          }
        })

        // 重置勾选
        if (this.$refs.crmrelative) {
          addItems.forEach(item => {
            this.$refs.crmrelative.toggleRowSelection('productId', item.productId, true)
          })
          removeItems.forEach(item => {
            this.$refs.crmrelative.toggleRowSelection('productId', item.productId, false)
          })
        }
      }

      this.selectedData = { product: this.productList || [] }
    }
  },
  mounted() {
    this.refreshProductList()
  },
  methods: {
    /**
     * 刷新数据
     */
    refreshProductList() {
      this.productList = this.dataValue.product || []
      this.totalPrice = this.dataValue.totalPrice || 0
      this.discountRate = this.dataValue.discountRate || ''
    },

    /**
     * 选中
     */
    selectInfos(data) {
      if (data.data) {
        const newSelects = []
        data.data.forEach(element => {
          const obj = this.productList.find(item => {
            return item.productId == element.productId
          })
          if (obj) {
            newSelects.push(obj)
          } else {
            newSelects.push(this.getShowItem(element))
          }
        })
        this.productList = newSelects
        this.calculateToal()
      }
    },

    getShowItem(data) {
      const item = {}
      item.name = data.name
      item.categoryName = data.categoryName
      item.unit = data.unit
      item.price = data.price || 0
      item.salesPrice = data.price || 0
      item.num = 1
      item.discount = 0
      item.subtotal = data.price || 0
      item.productId = data.productId
      return item
    },

    /**
     * 单价
     */
    salesPriceChange(data) {
      const item = data.row

      if (item.price !== 0) {
        let discount = ((item.price - item.salesPrice || 0) / item.price) * 100.0
        discount = discount.toFixed(2)
        if (item.discount !== discount) {
          item.discount = discount
        }
      }

      this.calculateSubTotal(item)
      this.calculateToal()
    },

    /**
     * 数量
     */
    numChange(data) {
      const item = data.row
      this.calculateSubTotal(item)
      this.calculateToal()
    },

    /**
     * 折扣
     */
    discountChange(data) {
      const item = data.row
      let salesPrice =
        (item.price * (100.0 - parseFloat(item.discount || 0))) / 100.0
      salesPrice = salesPrice.toFixed(2)
      if (item.salesPrice !== salesPrice) {
        item.salesPrice = salesPrice
      }
      this.calculateSubTotal(item)
      this.calculateToal()
    },

    /**
     * 计算单价
     */
    calculateSubTotal(item) {
      item.subtotal = (item.salesPrice * parseFloat(item.num || 0)).toFixed(2)
    },

    /**
     * 计算总价
     */
    calculateToal() {
      let totalPrice = this.getProductTotal()
      totalPrice =
        (totalPrice * (100.0 - parseFloat(this.discountRate || 0))) / 100.0
      this.totalPrice = totalPrice.toFixed(2)
      this.updateValue() // 传递数据给父组件
    },

    /**
     * 获取产品总价(未折扣)
     */
    getProductTotal() {
      let totalPrice = 0.0
      for (let i = 0; i < this.productList.length; i++) {
        const item = this.productList[i]
        totalPrice += parseFloat(item.subtotal)
      }
      return totalPrice
    },

    /**
     * 总折扣
     */
    rateChange() {
      this.calculateToal()
    },

    /**
     * 总价更改 折扣更改
     */
    totalPriceChange() {
      const totalPrice = this.getProductTotal()
      if (totalPrice) {
        this.discountRate = (
          100.0 -
          (parseFloat(this.totalPrice) / totalPrice) * 100
        ).toFixed(2)
      }
      this.updateValue()
    },

    /**
     * 删除操作
     */
    removeItem(index) {
      const removeItem = this.productList.splice(index, 1)
      // 重置勾选
      if (this.$refs.crmrelative && removeItem.length > 0) {
        this.$refs.crmrelative.toggleRowSelection('productId', removeItem[0].productId, false)
      }
      this.calculateToal()
    },

    /**
     * 更新值
     */
    updateValue() {
      this.valueChange({
        product: this.productList,
        totalPrice: this.totalPrice,
        discountRate: this.discountRate
      })
    },

    /**
     * 添加click
     */
    addClick() {
      this.viewLoaded = true
      this.showSelectView = true
    }
  }
}
</script>
<style lang="scss" scoped>
.handel-header {
  overflow: hidden;
  text-align: right;
  button {
    margin-bottom: 10px;
  }
}

.handle-footer {
  position: relative;
  font-size: 12px;
  padding: 5px;
  .discount-title {
    color: #666;
  }
  .total-info {
    position: absolute;
    right: 20px;
    top: 5px;
    .info-yellow {
      color: #fd715a;
    }
  }
}
</style>
