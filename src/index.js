



// --> Vue
import Vue from 'vue';
import App from './components/AdaptiveTestingPage';
import store from './store';

// --> VueRouter
import VueRouter from 'vue-router'
Vue.use(VueRouter)


// --> Vuetify
import vuetify from './plugins/vuetify' // path to vuetify export


// --> Apollo
import VueApollo from "vue-apollo";
import { ApolloClient } from '@apollo/client/core';
import { HttpLink } from "@apollo/client/core";
import { InMemoryCache } from "@apollo/client/cache";
import { WebSocketLink } from "@apollo/client/link/ws";
Vue.use(VueApollo);


// --> 1. Build routes
import Mastery from './components/Mastery'
import LearningModule from './components/modules/LearningModule'
import TakeExam from './components/tests/TakeExam'
const routes = [

    // Mastery
    { path: '/mastery', component: Mastery },

    // Learning modules
    { path: '/LearningModule/:name/:id', component: LearningModule, props:true },

    // Testing
    { path: '/take-exam', component: TakeExam },
]
const router = new VueRouter({
    routes // short for `routes: routes`
})


// --> 2. Build apollo client
const getHeaders = () => {
    const headers = {};
    const token = window.localStorage.getItem('apollo-token');
    if (token) {
        headers.authorization = `Bearer ${token}`;
    }
    return headers;
};
const link = new WebSocketLink({
    uri: GRAPH_QL_WS_URL,
    options: {
        reconnect: true,
        lazy: true,
        timeout: 30000,
        connectionParams: () => {
            return {
                headers: {
                    'X-Hasura-Admin-Secret': 'academy',
                },
            };
        },
    }
});
export const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache({
        addTypename: true
    })
});
const apolloProvider = new VueApollo({
    defaultClient: client,
})



// -----------------
// --- WEBSOCKET ---
// -----------------
import {wsTools} from "./scripts/websocket-tools";
store.subscribe(async (mutation, state) => {

    // --> Action Tracking
    if (mutation.type === 'updateClickedArch') {
        // wsTools.websocket.send(JSON.stringify({
        //     msg_type: 'context_add',
        //     new_context: {
        //         eosscontext: {
        //             selected_arch_id: mutation.payload
        //         }
        //     }
        // }));
    }
});




// --> 3. Build Vue instance
let app = new Vue({
    el: '#AdaptiveTesting',
    store,
    router,
    vuetify,
    apolloProvider,
    render: h => h(App)
});















