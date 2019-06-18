<template>
    <div id="app">
        <div class="container">
            <h2 class="standard-title">Скачать курс</h2>
            <LessonsList></LessonsList>
            <div class="pt-20 space-around">
                <LoadBtn></LoadBtn>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';
import LessonsList from './LessonsList.vue';
import LoadBtn from './LoadBtn.vue';

export default {
    name: 'app',
    components: {
        LessonsList,
        LoadBtn
    },

    methods: {
        ...mapMutations(['addItem']),

        collectLessonItems() {
            let lesson_elems = document.querySelectorAll('.lessons-item');
            lesson_elems.forEach((elem, index) => {
                let item = {};
                
                item.index = index;
                item.name_prefix = elem.querySelector('[itemprop="name"]').textContent;
                item.lesson_name = elem.querySelector('.lessons-name').textContent;
                item.url = elem.querySelector('[itemprop="url"]').href;
                item.content = null;
                item.mime = null;
                item.total = 0;
                item.loaded = 0;
                item.percent = 0;
                item.is_checked = true;
                item.is_loading = false;
                item.is_loaded = false;

                this.addItem(item);
            });
        }
    },

    created() {
        this.collectLessonItems();
    }
}
</script>

<style scoped lang="sass">
.space-around
    display: flex
    justify-content: space-around
</style>
