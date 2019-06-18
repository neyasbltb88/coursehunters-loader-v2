import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        lesson_items: [],

        // Общий флаг, показывающий, идет ли сейчас процесс загрузки
        loading: false,
    },

    // commit
    mutations: {
        masterLoading(state, loading) {
            state.loading = loading;
        },
        masterCheck(state, check) {
            state.lesson_items.forEach(item => item.is_checked = check);
        },
        addItem(state, item) {
            // Добавить новый айтем урока
            state.lesson_items.push(item);

            // Запросить размер файла урока
            this.dispatch('requestItemTotal', item);
        },
        updateItem(state, item) {
            state.lesson_items[item.index] = item;
        },
        setTotal(state, { index, total }) {
            state.lesson_items[index].total = total;
        },
        setMime(state, { index, mime }) {
            state.lesson_items[index].mime = mime;
        },
        setLoaded(state, { index, loaded }) {

        },
        setPercent(state, { index, percent }) {
            state.lesson_items[index].percent = percent;
        },
        setIsChecked(state, { index, is_checked }) {
            state.lesson_items[index].is_checked = is_checked;
        },
        setIsLoading(state, { index, is_loading }) {

        },
        setIsLoaded(state, { index, is_loaded }) {

        },
        setContent(state, { index, content }) {

        },
    },

    // dispatch
    actions: {
        // Метод запроса размера файла урока
        async requestItemTotal(store, item) {
            // Если у айтема еще неизвестен размер и есть url
            if (!item.size_total && item.url) {
                let response = await window.Loader.request(item.url, { method: 'HEAD' });

                item.total = response.total;
                item.mime = response.target.getResponseHeader('Content-Type');

                this.commit('updateItem', item);
            }
        },
        getItem(store, index) {
            return store.state.lesson_items[index];
        }
    },
    getters: {
        getItems(state) {
            return state.lesson_items;
        },
        cnt(state) {
            return state.lesson_items.length;
        },
        checkedCnt(state) {
            return state.lesson_items.reduce((cnt, item) => item.is_checked ? cnt + 1 : cnt, 0);
        },
        allChecked(state) {
            return state.lesson_items.every(item => item.is_checked);
        },
        isLoading(state) {
            return state.loading;
        },
        totalCheckedSize(state) {

        },
        totalLoaded(state) {

        },
    }
})