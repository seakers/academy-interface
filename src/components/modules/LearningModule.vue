<template>
    <v-container style="padding: 0px 12px 0px 12px;">

        <v-snackbar v-model="correct_noti" timeout="5000" color="success" elevation="24">
            Nice job!
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="correct_noti = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>

        <v-snackbar v-model="wrong_noti" timeout="5000" color="error" elevation="24">
            Incorrect
            <template v-slot:action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="wrong_noti = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>

        <v-row justify="center" style="padding-top: 12px;">
            <v-col>
                <v-card elevation="0" min-height="700">

                    <v-card-title>{{ module_name }}</v-card-title>

                    <v-card-subtitle>
                        <div v-for="(topic, idx) in module.topics" :key="idx">{{ topic }}</div>
                        <div>Minutes Left: {{ remaining_time }}</div>
                    </v-card-subtitle>

                    <v-divider style="margin-top: 0;"></v-divider>

                    <v-container>

                        <v-carousel v-model="slide_idx" ref="myCarousel"
                                    hide-delimiter-background
                                    hide-delimiters
                        >

<!--                        PREV / NEXT SLIDE-->
                            <template v-slot:prev="{ on, attrs }">
                                <v-btn color="primary" v-bind="attrs" v-on="on" icon :disabled="disable_back">
                                    <v-icon>mdi-arrow-left-bold</v-icon>
                                </v-btn>
                            </template>
                            <template v-slot:next="{ on, attrs }">
                                <v-btn color="primary" v-bind="attrs" v-on="on" icon :disabled="disable_next">
                                    <v-icon>mdi-arrow-right-bold</v-icon>
                                </v-btn>
                            </template>

<!--                        SLIDE-->
                            <v-carousel-item v-for="(slide, idx) in slides" :key="idx">

<!--                            CONTENT SLIDE -->
                                <v-img
                                    v-if="slide.type === 'info'"
                                    max-height="500"
                                    :src="get_slide_image(slide.src)"
                                    contain
                                    v-on:click="toggle_overlay(true)"
                                    style="cursor: zoom-in"
                                ></v-img>

<!--                            IMAGE ZOOM OVERLAY-->
                                <v-overlay v-model="show_overlay">
                                        <v-img
                                            v-if="slide.type === 'info'"
                                            :src="get_slide_image(slide.src)"
                                            max-width="960"
                                            max-height="720"
                                            v-on:click="toggle_overlay(false)"
                                            style="cursor: zoom-out"
                                        ></v-img>
                                </v-overlay>


<!--                            QUIZ START SLIDE-->
                                <v-container v-if="slide.type === 'quiz_start'">
                                    <v-card elevation="0" style="padding-left: 70px; padding-right: 70px; padding-top: 20px">
                                        <v-card-title class="justify-center">You have completed the first section of this task</v-card-title>
                                        <v-card-text class=" text-center text-body-1">The second section contains a short quiz to gauge your understanding of the presented material. You will have one attempt per question, and are allowed to return to the material if necessary (open book). Continue to the next slide when you are ready to begin.</v-card-text>
<!--                                        <v-btn @click="begin_quiz" color="primary">Begin Quiz</v-btn>-->
                                    </v-card>
                                </v-container>

<!--                            QUIZ END SLIDE-->
                                <v-container v-if="slide.type === 'quiz_end'">
                                    <v-card elevation="0" style="padding-left: 70px; padding-right: 70px; padding-top: 20px">
                                        <v-card-title class="justify-center">Assessment Complete</v-card-title>
                                        <v-card-text class="text-center text-body-1">This is the end of the module quiz. Please proceed to the module exam when ready.</v-card-text>
<!--                                        <v-card-actions class="justify-center">-->
<!--                                            <v-btn color="primary" v-on:click="go_to_mastery()" class="align-center">Mastery <v-icon right>mdi-arrow-right</v-icon></v-btn>-->
<!--                                        </v-card-actions>-->
                                        <v-btn @click="begin_exam" color="primary">Begin Exam</v-btn>
                                    </v-card>
                                </v-container>


<!--                            EXAM FINISH SLIDE-->
                              <v-container v-if="slide.type === 'exam_finish'">
                                <v-card elevation="0" style="padding-left: 70px; padding-right: 70px; padding-top: 20px">
                                  <v-card-title class="justify-center">Task Complete</v-card-title>
                                  <v-card-text class="text-center text-body-1">This slide denotes the end of the module exam. If this is the second learning module you have studied, the experiment has finished. Else, select the continue button below to continue to the next stage.</v-card-text>
                                                                          <v-card-actions class="justify-center">
                                                                              <v-btn color="primary" v-on:click="go_to_next_condition()" class="align-center">Continue<v-icon right>mdi-arrow-right</v-icon></v-btn>
                                                                          </v-card-actions>
                                </v-card>
                              </v-container>



<!--                            QUESTION SLIDE-->
                                <v-container v-if="slide.type === 'question'">
                                    <v-card elevation="0" style="padding-left: 70px; padding-right: 70px; padding-top: 20px">
                                        <v-card-title style="padding-bottom: 0; word-break: break-word;">{{ slide.question.text }}</v-card-title>
                                        <v-container>
                                            <v-row no-gutters>

<!--                                            CHOICES - QUESTION NOT COMPLETED-->
                                                <template v-if="slide.answered === false">
                                                    <v-radio-group v-model="slide.choice_id">
                                                        <v-radio
                                                            v-for="(option, idx) in slide.question.choices"
                                                            :key="idx"
                                                            :label="option.text"
                                                            :value="idx"
                                                        ></v-radio>
                                                    </v-radio-group>
                                                </template>

<!--                                            CHOICES - QUESTION COMPLETED-->
                                                <template v-if="slide.answered === true">
                                                    <v-radio-group v-model="slide.choice_id">
                                                        <v-radio
                                                            v-for="(option, idx) in slide.question.choices"
                                                            :key="idx"
                                                            :label="option.text"
                                                            :value="idx"
                                                            :color="choice_color(option.correct)"
                                                            :disabled="!option.correct"
                                                        ></v-radio>
                                                    </v-radio-group>
                                                </template>

                                            </v-row>

<!--                                        CHECK ANSWER-->
                                            <v-row no-gutters>
                                                <template v-if="slide.answered === false">
                                                    <v-btn color="primary" v-on:click="check_answer(slide)" :disabled="slide.choice_id === -1">Check</v-btn>
                                                </template>
                                                <template v-if="slide.answered === true">
                                                    <v-btn color="primary" disabled>Check</v-btn>
                                                </template>
                                            </v-row>

<!--                                            <v-divider style="margin-top: 5px; margin-bottom: 5px;"></v-divider>-->

<!--                                        EXPLANATION-->
<!--                                            <v-row no-gutters>-->
<!--                                                <v-expansion-panels :value="show_answer" multiple>-->
<!--                                                    <v-expansion-panel :disabled="!slide.answered">-->
<!--                                                        <v-expansion-panel-header>Why?</v-expansion-panel-header>-->
<!--                                                        <v-expansion-panel-content>-->
<!--                                                            {{ slide.question.explanation }}-->
<!--                                                        </v-expansion-panel-content>-->
<!--                                                    </v-expansion-panel>-->
<!--                                                </v-expansion-panels>-->
<!--                                            </v-row>-->

                                        </v-container>
                                    </v-card>
                                </v-container>

                            </v-carousel-item>
                        </v-carousel>

                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState } from 'vuex';
import * as _ from 'lodash-es';
import {ModuleQuery, SlideIdxQuery, SlidesQuery, UpdateSlideIdx, UpdateSlide, SlideIdxSub} from "../../store/queries";
import { get_slide_src } from "../../store/content/utils";
import {fetchPost} from "../../scripts/fetch-helpers";


export default {
    name: "learning-module",
    components: {

    },
    data: function () {
        return {
            // --> Module data
            slide_idx: 0,
            module: {},
            slides: [],
            question_records: [],
            remaining_time: 0,
            timer: null,

            // --> Expansion panel answer
            show_answer: [],

            // --> Zoom on slide
            show_overlay: false,

            // --> Disable slideshow buttons
            disable_back: false,
            disable_next: false,

            // --> Correct / Incorrect Answer
            correct_noti: false,
            wrong_noti: false,
        }
    },
    computed: {
        ...mapState({
            user_id: state => state.user.user_id,
            experiment_info: state => state.user.experiment_info,
            section_end_time: state => state.user.section_end_time,
        }),
        module_name(){
            return this.$route.params.name
        },
        module_id(){
            return this.$route.params.id
        },
    },
    methods: {
        async begin_quiz(){
            await this.$store.dispatch('start_quiz');
            this.$refs.myCarousel.next();
        },
        async begin_exam(){
            await this.$store.dispatch('start_exam');
            this.$refs.myCarousel.next();
        },
        async update_slide(slide){
            console.log('--> UPDATING SLIDE');
            let mutation = await this.$apollo.mutate({
                mutation: UpdateSlide,
                variables: {
                    slide_id: slide.id,
                    answered: slide.answered,
                    correct: slide.correct,
                    attempts: slide.attempts,
                    choice_id: slide.choice_id,
                },
                update: (cache, { data: { result } }) => {},
            });
        },
        async update_slide_idx(){
            console.log('--> UPDATING SLIDE IDX');
            let mutation = await this.$apollo.mutate({
                mutation: UpdateSlideIdx,
                variables: {
                    user_id: this.user_id,
                    module_id: this.module_id,
                    slide_idx: this.slide_idx,
                },
                update: (cache, { data: { result } }) => {},
            });
        },
        get_slide_image(src){
            return get_slide_src(src);
        },
        toggle_overlay(val){
            if(val === true){
                this.$store.commit('open_slide');
            }
            else{
                this.$store.commit('close_slide');
            }
            this.show_overlay = val;
        },
        choice_color(value){
            if(value === true){
                return 'success';
            }
            return 'error'
        },
        slide_logic(){
            this.show_answer = [];
            if(this.slides.length === 0 || typeof this.slides[this.slide_idx] === 'undefined'){
                return;
            }
            console.log('--> SLIDE LOGIC');
            if(this.slides[this.slide_idx].type === 'question'){
                if(!this.question_records.includes(this.slide_idx)){
                    this.$store.commit('record_new_question');
                    this.question_records.push(this.slide_idx);
                }
            }


            // --> 1. Logic: disable_back
            this.disable_back = false;
            if(this.slide_idx === 0){
                this.disable_back = true;
            }
            if(this.slides[this.slide_idx].type === 'question'){
                if(this.slides[this.slide_idx].graded === true){
                    this.disable_back = true;
                }
            }


            // --> 2. Logic: disable_next
            this.disable_next = false;
            if((this.slide_idx + 1) === this.slides.length){
                this.disable_next = true;
                this.disable_back = true;
            }
            if(this.slides[this.slide_idx].type === 'question'){
                if(this.slides[this.slide_idx].answered === false){
                    this.disable_next = true;
                }
            }
            if(this.slides[this.slide_idx].type === 'quiz_end'){
                this.disable_next = true;
            }
        },
        async go_to_mastery(){
            // --> 1. Route to mastery page
            if (this.$route.path !== '/mastery') {
                await this.$router.push('/mastery');
            }
        },
        async go_to_next_condition(){
            // this.slide_idx = 0;
            await this.$store.dispatch('increment_stage');
            await this.$store.dispatch('load_user_experiment_info');
            await this.$store.dispatch('start_condition');
            // this.slide_idx = 0;
        },
        async check_answer(slide){
            this.correct_noti = false;
            this.wrong_noti = false;

            // --> 1. Determine if answer is correct
            let correct = slide.question.choices[slide.choice_id].correct;

            // --> 2. Determine number of attempts based on whether the question is graded or not
            let num_attempts = 3;
            if(slide.graded === true){
                num_attempts = 1
            }

            // --> 3. Increment question attempts
            slide.attempts++;

            // --> 4. If CORRECT
            if(correct === true){
                this.correct_noti = true;
                this.disable_next = false;
                slide.correct = true;
                slide.answered = true;
            }

            // --> 5. If WRONG
            if(correct === false){
                this.wrong_noti = true;
                if(slide.attempts === num_attempts){
                    this.disable_next = false;
                    slide.correct = false;
                    slide.answered = true;
                    // Set choice_id to correct answer
                    for(let x = 0; x < slide.question.choices.length; x++){
                        if(slide.question.choices[x].correct === true){
                            slide.choice_id = x;
                            break;
                        }
                    }
                }
            }

            // --> 6. Commit slide changes to database
            await this.update_slide(slide);

            // --> 7. Send answer report to back-end if graded question
            if(slide.graded === true){
                let reqData = new FormData();
                reqData.append('slide', JSON.stringify(slide));
                let dataResponse = await fetchPost(API_URL + 'assistant/stats/updatemodel',reqData);
            }

            // --> 8. Await
            if(slide.choice_id !== -1){
                await this.$store.commit('record_answer_question');
            }
        },
        startTimer() {
            if (this.timer) {
                clearInterval(this.timer);
            }

            // Set the timer to update every 1000 milliseconds (1 second)
            this.timer = setInterval(() => {
                // Calculate the remaining time in seconds
                this.remaining_time =  Math.floor((this.section_end_time - Math.floor(Date.now() / 1000)) / 60);
                // console.log('--> REMAINING TIME: ', this.remaining_time, this.section_end_time);

                // Clear the interval if the time has run out
                if (this.remaining_time <= 0) {
                    clearInterval(this.timer);
                    this.remaining_time = 0;
                    // Do any additional logic when the time has run out
                }
            }, 1000);
        },
    },
    watch: {
        slide_idx(){
            this.show_overlay = false;
            this.slide_logic();
            this.update_slide_idx();
            console.log('--> SLIDE:', this.slides[this.slide_idx]);
        },
        module_name(){
            this.show_overlay = false;
            console.log('--> REFETCHING MODULE DATA');
            this.$forceUpdate();
        },
        section_end_time(){
            this.startTimer();
        }
    },
    apollo: {
        module: {
            query: ModuleQuery,
            fetchPolicy: 'no-cache',
            variables() {
                return {
                    user_id: this.user_id,
                    module_id: this.module_id,
                }
            },
            skip() {
                return this.user_id === null;
            },
            update: data => {
                let module = data.module;
                let topics = module.topics;
                let topic_list = [];
                for(let x = 0; x < topics.length; x++){
                    topic_list.push(topics[x].topic.name);
                }
                let obj = {
                    id: module.id,
                    name: module.name,
                    icon: module.icon,
                    slide_count: module.slides.aggregate.count,
                    topics: topic_list,
                }
                console.log('--> MODULE QUERY:', obj);
                return obj;
            }
        },
        slides: {
            query: SlidesQuery,
            fetchPolicy: 'no-cache',
            variables() {
                return {
                    user_id: this.user_id,
                    module_id: this.module_id,
                }
            },
            skip() {
                return this.user_id === null;
            },
            update: data => {
                let slides = _.cloneDeep(data.slides);
                console.log('--> CLONING SLIDES');
                for(let x = 0; x < slides.length; x++){
                    if(slides[x].type === 'question'){
                        slides[x].question.choices = JSON.parse(slides[x].question.choices);
                    }
                }
                console.log('--> SLIDES QUERY:', data.slides);
                return slides;
            }
        },
        $subscribe: {
            slide_idx: {
                deep: true,
                query: SlideIdxSub,
                variables() {
                    return {
                        user_id: this.user_id,
                        module_id: this.module_id,
                    }
                },
                skip() {
                    return this.user_id === null;
                },
                result(result) {
                    console.log('--> SLIDE IDX SUB DATA:', result);
                    let return_idx = result.data.entry[0].slide_idx;

                    this.slide_idx = return_idx;
                },
            }
        }
    },
    mounted() {
        this.slide_logic();
        this.startTimer();
    },
    beforeUpdate(){
        this.slide_logic();
    },
    beforeDestroy() {
        // Clear the interval when the component is destroyed
        clearInterval(this.timer);
    },

}
</script>

<style scoped>


</style>