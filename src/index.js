



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

export const vue_router = router;


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

export const apollo = apolloProvider.defaultClient;



// -----------------
// --- WEBSOCKET ---
// -----------------

let mutationTypes = ['record_answer_question', 'record_new_question', 'record_start_condition', 'record_tlx_survey'];

import {wsTools} from "./scripts/websocket-tools";
import {fetchPost} from "./scripts/fetch-helpers";
store.subscribe(async (mutation, state) => {
    // console.log('--> ALL MUTATIONS:', mutation);

    // --> Action Tracking
    if (mutationTypes.includes(mutation.type)) {
        console.log('--> MUTATION:', mutation);
        let reqData = new FormData();
        reqData.append('description', mutation.type);
        let dataResponse = await fetchPost(API_URL + 'assistant/action',reqData);
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















