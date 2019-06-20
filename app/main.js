import Vue from 'vue'
import App from './components/App.vue'
import store from './store'

import Utils from './scripts/utils'
window.Utils = Utils

import Loader from './scripts/loader'
window.Loader = new Loader()

import Downloader from 'downloadjs'
window.Downloader = Downloader

import SStorage from './scripts/sstorage'
window.SStorage = SStorage

Vue.config.productionTip = false

window.CoursehuntersLoaderInit = false

function runCoursehuntersLoader(params) {
    if (window.CoursehuntersLoaderInit) return

    console.clear()
    window.CoursehuntersLoaderInit = true;
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
}

document.addEventListener('DOMContentLoaded', runCoursehuntersLoader)
window.addEventListener('load', runCoursehuntersLoader)