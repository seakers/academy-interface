<template>
    <v-app dark>

        <!-- LOGIN OVERLAY -->
        <v-overlay v-model="login_overlay" opacity="0.8" z-index="1000">
            <login-modal></login-modal>
        </v-overlay>

        <v-overlay v-model="experiment_overlay" opacity="0.8" z-index="1000">
          <experiment-modal></experiment-modal>
        </v-overlay>


        <!-- NAVIGATION -->
        <v-navigation-drawer v-model="drawer" app color="primary lighten-1">

            <!-- MENU HEADER -->
            <v-list-item class="white--text">
                <v-list-item-content>
                    <v-list-item-title class="text-h6">
                        {{ username }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="white--text">
                        {{ email }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-divider class="primary darken-1"></v-divider>

<!--        MENU ITEMS-->
            <v-list dense nav>

<!--            MASTERY-->
                <v-list-item v-for="item in main_links" :key="item.name" :to="item.link" link active-class="bg-active">
                    <v-list-item-icon>
                        <v-icon color="white">{{ item.icon }}</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="white--text">
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

<!--            LEARNING MODULE LIST-->
                <v-list-group :value="false">
                    <v-icon slot="prependIcon" color="white">mdi-book</v-icon>
                    <v-icon slot="appendIcon" color="white">mdi-chevron-down</v-icon>
                    <template v-slot:activator>
                        <v-list-item-title class="white--text">Learning Modules</v-list-item-title>
                    </template>


<!--                LEARNING MODULE ITEMS-->
<!--                    <v-list-item v-for="item in module_links" :key="item.name" :to="item.link" link active-class="bg-active">-->
<!--                        <v-list-item-content>-->
<!--                            <v-list-item-title v-text="item.name" class="white&#45;&#45;text"></v-list-item-title>-->
<!--                            <v-progress-linear :value="item.progress * 100" :color="get_progress_color(item.progress)" rounded style="margin-top: 2px"></v-progress-linear>-->
<!--                        </v-list-item-content>-->



<!--                        <v-list-item-icon>-->
<!--                            <v-icon v-text="item.icon" color="white"></v-icon>-->
<!--                        </v-list-item-icon>-->
<!--                    </v-list-item>-->


                    <!--SUB GROUP - COURSES-->
                    <v-list-group
                        :value="false"
                        no-action sub-group
                        class="white--text" color="white" active-class="bg-active"
                        v-for="(value, name, index) in module_links_2"
                        :key="index"
                    >
                        <v-icon slot="prependIcon" color="white">mdi-chevron-down</v-icon>
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title class="white--text">{{ name }}</v-list-item-title>
                            </v-list-item-content>
                        </template>

                        <!--COURSE LEARNING MODULES-->
                        <v-list-item v-for="item in value" :key="item.name" @click="getModuleLink(item)" link active-class="bg-active" style="padding-left: 24px;">
                            <v-list-item-content>
                                <v-list-item-title class="white--text" v-if="item.status !== null">
                                    <v-badge :color="item.status.color" :content="item.status.text">{{ item.name }}</v-badge>
                                </v-list-item-title>

                                <v-list-item-title class="white--text" v-text="item.name" v-if="item.status === null">
                                </v-list-item-title>

                                <v-progress-linear :value="item.progress * 100" :color="get_progress_color(item.progress)" rounded style="margin-top: 2px"></v-progress-linear>
                            </v-list-item-content>

                            <v-list-item-icon>
                                <v-icon v-text="item.icon" color="white"></v-icon>
                            </v-list-item-icon>
                        </v-list-item>

                    </v-list-group>
                </v-list-group>






<!--            TESTING ITEM LIST-->
                <v-list-group :value="false">
                    <v-icon slot="prependIcon" color="white">mdi-lead-pencil</v-icon>
                    <v-icon slot="appendIcon" color="white">mdi-chevron-down</v-icon>
                    <template v-slot:activator>
                        <v-list-item-title class="white--text">Testing</v-list-item-title>
                    </template>

                    <!-- ITEMS-->
                    <v-list-item v-for="item in test_links" :key="item.name" :to="item.link" link active-class="bg-active">
                        <v-list-item-title v-text="item.name" class="white--text"></v-list-item-title>

                        <v-list-item-icon>
                            <v-icon v-text="item.icon" color="white"></v-icon>
                        </v-list-item-icon>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-navigation-drawer>


        <!-- CHAT BOX -->
        <v-navigation-drawer v-model="chatbox"
                             app
                             right
                             color="analogous2"
                             width="400"
                             class="chatbox-nav-container"
        >
            <chatbox ref="chatbox"></chatbox>
            <v-btn
                v-show="showScrollButton"
                @click="scrollToBottom"
                absolute
                bottom
                right
                fab
                small
                color="primary"
                style="margin: 0 16px 100px 0; z-index: 999;"
            >
                <v-icon>mdi-chevron-down</v-icon>
            </v-btn>
        </v-navigation-drawer>


        <!-- APP BAR -->
        <v-app-bar app class="primary white--text">
            <v-app-bar-nav-icon @click="drawer = !drawer" color="white"></v-app-bar-nav-icon>
            <v-toolbar-title>Daphne Academy</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn @click="toggleChatbox" :disabled="!chatboxAllowed" icon style="margin-right: 10px;">
                <v-badge
                    :content="new_messages"
                    :value="new_messages"
                    color="green"
                    overlap
                >
                    <v-icon color="white" v-if="chatbox === false">mdi-chevron-left</v-icon>
                    <v-icon color="white" v-if="chatbox === true">mdi-chevron-right</v-icon>
                    <v-icon color="white">mdi-message</v-icon>
                </v-badge>
            </v-btn>
        </v-app-bar>


        <!-- VUE ROUTER CONTENT -->
        <v-main class="secondary lighten-3">
            <transition name="fade">
                <v-expand-transition mode="in-out">
                    <router-view :key="this.$route.path"></router-view>
                </v-expand-transition>
            </transition>
        </v-main>


    </v-app>
</template>

<script>
    import {mapState} from "vuex";
    import {ModuleLinkSubscription} from "../store/queries";
    import LoginModal from "./LoginModal.vue";
    import ExperimentModal from "./ExperimentModal.vue";
    import Chatbox from "./Chatbox.vue";
    import { SlideIdxQuery, SlideIndexQuery } from "../store/queries";

    export default {
        name: "adaptive-testing-page",
        components: {
            Chatbox,
            LoginModal,
            ExperimentModal,
        },
        data: function () {
            return {
                modules_db: null,
                showScrollButton: false,
                chatbox: false,

                // --> Main links <--
                main_links: [
                    { name: 'Mastery', icon: 'mdi-school', link: '/mastery'},
                ],

                // --> Test links <--
                test_links: [
                    // { name: 'Take Exam', icon: 'mdi-brain', link: '/adaptive-test'},
                    { name: 'Take Exam', icon: 'mdi-brain', link: '/take-exam'},
                    // { name: 'Targeted', icon: 'mdi-bullseye-arrow', link: '/targeted-test'},
                ],

                // --> Module links <--
                module_links: [],
                module_links_2: {},
            }
        },
        computed: {
            ...mapState({
                user_id: state => state.user.user_id,
                username: state => state.user.username,
                email: state => state.user.email,
                new_messages: state => state.user.new_messages,
            }),
            drawer: {
                get() {
                    return this.$store.state.user.drawer;
                },
                set(value) {
                    this.$store.commit('set_drawer_value', value);
                }
            },
            chatbox: {
                get() {
                    return this.$store.state.user.chatbox;
                },
                set(value) {
                    console.log("setting chatbox valueeeeeeeee")
                    this.$store.commit('set_chatbox_value', value);
                }
            },
            chatboxAllowed: {
                get() {
                    return this.$store.state.user.chatbox_allowed;
                },
                set(value) {
                    this.$store.commit('set_chatbox_allowed_value', value);
                }
                },
            login_overlay: {
                get() {
                    return this.$store.state.user.login_overlay;
                },
                set(value) {
                    this.$store.commit('set_login_overlay', value);
                }
            },
            experiment_overlay: {
                get() {
                    return this.$store.state.user.experiment_overlay;
                },
                set(value) {
                    this.$store.commit('set_experiment_overlay', value);
                }
            }
        },
        methods: {
            toggleChatbox() {
                if (this.chatboxAllowed) {
                    this.chatbox = !this.chatbox;
                }
            },
            async getModuleLink(item){
                console.log('itemmmmmmmmmmmm ----------->', item);
                const currentSlideIdxQuery = await this.$apollo.query({
                  query: SlideIndexQuery, 
                    variables: {
                        user_id: parseInt(this.user_id),
                        module_id: parseInt(item.id),
                    }
                });
                console.log("currentSlideIdxxxxxxxxxxxx in adaptive testing page is -> ", this.user_id, module.id, currentSlideIdxQuery['data']['entry'][0]['slide_idx']);
                const currentSlideIdx = parseInt(currentSlideIdxQuery['data']['entry'][0]['slide_idx'])+1
                const link = ('/LearningModule/' + item.name + '/' + item.id + '/' + currentSlideIdx);
                console.log("The new link is ->", link);
                this.$router.push(`/LearningModule/${item.name}/${item.id}/${currentSlideIdx}`);
            },
            get_progress_color(progress){
                if(progress === 1){
                    return "success";
                }
                return "white";
            },
            async get_slide_idx(module_id, slide_num){
                let slide_query = await this.$apollo.query({
                    deep: true,
                    fetchPolicy: 'no-cache',
                    query: SlidesQueryFast,
                    variables: {
                        user_id: this.user_id,
                        module_id: module_id,
                    }
                });
                let query_slides = slide_query['data']['slides'];
                return query_slides[slide_num].idx;
            },
            scrollToBottom() {
                console.log('scrollToBottom');
                const drawerContent = this.$el.querySelector('.chatbox-nav-container').firstChild;
                console.log("drawer content",drawerContent);
                if (drawerContent) {
                    console.log("scrolling", drawerContent.scrollHeight);
                    drawerContent.scrollTo({
                        top: drawerContent.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            },
            handleScroll() {
                const drawerContent = this.$el.querySelector('.chatbox-nav-container').firstChild;
                if (drawerContent) {
                    const scrollDiff = drawerContent.scrollHeight - drawerContent.scrollTop - drawerContent.clientHeight;
                    this.showScrollButton = scrollDiff > 100;
                }
            },
            get_module_progress(module){
                let progress = 0;
                let slide_questions = 0;
                let slide_questions_completed = 0;
                console.log("module slidesssssss", module.slides);
                for(let y = 0; y < module.slides.length; y++){
                    let slide = module.slides[y];
                    if(slide.type === 'question'){
                        slide_questions++;
                        if(slide.answered === true){
                            slide_questions_completed++;
                        }
                    }
                }
                if(slide_questions !== 0){
                    progress = (slide_questions_completed / slide_questions);
                }
                return progress;
            },
        },
        watch: {
            chatbox(newVal) {
                if (newVal) {
                    this.$nextTick(() => {
                        const drawerContent = this.$el.querySelector('.chatbox-nav-container').firstChild;
                        if (drawerContent) {
                            drawerContent.scrollTo({
                                top: drawerContent.scrollHeight,
                                behavior: 'smooth'
                            });
                            drawerContent.addEventListener('scroll', this.handleScroll);
                        }
                    });
                }
            }
        },
        beforeDestroy() {
            const drawerContent = this.$el.querySelector('.chatbox-nav-container').firstChild;
            if (drawerContent) {
                drawerContent.removeEventListener('scroll', this.handleScroll);
            }
        },
        apollo: {
            $subscribe: {
                modules_db: {
                    deep: true,
                    query: ModuleLinkSubscription,
                    variables() {
                        return {
                            user_id: this.user_id
                        }
                    },
                    skip() {
                        return (this.user_id === null);
                    },
                    async result(result) {
                        console.log('MODULE LINKS SUB', result);
                        let modules = result.data.modules_db;
                        let module_links = [];
                        let module_links_2 = {};

                        // --> Iterate over learning modules
                        console.log("alll modules", modules)
                        for(let x = 0; x < modules.length; x++){
                            let module = modules[x];
                            console.log("one module", module)

                            // --> Find module progress
                            let progress = this.get_module_progress(module);

                            // --> Get module status
                            let status = null;
                            if(module.status !== null){
                                status = JSON.parse(module.status);
                            }
                            console.log("status", status);
                            console.log("Module", module);

                            console.log("testing",this.user_id,module.id)
                            // const currentSlideIdxQuery = await this.$apollo.query({
                            //     query: SlideIndexQuery,
                            //     variables: {
                            //         user_id: parseInt(this.user_id),
                            //         module_id: parseInt(module.id),
                            //     }
                            // });
                            // console.log("currentSlideIdx", currentSlideIdxQuery['data'], currentSlideIdxQuery['data']['entry'][0]['slide_idx']);
                            // const currentSlideIdx = parseInt(currentSlideIdxQuery['data']['entry'][0]['slide_idx'])+1

                            const currentSlideIdxQuery = await this.$apollo.query({
                                query: SlideIndexQuery, 
                                variables: {
                                    user_id: parseInt(this.user_id),
                                    module_id: parseInt(module.id),
                                }
                            });
                            console.log("currentSlideIdxxxxxxxxxxxx in adaptive testing page is -> ", this.user_id, module.id, currentSlideIdxQuery['data']['entry'][0]['slide_idx']);
                            const currentSlideIdx = parseInt(currentSlideIdxQuery['data']['entry'][0]['slide_idx'])+1

                            // --> Create module link
                            let module_link = {
                                id: module.id,
                                name: module.name,
                                icon: module.icon,
                                link: ('/LearningModule/' + module.name + '/' + module.id + '/' + currentSlideIdx),
                                // link: ('/LearningModule/' + module.name + '/' + module.id),
                                status: status,
                                progress: progress
                            }

                            console.log("module_link", module_link);

                            // --> push: module_links
                            module_links.push(module_link);


                            // --> push: module_links_2
                            console.log("module.course", module.course);
                            console.log("module_links_2 first", module_links_2);
                            if(module.course === null){
                                if(!('General' in module_links_2)){
                                    module_links_2['General'] = [module_link]
                                }
                                else{
                                    module_links_2['General'].push(module_link)
                                }
                            }
                            else{
                                if(!(module.course in module_links_2)){
                                    module_links_2[module.course] = [module_link]
                                }
                                else{
                                    module_links_2[module.course].push(module_link)
                                }
                            }
                        }


                        this.module_links = module_links;
                        this.module_links_2 = module_links_2;
                        console.log("module_links2", module_links_2);
                    },
                },
                
            },
        },
        async mounted() {
            await this.$store.dispatch('initialize');
        }
    }
</script>

<style scoped>

.wrapper {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    min-height: 100vh;
    max-width: 100vw;
    padding: 10px;
    width: 100vw;
    height: 100vh;
}

.bg-active {
    background-color: #232C3A;
    color : white !important;
}

</style>