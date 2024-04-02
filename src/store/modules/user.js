import {fetchGet, fetchPost} from "../../scripts/fetch-helpers";
import Vue from 'vue';
import {
    UpdateStage,
    ExcelExerciseQuery,
    ExperimentQuery,
    LearningModuleQuery,
    TestHistoryQuery, UpdateSlideIdx
} from "../queries";
import { client } from "../../index";
import { get_slide_src } from "../content/utils";
import * as _ from "lodash-es";

import { apollo } from "../../index";
import { vue_router} from "../../index";


const state = {

    // --> User Info <--
    user_id: null,
    username: '',
    email: '',
    experiment_info: false,
    record_actions: false,
    experiment_overlay: false,

    // --> Recorded Actions <--
    answer_question_cnt: 0,
    new_question_cnt: 0,
    start_condition_cnt: 0,

    // --> Clocks <--
    study_dur: 60 * 30,
    quiz_dur: 60 * 10,
    exam_dur: 60 * 20,
    section_end_time: 0,

    // --> Navigation Drawer State <--
    drawer: true,
    drawer_store: null,

    // GLOBAL CURRENT MODULE ID, TOPIC ID, SLIDE INDEX 
    curr_topic : 1,
    curr_module : 1,
    curr_slide : 1,

    // --> Chatbox Drawer State <--
    chatbox: false,
    chatbox_allowed: true,
    chatbox_store: null,
    new_messages: 0,


    // --> Login Module State <--
    login_overlay: true,
};

const getters = {
    // Getter for curr_topic
    getCurrentTopic(state) {
        return state.curr_topic;
    },
    // Getter for curr_module
    getCurrentModule(state) {
        return state.curr_module;
    },
    // Getter for curr_slide
    getCurrentSlide(state) {
        return state.curr_slide;
    },
};

const actions = {
    async initialize({ state, commit, dispatch }){
        console.log('--> SETTING USER INFO');

        // --> 1. Check to see if user is logged in
        let dataResponse     = await fetchGet(API_URL + 'auth/check-status');
        let auth_information = await dataResponse.json();


        if(auth_information.is_logged_in){
            // --> 2. If logged in, get: username, email, pk
            await commit('set_user_id', auth_information.pk);
            await commit('set_user_username', auth_information.username);
            await commit('set_user_email', auth_information.email);
            await dispatch('load_user_experiment_info');
            await commit('set_login_overlay', false);
            await dispatch('initialize_experiment');
        }
        else{
            // --> 3. If not logged in, open login overlay
            await commit('set_login_overlay', true);
        }
    },
    async load_user_experiment_info({ state, commit, dispatch }){
        if(state.user_id === null){
            return;
        }
        let experiment_data = await apollo.query({
            query: ExperimentQuery,
            variables: {user_id: state.user_id},
            fetchPolicy: "network-only"
        });
        console.log('--> EXPERIMENT INFO: ', experiment_data);
        let info = _.cloneDeep(experiment_data['data']['experiment']);
        if(info.length === 0){
            await commit('set_user_experiment_info', false);
        }
        else{
            await commit('set_user_experiment_info', info[0]);
        }
    },
    async initialize_experiment({ state, commit, dispatch }){
        if(state.experiment_info !== false){
            await commit('set_experiment_overlay', true);
        }
    },
    async start_condition({ state, commit, dispatch }){
        let task_order = JSON.parse(state.experiment_info['task_order']);
        let assistant_order = JSON.parse(state.experiment_info['assistant_order']);
        let condition = task_order[0];
        let has_assistant = false;
        if(state.experiment_info['stage'] === 0 || state.experiment_info['stage'] === 1){
            condition = task_order[0];
            has_assistant = Boolean(assistant_order[0]);
        }
        else if(state.experiment_info['stage'] === 2){
            condition = task_order[1];
            has_assistant = Boolean(assistant_order[1]);
        }
        let end_time = Math.floor(Date.now() / 1000) + state.study_dur;
        await commit('set_section_end_time', end_time);



        let lm = 'Space Mission Overview';
        let module_id = '1';
        if(condition === 'T2'){
            lm = 'Space Environment and Orbits';
            module_id = '2';
        }
        let link = '/LearningModule/' + lm + '/' + module_id;
        if (vue_router.path !== link) {
            await vue_router.push(link);
        }

        await commit('set_experiment_overlay', false);
        await commit('set_chatbox_allowed_value', has_assistant);
        await commit('set_chatbox_value', has_assistant);
        commit('set_drawer_value', false);

        if(state.experiment_info['stage'] === 0){
            await dispatch('increment_stage');
            await dispatch('load_user_experiment_info');
        }

        await commit('record_start_condition');
    },
    async increment_stage({ state, commit, dispatch }){
        let curr_stage = state.experiment_info['stage'];
        if(curr_stage >= 2){
            return;
        }
        let next_stage = curr_stage + 1;
        let mutation = apollo.mutate({
            mutation: UpdateStage,
            variables: {
                user_id: state.user_id,
                stage_num: next_stage,
            },
            update: (cache, { data: { result } }) => {},
        });
    },


    async start_quiz({ state, commit, dispatch }){
        let end_time = Math.floor(Date.now() / 1000) + state.quiz_dur;
        await commit('set_section_end_time', end_time);
    },
    async start_exam({ state, commit, dispatch}){
        let end_time = Math.floor(Date.now() / 1000) + state.exam_dur;
        await commit('set_section_end_time', end_time);
        await commit('set_chatbox_value', false);
        await commit('set_chatbox_allowed_value', false);
    },
};

const mutations = {
    async set_user_id(state, user_id){
        console.log('--> SETTING USER ID: ', user_id);
        state.user_id = user_id;
    },
    async set_user_username(state, username){
        state.username = username;
    },
    async set_user_email(state, email){
        state.email = email
    },



    async set_new_messages(state, new_messages){
        state.new_messages = new_messages;
    },
    async add_new_messages(state, new_messages){
        state.new_messages += new_messages;
    },


    set_drawer_value(state, drawer){
        state.drawer = drawer;
    },
    set_chatbox_value(state, chatbox){
        // Can still close chatbox if not allowed
        if(state.chatbox_allowed === false){
            if(chatbox === false){
                state.chatbox = chatbox;
            }
        }
        else{
            if(chatbox === true){
                state.new_messages = 0;
            }
            state.chatbox = chatbox;
        }
    },
    set_chatbox_allowed_value(state, chatbox_allowed){
        state.chatbox_allowed = chatbox_allowed;
    },


    async set_login_overlay(state, login_overlay){
        state.login_overlay = login_overlay;
    },
    async set_experiment_overlay(state, experiment_overlay){
        state.experiment_overlay = experiment_overlay;
    },
    set_user_experiment_info(state, experiment_info){
        state.experiment_info = experiment_info;
    },


    open_slide(state){
        state.chatbox_store = state.chatbox;
        state.drawer_store = state.drawer;
        state.chatbox = false;
        state.drawer = false;
    },
    close_slide(state){
        state.chatbox = state.chatbox_store;
        state.drawer = state.drawer_store
    },

    // ACTIONS
    // answer_question_cnt: 0,
    // new_question_cnt: 0,
    // start_condition_cnt: 0,
    async record_answer_question(state){
        state.answer_question_cnt += 1;
    },
    async record_new_question(state){
        state.new_question_cnt += 1;
    },
    async record_start_condition(state){
        state.start_condition_cnt += 1;
    },
    set_section_end_time(state, section_end_time){
        state.section_end_time = section_end_time;
    },

    /////////////////////////////////// MUTATION FOR SETTING CURRENT SLIDE INFO///////////////////
    async set_curr_topic(state, currentT){
        console.log("################## CURRENT TOPIC SET ##################", currentT)
        state.curr_topic = currentT;
    },
    async set_curr_module(state, currentM){
        console.log("################## CURRENT Module SET ##################", currentM)
        state.curr_module = currentM;
    },
    async set_curr_slide(state, currentS){
        console.log("################## CURRENT Slide SET ##################", currentS)
        state.curr_slide = currentS;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
}
