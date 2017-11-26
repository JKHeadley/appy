<template>
  <section>
    <div v-if="loading" class="content content-centered">
        <pulse-loader></pulse-loader>
    </div>

    <div v-else class="content">
      <h1 class="text-center">{{user.firstName}} {{user.lastName}}</h1>

      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#home">Details</a></li>
        <li><a data-toggle="tab" href="#menu1">Groups</a></li>
        <li><a data-toggle="tab" href="#menu2">Permissions</a></li>
      </ul>

      <div class="tab-content content">
        <div id="home" class="tab-pane fade in active">

          <vue-form :state="formstate" @submit.prevent="onSubmit">

            <vue-form-input
              v-model="user.firstName"
              :formstate="formstate"
              :type="'text'"
              :label="'First Name'"
              :name="'firstName'">
            </vue-form-input>

            <vue-form-input
              v-model="user.lastName"
              :formstate="formstate"
              :type="'text'"
              :label="'Last Name'"
              :name="'lastName'">
            </vue-form-input>

            <vue-form-input
              v-model="user.email"
              :formstate="formstate"
              :type="'email'"
              :label="'Last Name'"
              :name="'lastName'">
            </vue-form-input>




            <div class="py-2 text-center">
              <button class="btn btn-primary" type="submit">Submit</button>
            </div>
          </vue-form>


        </div>
        <div id="menu1" class="tab-pane fade">
          <h3>Menu 1</h3>
          <p>Some content in menu 1.</p>
        </div>
        <div id="menu2" class="tab-pane fade">
          <h3>Menu 2</h3>
          <p>Some content in menu 2.</p>
        </div>
      </div>
    </div>
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
        formstate: {},
      }
    },
    methods: {
      onSubmit: function () {
        console.log(this.formstate.$valid);
      },
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
            this.$store.dispatch('setBreadcrumbTitle', this.user.firstName + ' ' + this.user.lastName)
          })
      }
    },
    created () {
      this.getUser()
    }
  }
</script>
