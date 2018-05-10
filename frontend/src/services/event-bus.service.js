// We use a global event bus to enable events defined in the config.
// Learn more about global event buses here: https://alligator.io/vuejs/global-event-bus/
import Vue from 'vue'
const eventBus = new Vue()
export default eventBus
