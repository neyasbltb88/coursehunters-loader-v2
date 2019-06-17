import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

// Создание блока, в который будет монтированться vue
let app_container = document.createElement('div')
app_container.id = 'app'

// Вставить блок в нужное место страницы
let video_block = document.querySelector('.main-content .standard .container')
video_block.after(app_container)

new Vue({
    store,
    render: h => h(App)
}).$mount('#app')