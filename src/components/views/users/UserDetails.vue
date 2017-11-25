<template>
  <!--<section>-->
    <!--<div v-if="loading" class="content content-centered">-->
        <!--<pulse-loader></pulse-loader>-->
    <!--</div>-->

    <!--<div v-else class="content">-->
      <!--<h1 class="text-center">{{user.firstName}} {{user.lastName}}</h1>-->

      <!--<ul class="nav nav-tabs">-->
        <!--<li class="active"><a data-toggle="tab" href="#home">Details</a></li>-->
        <!--<li><a data-toggle="tab" href="#menu1">Groups</a></li>-->
        <!--<li><a data-toggle="tab" href="#menu2">Permissions</a></li>-->
      <!--</ul>-->

      <!--<div class="tab-content">-->
        <!--<div id="home" class="tab-pane fade in active">-->
          <!--<h3>HOME</h3>-->
          <!--<p>Some content.</p>-->

          <!--<div class="input-group">-->
            <!--<span class="input-group-addon">-->
              <!--<i class="fa fa-fw fa-at" aria-hidden="true"></i>-->
            <!--</span>-->
            <!--<input class="form-control" placeholder="Username" type="text">-->
          <!--</div>-->

          <!--<div class="form-group has-success">-->
            <!--<label class="control-label" for="inputSuccess"><i class="fa fa-fw fa-check"></i> Input with success</label>-->
            <!--<input class="form-control" id="inputSuccess" placeholder="Enter ..." type="text">-->
            <!--<span class="help-block">Help block with success</span>-->
          <!--</div>-->

        <!--</div>-->
        <!--<div id="menu1" class="tab-pane fade">-->
          <!--<h3>Menu 1</h3>-->
          <!--<p>Some content in menu 1.</p>-->
        <!--</div>-->
        <!--<div id="menu2" class="tab-pane fade">-->
          <!--<h3>Menu 2</h3>-->
          <!--<p>Some content in menu 2.</p>-->
        <!--</div>-->
      <!--</div>-->
    <!--</div>-->
  <!--</section>-->
  <section class="content">
    <b-container fluid>
      <b-row class="my-1" v-for="type in types" :key="type">
        <b-col sm="3"><label :for="`type-${type}`">Type {{ type }}:</label></b-col>
        <b-col sm="9"><b-form-input :id="`type-${type}`" :type="type"></b-form-input></b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
  export default {
    name: 'UserDetails',
    data () {
      return {
        loading: null,
        error: null,
        user: null,
        types: [
          'text', 'password', 'email', 'number', 'url',
          'tel', 'date', `time`, 'range', 'color'
        ]
      }
    },
    methods: {
      getUser () {
        this.user = this.error = null
        this.loading = true
        const params = {
          $embed: ['groups', 'permissions']
        }

        this.$userRepository.find(this.$route.params._id, params)
          .then((response) => {
            this.loading = false
            this.user = response.data
          })
      }
    },
    created () {
      this.getUser()
    },
  }
</script>
