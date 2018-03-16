import 'prismjs'
import Vue from 'vue'
import Docs from './Docs.vue'
import store from './vuex/store'
import Resource from 'vue-resource'
import vSelect from '../src/components/Select.vue'
import vCode from './components/Code.vue'
import countries from './data/advanced'

Vue.use(Resource)

Vue.component('v-select', vSelect)
Vue.component('v-code', vCode)

Vue.filter('score', function (value) {
  return Math.round(value)
})

Vue.config.debug = true
Vue.config.devtools = true

import { setSelected, toggleMultiple, setPlaceholder, toggleOptionType } from './vuex/actions'


/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { Docs },
  data () {
    return {
      options: countries,
      placeholder: 'Choose a country..',
    }
  }
})
