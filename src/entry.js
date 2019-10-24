// Import vue components
import * as components from './lib-components/index';

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Object.keys(components).forEach((componentName) => {
    Vue.component(componentName, components[componentName]);
  });
}

// Create module definition for Vue.use()
const CityJSONComponents = {
  install,
};

// To auto-install when vue is found
/* global window global */
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(CityJSONComponents);
}

// Default export is library as a whole, registered via Vue.use()
export default CityJSONComponents;

// To allow individual component use, export components
// each can be registered via Vue.component()
export * from './lib-components/index';
