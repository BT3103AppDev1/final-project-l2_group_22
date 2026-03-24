import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { startIdleSessionManager } from "./idleSession";

const app = createApp(App);

app.use(createPinia());
app.use(router);

startIdleSessionManager(router);

app.mount("#app");
