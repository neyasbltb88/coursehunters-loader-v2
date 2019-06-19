<template>
    <div id="app">
        <div class="container">
            <h2 class="standard-title">Скачать курс</h2>
            <LessonsList></LessonsList>
            <div class="pt-40 space-around align-center user-select">
                <LoadBtn @btnClick="btnClickHandler"></LoadBtn>
                <MasterCheckbox></MasterCheckbox>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex';
import LessonsList from './LessonsList.vue';
import LoadBtn from './LoadBtn.vue';
import MasterCheckbox from './MasterCheckbox.vue';

import Utils from '../scripts/utils';

export default {
    name: 'app',
    components: {
        LessonsList,
        LoadBtn,
        MasterCheckbox
    },

    computed: {
        ...mapGetters(['isLoading', 'getItems'])
    },
    methods: {
        ...mapMutations([
            'setCourseName',
            'addItem', 
            'masterLoading', 
            'updateItem', 
            'setLoaded',
            'setIsLoading',
            'setIsLoaded',
        ]),
        ...mapActions([
            'getItem',
        ]),

        collectLessonItems() {
            let lesson_elems = document.querySelectorAll('.lessons-item');
            lesson_elems.forEach((elem, index) => {
                let item = {};
                
                item.index = index;
                item.name_prefix = elem.querySelector('[itemprop="name"]').textContent;
                item.lesson_name = elem.querySelector('.lessons-name').textContent;
                item.url = elem.querySelector('[itemprop="url"]').href;                
                item.ext = Utils.UrlParse(item.url).file.ext;
                item.content = null;
                item.mime = null;
                item.total = 0;
                item.loaded = 0;
                item.percent = 0;
                item.is_checked = true;
                item.is_loading = false;
                item.is_loaded = false;

                item.was_loaded = false;

                this.addItem(item);
            });
        },
        loadingStart() {
            console.log('loadingStart');

            this.masterLoading(true);
            this.loadingLoop();
        },
        loadingEnd() {
            console.log('loadingEnd');
            
            window.Loader.abort();

            this.masterLoading(false);

            let lessons = this.getItems;
            lessons.forEach(lesson => {
                if (lesson.is_loading) {
                    lesson.is_loading = false;
                    lesson.percent = 0;
                    lesson.loaded = 0;
                }

                this.updateItem(lesson);
            });
        },
        async loadingSave(index, event) {
            let lesson = await this.getItem(index);

            lesson.is_loading = false;
            lesson.is_loaded = true;
            lesson.percent = 100;

            let file_name = `${lesson.name_prefix} ${lesson.lesson_name}.${lesson.ext}`;

            window.Downloader(new Blob([event.target.response]), file_name, lesson.mime);

            this.updateItem(lesson);            
        },
        loadingProgress(index, event) {
            this.setLoaded({
                index,
                loaded: event.loaded
            });
        },
        async loadingLesson(lesson) {
            if (lesson === undefined) this.loadEnd();
            let index = lesson.index;
            let loded_event;

            this.setIsLoading({
                index,
                is_loading: true
            });

            // Если у айтема нет url, но есть поле content
            if (!lesson.url && lesson.content) {
                lesson.is_loading = true;

                loded_event = {
                    target: {
                        response: lesson.content
                    }
                };

            // Если у айтема есть url
            } else if(lesson.url) {
                lesson.is_loading = true;

                try {
                    loded_event = await window.Loader.request(lesson.url, {
                        responseType: 'arraybuffer',
                    }, this.loadingProgress.bind(this, index));
                } catch (error) {

                    // if (error.type === 'abort') {
                        this.loadingEnd();
                        return false;
                    // }
                }
            
            // Если у айтема нет ни url, ни content
            } else {

            }

            if (!loded_event) requestAnimationFrame(this.loadingLoop.bind(this));

            this.loadingSave(index, loded_event);

            this.loadingLoop();
        },
        loadingLoop() {
            let index;
            let lessons = this.getItems;

            // Поиск первого попавшегося урока, отмеченного для скачивания
            for (let i = 0; i < lessons.length; i++) {
                let lesson = lessons[i];

                // Если урок с таким индексом существует, он отмечен, еще не загружен и не в процессе загрузки
                if (lesson && lesson.is_checked && !lesson.is_loaded && !lesson.is_loading) {
                    index = i;
                    this.loadingLesson(lesson);
                    break;
                }
            }

            // Если не найдено подходящего для загрузки урока, то закончить загрузку
            if (index === undefined) {
                this.loadingEnd();
            }
        },
        btnClickHandler() {
            if(!this.isLoading) {
                this.loadingStart();
            } else {
                this.loadingEnd();
            }
        }
    },

    created() {
        let course_name = window.Utils.UrlParse(document.location.href);
        course_name = course_name.path.pop();

        this.setCourseName(course_name);
        
        this.collectLessonItems();
    }
}
</script>

<style scoped lang="sass">
.user-select
    user-select: none

.space-around
    display: flex
    justify-content: space-between

.align-center
    align-items: center
</style>
