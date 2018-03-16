### Reactive Options

When the list of options provided by the parent changes, vue-select will react as you'd expect.

<div style="margin-top:0;" class="radio">
  <label>
    <input type="radio" name="reactive-options" v-model="reactive" :value="countries">
    `<v-select :options="countries"></v-select>`
  </label>
</div>

<div class="radio">
  <label>
    <input type="radio" name="reactive-options" v-model="reactive" :value="['foo','bar','baz']">
    `<v-select :options="['foo','bar','baz']"></v-select>`
  </label>
</div>

<v-select :options="reactive"></v-select>
