<template>
    <div id="app" class="coursehunters-loader">
        <div class="container">
            <h2 class="standard-title">Скачать курс</h2>
            <LessonsList></LessonsList>
            <div class="coursehunters-loader_controls">
                <div class="coursehunters-loader_columns-3 jc_flex-start">
                    <LoadBtn @btnClick="btnClickHandler"></LoadBtn>
                </div>
                <div class="coursehunters-loader_columns-3 jc_center">
                    <MasterCheckbox></MasterCheckbox>
                </div>
                <div class="coursehunters-loader_columns-3 jc_flex-end">
                    <ClearHistoryBtn @clearHistory="clearHistoryHandler"></ClearHistoryBtn>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from 'vuex';
import LessonsList from './LessonsList.vue';
import LoadBtn from './LoadBtn.vue';
import MasterCheckbox from './MasterCheckbox.vue';
import ClearHistoryBtn from './ClearHistoryBtn.vue';

import Collectors from '../scripts/collectors';

export default {
    name: 'app',
    components: {
        LessonsList,
        LoadBtn,
        MasterCheckbox,
        ClearHistoryBtn
    },

    computed: {
        ...mapGetters(['cnt', 'isLoading', 'getItems', 'getCourseDisplayName'])
    },
    methods: {
        ...mapMutations([
            'setCourseName',
            'setCourseDisplayName',
            'addItem', 
            'masterLoading', 
            'updateItem', 
            'setLoaded',
            'setIsLoading',
            'setContent',
        ]),
        ...mapActions([
            'getItem',
        ]),

        // === Сбор данных ===
        async collectLessonItems() {
            let lessons_items = await this.Collectors.collectLessonsData(this.storage);

            if(lessons_items) {
                lessons_items.forEach(item => this.addItem(item));

                // Запоминаем в localStorage сколько всего уроков в курсе
                this.storage.set('cnt', this.cnt);
            }
        },
        async collectMaterials() {
            try {
                let material_item = await this.Collectors.collectMaterials(this.storage, this.cnt, this.getCourseDisplayName);
                if(material_item) this.addItem(material_item);
            } catch(err) {}
        },
        async collectInfoPage() {
            try {
                let info_page = await this.Collectors.collectInfoPage(this.storage, this.cnt, this.getCourseDisplayName);
                if(info_page) this.addItem(info_page);
            } catch(err) {}

            // window.Downloader(new Blob([info_page]), window.Utils.fileNameNormalize('Инфо о курсе - ' + this.getCourseDisplayName + '.html'), 'text/html');
        },
        // --- Сбор данных ---

        // === Загрузка уроков ===
        loadingStart() {
            this.masterLoading(true);
            this.loadingLoop();
        },
        loadingEnd() {
            window.Loader.abort();
            this.masterLoading(false);

            let lessons = this.getItems;
            lessons.forEach(lesson => {
                // Те уроки, что загружались на момент остановки процесса загрузки,
                // теряют свой прогресс
                if (lesson.is_loading) {
                    lesson.is_loading = false;
                    lesson.percent = 0;
                    lesson.loaded = 0;
                }

                // Те уроки, что уже были скачены на момент остановки процесса загрузки,
                // будут считаться ранее скаченными(как восстановленные из localStorage),
                // если начать новую загрузку
                if(lesson.is_loaded) {
                    lesson.was_loaded = true;
                }

                this.updateItem(lesson);
            });
        },
        loadingSave(lesson, event) {
            lesson.is_loading = false;
            lesson.is_loaded = true;
            lesson.percent = 100;

            let file_name = `${lesson.name_prefix}${lesson.name_concat || ' '}${lesson.lesson_name}.${lesson.ext}`;
            window.Downloader(new Blob([event.target.response]), file_name, lesson.mime);

            // Запоминаем в localStorage индекс и размер скаченного урока
            this.storage.set(lesson.storage_name, lesson.total);
            this.updateItem(lesson);            
        },
        loadingProgress(index, {loaded}) {
            this.setLoaded({ index, loaded });
        },
        async loadingLesson(lesson) {
            if (lesson === undefined) this.loadEnd();
            let index = lesson.index;
            let loded_event;

            this.setIsLoading({
                index,
                is_loading: true
            });

            // Если у айтема нет url, но есть поле collect_method
            // Значит это айтем с описанием курса, и надо спарсить и составить страницу описания
            if (!lesson.url && lesson.collect_method) {
                // Вызов вложенного в айтем метода сбора контента
                let content = await lesson.collect_method.call();
                this.setContent({ index, content });

                loded_event = {
                    target: {response: content}
                };

            // Если у айтема есть url
            } else if(lesson.url) {
                try {
                    loded_event = await window.Loader.request(lesson.url, {
                        responseType: 'arraybuffer',
                    }, this.loadingProgress.bind(this, index));
                } catch (error) {
                    this.loadingEnd();
                    return false;
                }
            }

            if(loded_event) this.loadingSave(lesson, loded_event);
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
            if (index === undefined) this.loadingEnd();
        },
        // --- Загрузка уроков ---

        // === Обработчики ===
        btnClickHandler() {
            if(!this.isLoading) {
                this.loadingStart();
            } else {
                this.loadingEnd();
            }
        },
        clearHistoryHandler() {
            this.storage.clear();

            // Запоминаем в localStorage сколько всего уроков в курсе
            let lessons_list = document.querySelectorAll('#lessons-list .lessons-item');
            if(lessons_list) this.storage.set('cnt', lessons_list.length);

            let lessons = this.getItems;
            lessons.forEach(lesson => {
                lesson.was_loaded = false;
                lesson.is_loaded = false;

                if(!lesson.is_loading) {
                    lesson.percent = 0;
                    lesson.loaded = 0;
                }

                this.updateItem(lesson);
            });
        },
        // --- Обработчики ---

    },

    async created() {
        let course_name = window.Utils.UrlParse(document.location.href);
        course_name = course_name.path.pop();        

        this.setCourseName(course_name);
        this.storage = window.storage_ = new window.SStorage(course_name, {});

        let course_display_name = document.querySelector('h1.hero-title').textContent;
        this.setCourseDisplayName(course_display_name);
        
        // Cобрать айтемы списока уроков
        await this.collectLessonItems();
        // Собрать айтем материалов курса
        await this.collectMaterials();

        await this.collectInfoPage()
    },

    data() {
        return {
            storage: null,
            Collectors
        }
    }
}
</script>

<style scoped lang="sass">
.coursehunters-loader_controls
    padding:
        top: 40px
        bottom: 20px
    display: flex
    justify-content: stretch
    align-items: center
    user-select: none

.coursehunters-loader_columns-3
    width: 33.33%
    flex-basis: 33.33%
    flex-grow: 1
    display: flex

.jc_flex-start
    justify-content: flex-start
.jc_center
    justify-content: center
.jc_flex-end
    justify-content: flex-end


</style>
