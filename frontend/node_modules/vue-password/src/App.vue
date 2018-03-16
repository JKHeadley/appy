<template>
  <div id="app">
    <h1 class="title">vue-password using zxcvbn</h1>
    <form class="box">
      <label for="email">Email</label>
      <p class="control">
          <input id="email" class="input" type="email" name="email" v-model="user.email" placeholder="Email">
      </p>

      <label for="password">Password</label>
      <p class="control">
          <vue-password v-model="user.password"
                        name="vue-password"
                        id="vue-password"
                        classes="input"
                        minlength="8"
                        placeholder="Password"
                        :user-inputs="[user.email]"
          >
          </vue-password>
      </p>

      <p class="control">
          <button class="button is-primary">Register</button>
      </p>
    </form>

    <h1 class="title">vue-password with custom strength</h1>
    <form class="box">
      <label for="email">Email</label>
      <p class="control">
          <input id="email" class="input" type="email" name="email" v-model="user.email">
      </p>

      <label for="password">Password</label>
      <p class="control">
          <vue-password-custom v-model="user.password"
                        classes="input"
                        name="vue-password-custom"
                        id="vue-password-custom"
                        :user-inputs="[user.email]"
                        :score="parseInt(score, 10)"
                        pattern="[0-9]+"
                        v-on:input="getStrengthScore"
          >
          </vue-password-custom>
      </p>

      <p class="control">
        <label for="score">Strength Score</label>
        <input type="number" id="score" class="input" v-model="score" min="0" max="4">
        <span class="help">Set the strength score (0-4). Normally, this score would come from a custom strength meter library.</span>
        <span class="help">One use for this would be to use zxcvbn on the server to keep your javascript size small. When the input even fires, use a server request to calculate the new score.</span>
        <span class="help">Be sure the score is an integer between 0 and 4.</span>

      </p>

      <p class="control">
          <button class="button is-primary">Register</button>
      </p>
    </form>
  </div>
</template>

<script>
import VuePassword from './components/VuePassword'
import VuePasswordCustom from './components/VuePasswordCustom'

export default {
  name: 'app',
  components: {
    VuePassword,
    VuePasswordCustom
  },

  data () {
    return {
      user: {
        email: '',
        password: ''
      },
      score: 0
    }
  },

  methods: {
    getStrengthScore () {
      console.log('Recalculate the password score.')
    }
  }
}
</script>

<style>
  body {
    max-width: 600px;
    margin: 10rem auto;
  }
</style>
