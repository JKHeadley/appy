### Custom Labels

By default when the `options` array contains objects, `vue-select` looks for the `label` key for display. If your data source doesn't contain that key, you can set your own using the `label` prop.

On this page, the list of countries used in the examples contains `value` and `label` properties: `{value: "CA", label: "Canada"}`. In this example, we'll display the country code instead of the label.

`<v-select label="value" :options="countries"></v-select>`

<v-select label="value" :options="countries"></v-select>
