### Two-Way Value Syncing

The most common use case for vue-select is being able to sync the components value with a parent component. The `value` property supports two-way data binding to accomplish this. The `.sync` data-binding modifier is completely optional. You may use `value` without a two-way binding to preselect options. Here we have preselected 'Canada' by setting `syncedVal: 'Canada'` on the parent component. The buttons below demonstrate how you can set the `value` from the parent. Current value: <v-code>{{ syncedVal }}</v-code>

<div class="form-group">
`<v-select v-model="syncedVal" :options="countries"></v-select>`
</div>
<div class="form-group">
<v-select v-model="syncedVal" :options="countries"></v-select>
</div>

<div class="form-group">
<button @click="syncedVal = 'United States'" class="btn btn-default">Set to United States</button>
<button @click="syncedVal = 'Canada'" class="btn btn-default">Set to Canada</button>
</div>
