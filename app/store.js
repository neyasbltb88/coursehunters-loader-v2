import Vue from 'vue'
import Vuex from 'vuex'
import Utils from './scripts/utils';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        course_name: '',
        lesson_items: [],

        // Общий флаг, показывающий, идет ли сейчас процесс загрузки
        loading: false,
    },

    // commit
    mutations: {
        setCourseName(state, name) {
            state.course_name = name;
        },
        masterLoading(state, loading) {
            state.loading = loading;
        },
        masterCheck(state, check) {
            state.lesson_items.forEach(item => !item.is_loaded ? item.is_checked = check : null);
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
            let lesson = state.lesson_items[index];
            if (loaded <= lesson.total) {
                state.lesson_items[index].loaded = loaded;
                this.commit('setPercent', {
                    index,
                    percent: +Utils.Percent(loaded, lesson.total, 0)
                });
            }
        },
        setPercent(state, { index, percent }) {
            state.lesson_items[index].percent = percent;
        },
        setIsChecked(state, { index, is_checked }) {
            state.lesson_items[index].is_checked = is_checked;
        },
        setIsLoading(state, { index, is_loading }) {
            state.lesson_items[index].is_loading = is_loading;
        },
        setIsLoaded(state, { index, is_loaded }) {
            state.lesson_items[index].is_loaded = is_loaded;
        },
        setContent(state, { index, content }) {

        },
    },

    // dispatch
    actions: {
        // Метод запроса размера файла урока
        async requestItemTotal(store, item) {
            // Если у айтема еще неизвестен размер и есть url
            if (!item.total && item.url) {
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
        getCourseName(state) {
            return state.course_name;
        },
        getItems(state) {
            return state.lesson_items;
        },
        cnt(state) {
            return state.lesson_items.length;
        },
        checkedCnt(state) {
            // return state.lesson_items.reduce((cnt, item) => (item.is_checked && !item.is_loaded) ? cnt + 1 : cnt, 0);
            return state.lesson_items.reduce((cnt, item) => (item.is_checked) ? cnt + 1 : cnt, 0);
        },
        loadedCnt(state) {
            return state.lesson_items.reduce((cnt, item) => (item.is_loaded) ? cnt + 1 : cnt, 0);
        },
        notLoadedCnt(state) {
            return state.lesson_items.reduce((cnt, item) => (!item.is_loaded) ? cnt + 1 : cnt, 0);
        },
        notLoadedCheckedCnt(state) {
            return state.lesson_items.reduce((cnt, item) => (!item.is_loaded && item.is_checked) ? cnt + 1 : cnt, 0);
        },
        allChecked(state) {
            return state.lesson_items.every(item => item.is_checked);
        },
        isLoading(state) {
            return state.loading;
        },
        totalCheckedSize(state) {
            return state.lesson_items.reduce((total, item) => (item.is_checked) ? total + item.total : total, 0);
        },
        totalCheckedNotLoadedSize(state) {
            return state.lesson_items.reduce((total, item) => (item.is_checked && !item.is_loaded) ? total + item.total : total, 0);
        },
        totalLoaded(state) {
            return state.lesson_items.reduce((loaded, item) => (item.is_checked) ? loaded + item.loaded : loaded, 0);
        },
    }
})