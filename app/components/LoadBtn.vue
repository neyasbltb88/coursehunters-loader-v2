<template>
        <button class="btn" 
            :disabled="!hasChecked" 
            :title="btnTitle"
            @click="btnClick"
        >
            {{btnText}}
        </button>
</template>

<script>
import { mapGetters } from 'vuex';
import Utils from '../scripts/utils'

export default {
    data() {
        return {
            Utils
        }
    },
    computed: {
        ...mapGetters([
            'isLoading',
            'checkedCnt',
            'notLoadedCheckedCnt',
            'loadedCnt',
            'notLoadedCnt',
            'cnt',
            'totalCheckedSize',
            'totalCheckedNotLoadedSize',
            'totalLoaded'
        ]),

        hasChecked() {
            // return (this.checkedCnt - this.loadedCnt) > 0;
            return this.notLoadedCheckedCnt > 0;
        },
        btnTitle() {
            let title = '';

            if(this.hasChecked && !this.isLoading) {
                title = 'Начать скачивание выделенных уроков';
            } else if(this.hasChecked && this.isLoading) {
                title = 'Остановить скачивание';
            } else if(!this.hasChecked) {
                title = 'Нет отмеченных уроков для скачивания';
            }

            return title;
        },
        btnText() {
            let text = '';
            if(this.hasChecked) {
                let total = this.Utils.FileSize(this.totalCheckedNotLoadedSize);
                let loaded = this.Utils.FileSize(this.totalLoaded);

                if(!this.isLoading) {
                    text = `Скачать: ${this.notLoadedCheckedCnt} / ${this.notLoadedCnt} (${total})`;
                } else if(this.isLoading) {
                    text = `Скачено: ${this.loadedCnt} / ${this.checkedCnt} (${loaded} / ${total})`;
                }
            } else {
                text = 'Выберите уроки для скачивания';
            }

            return text;
        }
    },
    methods: {
        btnClick() {
            this.$emit('btnClick')
        }
    }
}
</script>