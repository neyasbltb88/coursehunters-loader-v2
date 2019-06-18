import Vue from 'vue'
import App from './components/App.vue'
import store from './store'

import Loader from './scripts/loader'
window.Loader = new Loader()

Vue.config.productionTip = false

// Создание блока, в который будет монтированться vue
let app_container = document.createElement('div')
app_container.id = 'app'

// Вставить блок в нужное место страницы
let video_block = document.querySelector('.main-content .standard .container')
if (video_block) {
    video_block.after(app_container)

    window.vm = new Vue({
        store,
        render: h => h(App)
    }).$mount('#app')
}