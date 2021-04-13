import Vue from 'vue';
import ThreeJsExample from './ComboTest.vue';

new Vue( { render: createElement => createElement( ThreeJsExample ) } ).$mount( '#app' );
