<template>
        <button class="btn" :disabled="!hasChecked" @click="btnClick">{{btnText}}</button>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters(['checkedCnt', 'cnt']),

        hasChecked() {
            return this.checkedCnt > 0;
        },
        btnText() {
            if(this.hasChecked) {
                return `Скачать: ${this.checkedCnt} / ${this.cnt}`;
            } else {
                return 'Выберите уроки для скачивания';
            }
        }
    },
    methods: {
        btnClick() {
            alert('click')
        }
    }
}
</script>