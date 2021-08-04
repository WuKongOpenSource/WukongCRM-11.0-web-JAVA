import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import permission from './modules/permission'
import app from './modules/app'
import crm from './modules/crm'
import hrm from './modules/hrm'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    permission,
    user,
    crm,
    hrm
  },
  getters
})

export default store
