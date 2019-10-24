<script>
import { CityjsonVueComponentsSample } from './entry';
export default {
    name:  'CityjsonVueComponentsLibDev', // vue library dev component
    components: {
        CityjsonVueComponentsSample,
    },
}
</script>

<template>
    <div class="cityjson-vue-components-lib-dev">
        <cityjson-vue-components-sample></cityjson-vue-components-sample>
    </div>
</template>

<style scoped>
    .cityjson-vue-components-lib-dev {
        display: block;
        width: 400px;
        margin: 25px auto;
    }
</style>
