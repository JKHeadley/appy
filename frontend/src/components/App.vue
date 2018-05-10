  <template>
  <div id="app">
    <!-- Notifications -->
    <vue-snotify></vue-snotify>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        section: 'Head'
      }
    },
    methods: {
      logout () {
//        this.$store.commit('SET_USER', null)
//        this.$store.commit('SET_TOKEN', null)

//        // Clear the localStorage
//        this.$ls.clear()

        this.$router.push('/login')
      }
    }
  }
</script>