<template>
    <v-container>

        <!-- HEADER-->
        <v-list-item class="white--text">
            <v-list-item-content>
                <v-list-item-title class="text-h6">
                    <span>Virtual Assistant</span>

                    <!--SETTINGS-->
                    <v-menu bottom left>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn dark icon v-bind="attrs" v-on="on" style="float: right" height="24"
                                   :class="{ 'yellow--text': recommender_status }"
                            >
                                <v-icon>mdi-cog</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item-group v-model="settings" multiple active-class="">
                                <v-list-item>
                                    <template v-slot:default="{ active }">
                                        <v-list-item-action>
                                            <v-checkbox :input-value="active"></v-checkbox>
                                        </v-list-item-action>

                                        <v-list-item-content>
                                            <v-list-item-title>Recommender</v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-menu>
                </v-list-item-title>

                <v-list-item-subtitle class="white--text">
                    Dialogue History
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>

        <v-divider class="white" style="margin-top: 5px;"></v-divider>

        <!-- MESSAGES-->
        <v-container fluid style="padding-bottom: 75px;">
            <v-row dense style="overflow: auto;">
                <v-slide-y-reverse-transition group style="overflow: auto;">

                    <v-col v-for="(item, idx) in messages" :key="idx" cols="12" style="padding-top: 6px; padding-bottom: 6px;">
                        <v-card :style="get_message_style(item.sender)">
                            <v-card-title style="padding-top: 10px; padding-bottom: 4px;" class="text-subtitle-2">
                                <div v-if="item.sender === 'User'">{{username}}</div>
                                <div v-if="item.sender === 'Daphne'" style="display: flex; align-items: center;">{{ item.sender }}
                                    <!------ Voice ----->
                                    <v-btn icon color="primary" small @click="speakMessageTTS(item.text,idx)" class="ml-2">
                                        <v-icon left>
                                            <template v-if="isMessageLoading(idx)">
                                                mdi-loading mdi-spin
                                                </template>
                                                <template v-else>
                                                {{ isMessagePlaying(idx) ? 'mdi-stop' : 'mdi-volume-high' }}
                                                </template>
                                        </v-icon>
                                    </v-btn>
                                    <audio :id="`audio-player-${idx}`" style="display: none;"></audio>
                                </div>
                                <v-btn icon right absolute x-small elevation="0" v-on:click="clear_message(item)">
                                    <v-icon color="analogous2">mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text style="padding-bottom: 10px;" class="chat-message">
                                <div v-html="formatMessage(item.text)" class="message-content"></div>
                            </v-card-text>

                            <v-divider v-if="item.more_info !== null" style="margin-top: 0; margin-bottom: 0;"></v-divider>
                            <v-card-actions v-if="item.more_info !== null" style="padding-top: 8px; padding-left: 16px;">
                                <span class="text-subtitle-2">Recommended Material</span>
                                <v-spacer></v-spacer>
                                <v-btn icon @click="item.show = !item.show">
                                    <v-icon>{{ item.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                </v-btn>
                            </v-card-actions>

                            <!--RECOMMENDATION-->
                            <v-expand-transition v-if="item.more_info !== null">
                                <div v-show="item.show">
                                    <v-divider style="margin: 0;"></v-divider>
                                    <v-card-text style="padding-top: 0; padding-left: 0; padding-right: 0;">


                                        <v-list dense>
                                            <v-list-group v-for="(module, idx) in JSON.parse(JSON.stringify(item.more_info))" :key="idx"
                                                :value="false"
                                            >
                                                <!--LEARNING MODULE-->
                                                <template v-slot:activator>
                                                    <v-list-item-content>
                                                        <v-list-item-title>
                                                            {{module.name}}
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle>{{(module.confidence * 100).toFixed(1)}}%</v-list-item-subtitle>
                                                    </v-list-item-content>
                                                </template>

                                                <!--SLIDE-->
                                                <v-list-item v-for="(slide, idx_s) in module.slides.slice(0, 5)" :key="idx_s">


                                                    <v-container>
                                                        <v-row>
                                                            <v-col cols="10">
                                                                <v-list-item-title>
                                                                    Slide {{slide.id}}
                                                                    <v-progress-linear :value="slide.confidence * 100" rounded color="analogous2"></v-progress-linear>
                                                                </v-list-item-title>
                                                            </v-col>
                                                            <v-col cols="2">
                                                                <v-tooltip bottom>
                                                                    <template v-slot:activator="{ on, attrs }">
                                                                        <v-btn icon small color="success" v-bind="attrs" v-on="on" @click="go_to_slide(module, slide)">
                                                                            <v-icon>mdi-arrow-right-bold</v-icon>
                                                                        </v-btn>
                                                                    </template>
                                                                    <span>Go to slide</span>
                                                                </v-tooltip>
                                                            </v-col>
                                                        </v-row>
                                                    </v-container>

<!--                                                    <v-list-item-content>-->
<!--                                                        <v-list-item-title>-->

<!--                                                            Slide {{slide.id}}-->
<!--                                                            <v-progress-linear :value="slide.confidence * 100" rounded></v-progress-linear>-->


<!--                                                        </v-list-item-title>-->
<!--                                                    </v-list-item-content>-->
                                                </v-list-item>

                                            </v-list-group>



                                        </v-list>


                                    </v-card-text>
                                </div>
                            </v-expand-transition>


                        </v-card>
                    </v-col>

                </v-slide-y-reverse-transition>
            </v-row>
            
        </v-container>


        <!-- FOOTER -->
        <v-footer fixed color="analogous2" height="90">
            <v-container style="display: contents;">
                <v-btn
                            small
                            text
                            color="white"
                            class="mt-n2"
                            @click="confirmClearHistory"
                        >
                            <v-icon left small>mdi-delete</v-icon>
                            Clear History
                        </v-btn>
                <v-row no-gutters>
                    <v-col class="text-center white--text" cols="12">
                        <v-text-field
                            v-model="user_message"
                            outlined
                            background-color="white"
                            :append-outer-icon="isRecording ? 'mdi-microphone' : 'mdi-microphone-outline'"
                            :append-icon="isRecording ? ('') : 'mdi-send'"
                            v-on:click:append="send_generative_message()"
                            v-on:click:append-outer="toggleRecording"
                            :loading="isRecording"
                            @keydown.enter="send_generative_message()"
                        ></v-text-field>
                        
                    </v-col>
                </v-row>
            </v-container>
            <!-- Confirmation Dialog -->
            <v-dialog v-model="showClearDialog" max-width="290">
                <v-card>
                    <v-card-title>Clear Chat History?</v-card-title>
                    <v-card-text>This action cannot be undone.</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="showClearDialog = false">Cancel</v-btn>
                        <v-btn color="error" text @click="clearHistory">Clear</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-footer>

    </v-container>
</template>

<script>
    import {mapState} from "vuex";
    import { marked } from "marked";
    import {MessageSubscription, InsertMessage, ClearMessage, SlidesQueryFast, UpdateSlideIdx} from "../store/queries";
    import {fetchPost} from "../scripts/fetch-helpers";
    import * as _ from "lodash-es";
import { method } from "lodash";
import { head } from "lodash";

    export default {
        name: "chatbox",
        data: function () {
            return {
                messages_db: null,
                messages: [],
                user_message: '',
                showClearDialog: false,
                settings: [0],
                isRecording: false,
                mediaRecorder: null,
                isSpeaking: false,
                speechSynthesis: window.speechSynthesis,
                currentAudio: null,
                playingMessageIds: {},
                loadingMessageIds: {},
            }
        },
        computed: {
            ...mapState({
                user_id: state => state.user.user_id,
                username: state => state.user.username,
                email: state => state.user.email,
                chatbox: state => state.user.chatbox,
            }),
            user_message_object() {
                return {
                    text: this.user_message,
                    sender: 'User'
                }
            },
            recommender_status() {
                return this.settings.includes(0);
            },

            //////////////////////////// GETTERS FOR CURRENT SLIDE INFO /////////////////////
            currentTopic() {
                return this.$store.getters.getCurrentTopic;
            },
            currentModule() {
                return this.$store.getters.getCurrentModule;
            },
            currentSlide() {
                console.log("Current Slide #########################", this.$store.getters.getCurrentSlide)
                return this.$store.getters.getCurrentSlide;
            }
        },
        methods: {
            isMessagePlaying(idx) {
                console.log("Playinggggg", this.playingMessageIds)
                return this.playingMessageIds[idx] === true;
    },
    isMessageLoading(idx) {
    return this.loadingMessageIds[idx] === true;
  },
            confirmClearHistory() {
                this.showClearDialog = true;
            },
            speakMessage(text) {
                console.log("Speakinggggg", this.isSpeaking)
                if (this.isSpeaking) {
                    this.isSpeaking = false;
                    this.speechSynthesis.cancel();
                    return;
                }
                this.isSpeaking = true;
                console.log("Is speakinggggg", this.isSpeaking)
                const utterance = new SpeechSynthesisUtterance(text)
                utterance.onend = () => {
                    this.isSpeaking = false;
                };
                this.speechSynthesis.speak(utterance)
            },
            async speakMessageStreamTTS(text,idx){
    //   const streamUrl = `${API_URL}/assitant/text_to_speech?text=${encodeURIComponent(
    //     text
    //   )}`;
    //   this.playAudioStream(streamUrl);
    if (this.isMessagePlaying(idx)) {
            // If already playing, stop it
            const audio = document.getElementById(`audio-player-${idx}`);
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            this.playingMessageIds.delete(idx);
            return;
        }
        try {
            // Mark this message as playing
            this.playingMessageIds.add(idx);
            
            // Create FormData
            let reqData = new FormData();
            reqData.append('audio_text', text);
            
            // Make request
            const response = await fetchPost(API_URL + 'assistant/text_to_speech',reqData);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get response as blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Get the audio element and play
            const audio = document.getElementById(`audio-player-${idx}`);
            if (!audio) {
                throw new Error("Audio element not found");
            }
            
            // Set up event handlers
            audio.onended = () => {
                this.playingMessageIds.delete(idx);
                URL.revokeObjectURL(audioUrl);
            };
            
            audio.onerror = () => {
                this.playingMessageIds.delete(idx);
                URL.revokeObjectURL(audioUrl);
            };
            
            // Play audio
            audio.src = audioUrl;
            await audio.play();
            
        } catch (error) {
            console.error("Error playing audio:", error);
            this.playingMessageIds.delete(idx);
        }
    
    // let reqData = new FormData();
    // reqData.append('audio_text', text);
    
    // // Get response as blob
    // let response = await fetchPost(API_URL + 'assistant/text_to_speech',reqData);

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    
    // // Get response as blob
    // const audioBlob = await response.blob();
    
    // // Create URL from blob
    // const audioUrl = URL.createObjectURL(audioBlob);
    
    // // Play the audio
    // await this.playAudioStream(audioUrl);

},

playAudioStream(streamUrl) {

      // Reference the audio player element.
      const audio = this.$refs.audioPlayer;
      audio.src = streamUrl;

      if (!this.audioContext) {
        // Initialize the AudioContext only once
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Create the MediaElementSource node only once
        this.source = this.audioContext.createMediaElementSource(audio);
      }

      // Listen for the 'play' event to play the audio
      // This ensures that the audio is likely to play through without interruption
      audio
        .play()
        .then(() => {
          console.log("Audio playing...");
        })
        .catch((err) => {
          console.error("Error playing audio:", err);
        });

      // _You can also add an 'ended' event listener to do something once the playing has ended
      audio.onended = () => {
        console.log("Audio ended.");
      };

            },
            async speakMessageTTS(text, idx){
                console.log("Speaking using openai TTS", this.isSpeaking)  
                if (this.isSpeaking) {
                    this.isSpeaking = false;
                    if (this.currentAudio) {
                        console.log("pausing audio.............")
                        this.currentAudio.pause();
                        this.currentAudio = null;
                    }
                    this.$set(this.playingMessageIds, idx, false);
                    return;
                }
                else{
                    this.$set(this.loadingMessageIds, idx, true);
                    this.isSpeaking = true;

                    let reqData = new FormData();
                    reqData.append('audio_text', text);
                    let response = await fetchPost(API_URL + 'assistant/text_to_speech',reqData);
                    if(!response.ok) return;
                
                    // const audioBlob = await response.blob();
                    // const audioURL = URL.createObjectURL(audioBlob);
                    // // Create an audio object and play it
                    // const audio = new Audio(audioURL);
                    // this.currentAudio = audio;
                    // audio.onended = () => {
                    // this.isSpeaking = false;
                    // this.currentAudio = null;
                    // };
                    // audio.play();

                    const mediaSource = new MediaSource();
                    const audio = new Audio(URL.createObjectURL(mediaSource));
                    this.$set(this.loadingMessageIds, idx, false);
                    this.$set(this.playingMessageIds, idx, true);
                    this.currentAudio = audio;
                    audio.onended = () => {
                        this.isSpeaking = false;
                        this.currentAudio = null;
                        this.$set(this.playingMessageIds, idx, false);
                    };
                
                audio.onerror = (error) => {
                    console.error("Audio playback error:", error);
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    this.$set(this.playingMessageIds, idx, false);
                };
                
                // Start playback
                audio.play();

                    mediaSource.addEventListener('sourceopen', async () => {
                    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
                    const reader = response.body.getReader();
                    const pump = async () => {
                        const { done, value } = await reader.read();
                        if (done) {
                        // Wait for any pending updates to finish before ending the stream.
                        if (sourceBuffer.updating) {
                            await new Promise(resolve => {
                            sourceBuffer.addEventListener('updateend', resolve, { once: true });
                            });
                        }
                        mediaSource.endOfStream();
                        return;
                        }
                        while (sourceBuffer.updating) {
                        await new Promise(r => setTimeout(r, 100));
                        }
                        sourceBuffer.appendBuffer(value);
                        pump();
                    };
                    pump();
});
                     
                }         
            },
            toggleRecording() {
                if (this.isRecording) {
                    // Manually stop
                    console.log("already recording.............")
                    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                        console.log("stopping recording.............")
                        this.mediaRecorder.stop()
                    }
                } else {
                    // Start new recording
                    this.startSpeech()
                }
            },
            async startSpeech() {
                try{
                    console.log("trying to record.............")
                    this.isRecording = true;
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyzer = audioContext.createAnalyser();
                    source.connect(analyzer);

                    // Calculate background noise level
                    let backgroundNoise = 0;
                    const calibrationSamples = [];
                    
                    // // Calibrate for 1 second
                    // for(let i = 0; i < 60; i++) {
                    //     const array = new Uint8Array(analyzer.frequencyBinCount);
                    //     analyzer.getByteFrequencyData(array);
                    //     calibrationSamples.push(array.reduce((a, b) => a + b) / array.length);
                    //     await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
                    // }

                    // backgroundNoise = calibrationSamples.reduce((a, b) => a + b) / calibrationSamples.length;
                    console.log("Background noise level:", backgroundNoise);


                    this.mediaRecorder = new MediaRecorder(stream);
                    const audioChunks = [];
                    let silenceStart = null;

                    // Monitor audio levels
                    const checkAudioLevel = () => {
                        const array = new Uint8Array(analyzer.frequencyBinCount);
                        analyzer.getByteFrequencyData(array);
                        const average = array.reduce((a, b) => a + b) / array.length;
                        
                        // Consider silence only if level is close to background noise
                        if (average < backgroundNoise + 5) {
                            if (!silenceStart) {
                                silenceStart = Date.now();
                            } else if (Date.now() - silenceStart > 2000) {
                                this.mediaRecorder.stop();
                                stream.getTracks().forEach(track => track.stop());
                                return;
                            }
                        } else if (average > backgroundNoise + 10) { // Clear voice detected
                            silenceStart = null;
                        }
                        
                        if (this.mediaRecorder.state === 'recording') {
                            requestAnimationFrame(checkAudioLevel);
                        }
                    };

                    this.mediaRecorder.ondataavailable = (event) => {
                        console.log("pushed audio")
                        audioChunks.push(event.data);
                    };


                    this.mediaRecorder.onstop = async () => {
                        console.log("on stop")
                        this.isRecording = false;
                        const audioBlob = new Blob(audioChunks);
                        let transcribeData = new FormData();
                        transcribeData.append('audio', audioBlob);
                        let transcribeResponse = await fetchPost(API_URL + 'assistant/transcribe', transcribeData);
                        if (transcribeResponse.ok) {
                            let data = await transcribeResponse.json();
                            console.log('--> TRANSCRIPTION:', data);
                            await this.insert_message(data['response'], this.user_message_object.sender);
                                this.$nextTick(() => {
                                const container = this.$el.parentElement;
                                if (container) {
                                    console.log("scrollinggggg", container, container.scrollHeight)
                                    container.scrollTo({
                                        top: container.scrollHeight,
                                        behavior: 'smooth'
                                    });
                                }
                            });

                            let reqData1 = new FormData();
                            reqData1.append('command', data['response']);
                            reqData1.append('route', this.$route.path);

                            const conversationHistory = this.messages.slice(-8).map(msg => ({
                                                role: msg.sender.toLowerCase(),
                                                content: msg.text
                                            }));

                            // ############## ADD FOR GPT VISION (SLIDE INFO) #####################
                            reqData1.append('conversation_history', JSON.stringify(conversationHistory));
                            reqData1.append('vision', true);
                            let slideInfo = JSON.stringify({topic: this.currentTopic, module: this.currentModule, slide: this.currentSlide});
                            reqData1.append('slide_info', slideInfo);
                            // #######################################################

                            let response = '';
                            let dataResponse_lm = await fetchPost(API_URL + 'assistant/gmcommand',reqData1);
                            if (dataResponse_lm.ok) {
                                let data_lm = await dataResponse_lm.json();
                                // console.log('--> CONFIDENCE DATA',data_lm)
                                if(data_lm['response'] !== 'empty'){
                                response = data_lm['response'];
                                console.log("--> RESPONSE", response);
                                }
                            }
                            console.log('--> INSERTING MESSAGE');
                            await this.insert_message(response, 'Daphne', null);
                            this.user_message = '';
                        }
                    }

                    this.mediaRecorder.start();
                    checkAudioLevel();
                }                
                catch(err){
                    console.log(err);
                    this.isRecording = false;
                }
            },
            async go_to_slide(module, slide){
                console.log('--> GOING TO SLIDE:', module, slide);

                // --> 1. Create link to learning module
                let link = '/LearningModule/' + module.name + '/' + module.id;

                // --> 2. Route to learning module
                if (this.$route.path !== link) {
                    await this.$router.push(link);
                }

                // --> 3. Calculate which slide to go to and set
                let slide_idx = await this.get_slide_idx(module.id, slide.id);
                console.log('--> SLIDE IDX', slide_idx);

                let mutation = await this.$apollo.mutate({
                    mutation: UpdateSlideIdx,
                    variables: {
                        user_id: this.user_id,
                        module_id: module.id,
                        slide_idx: slide_idx
                    },
                    update: (cache, { data: { result } }) => {},
                });
                console.log(mutation);
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
            get_message_style(type){
                if(type === 'User'){
                    return 'border-radius: 28px 28px 28px 4px; margin-right: 40px;'
                }
                return 'border-radius: 28px 28px 4px 28px; margin-left: 40px;'
            },
            formatMessage(text) {
                if (!text) return '';
                text = text
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();

                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: false,
                    mangle: false
                });
        
                return marked(text);
            },
            async send_message(){
                console.log('--> SENDING MESSAGE');

                // --> 1. Add message to current messages string
                await this.insert_message(this.user_message_object.text, this.user_message_object.sender);
                let reqData1 = new FormData();
                let reqData2 = new FormData();
                reqData1.append('command', this.user_message_object.text);
                reqData2.append('command', this.user_message_object.text);

                // --> 2. Get recommended material response from Q&A System
                let more_info = null;
                if(this.recommender_status){
                    // let dataResponse_lm = await fetchPost(API_URL + 'ca/dialogue/lmcommand',reqData1);
                  let dataResponse_lm = await fetchPost(API_URL + 'assistant/lmcommand',reqData1);
                  if (dataResponse_lm.ok) {
                        let data_lm = await dataResponse_lm.json();
                        // console.log('--> CONFIDENCE DATA',data_lm)
                        if(data_lm['response'] !== 'empty'){
                            more_info = data_lm['response'];
                        }
                    }
                }

                // --> 3. Get textual response from Q&A System
                let dataResponse_ca = await fetchPost(API_URL + 'assistant/command', reqData2);
                if (dataResponse_ca.ok) {
                    let data_ca = await dataResponse_ca.json();
                    console.log('--> ANSWER DATA',data_ca)
                    let response_obj = data_ca['response'];
                    if(typeof response_obj !== 'undefined'){
                       let text = JSON.parse(response_obj)['text'];
                       await this.insert_message(text, 'Daphne', more_info);
                    }
                }
                else{
                    await this.insert_message('There was an error processing the command', 'Daphne', more_info);
                }

                // --> 4. Reset message field to empty
                this.user_message = '';
            },
            async send_generative_message(){
                // let slideInfo = JSON.stringify({topic: this.currentTopic, module: this.currentModule, slide: this.currentSlide});
                // console.log("TESTTTTTT", slideInfo)

                // --> 1. Add message to current messages string
                await this.insert_message(this.user_message_object.text, this.user_message_object.sender);
                
                this.$nextTick(() => {
                    const container = this.$el.parentElement;
                    if (container) {
                        console.log("scrollinggggg", container, container.scrollHeight)
                        container.scrollTo({
                            top: container.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                });
                let reqData1 = new FormData();
                
                reqData1.append('command', this.user_message_object.text);
                reqData1.append('route', this.$route.path);

                const conversationHistory = this.messages.slice(-8).map(msg => ({
                                                role: msg.sender.toLowerCase(),
                                                content: msg.text
                                            }));

                // ############## ADD FOR GPT VISION (SLIDE INFO) #####################
                reqData1.append('conversation_history', JSON.stringify(conversationHistory));
                reqData1.append('vision', true);
                let slideInfo = JSON.stringify({topic: this.currentTopic, module: this.currentModule, slide: this.currentSlide});
                reqData1.append('slide_info', slideInfo);
                // #######################################################
                

                let response = '';
                let dataResponse_lm = await fetchPost(API_URL + 'assistant/gmcommand',reqData1);
                if (dataResponse_lm.ok) {
                    let data_lm = await dataResponse_lm.json();
                    // console.log('--> CONFIDENCE DATA',data_lm)
                    if(data_lm['response'] !== 'empty'){
                    response = data_lm['response'];
                    console.log("--> RESPONSE", response);
                    }
                }
                console.log('--> INSERTING MESSAGE');
                await this.insert_message(response, 'Daphne', null);
                this.user_message = '';
                
            },
            async insert_message(text, sender, more_info){
                let mutation = await this.$apollo.mutate({
                    mutation: InsertMessage,
                    variables: {
                        user_id: this.user_id,
                        text: text,
                        sender: sender,
                        more_info: more_info
                    },
                    update: (cache, { data: { result } }) => {},
                });
            },
            async clear_message(msg){
                console.log('--> CLEARING MESSAGE:', msg);
                let mutation = await this.$apollo.mutate({
                    mutation: ClearMessage,
                    variables: {
                        message_id: msg.id
                    },
                    update: (cache, { data: { result } }) => {},
                });
            },
            async clearHistory() {
                console.log('--> CLEARING ALL MESSAGES:');
                for (let msg of this.messages) {
                    await this.$apollo.mutate({
                        mutation: ClearMessage,
                        variables: {
                            message_id: msg.id
                        },
                        update: (cache, { data: { result } }) => {},
                    });
                }
                this.showClearDialog = false;
            },
        },
        watch: {
            messages:{
                handler() {
                    this.$nextTick(() => {
                        const container = this.$el.parentElement;
                        if (container) {
                            console.log("scrollinggggg", container, container.scrollHeight)
                            container.scrollTo({
                                top: container.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    });
                },
            deep: true
            },
            '$route.path'(newPath){

            }
        },
        apollo: {
              $subscribe: {
                  messages_db: {
                      deep: true,
                      query: MessageSubscription,
                      variables() {
                          return {
                              user_id: this.user_id
                          }
                      },
                      skip() {
                          return (this.user_id === null);
                      },
                      result(result){
                          console.log('--> MESSAGE:', result);
                          let messages = result.data.messages_db;

                          // --> 1. Calculate number of new messages
                          if(this.chatbox === false){
                              let num_new = messages.length - this.messages.length;
                              this.$store.commit('add_new_messages', num_new);
                          }
                          else{
                              this.$store.commit('set_new_messages', 0);
                          }

                          // --> 2. Copy over messages
                          for(let x = 0; x < messages.length; x++){
                              messages[x].date = (new Date(Date.parse(messages[x].date))).toLocaleString();
                              if(messages[x].more_info !== null){
                                  messages[x].more_info = JSON.parse(messages[x].more_info)
                                  messages[x].show = false;
                              }
                          }
                          this.messages = messages;
                      }
                  }
              }
        },
        async mounted(){

        }
    }
</script>

<style scoped>
.chat-message ::v-deep a {
    color: #1976D2;
    text-decoration: none;
}
.chat-message ::v-deep a:hover {
    text-decoration: underline;
}
.message-content {
    white-space: normal;
    word-break: break-word;
}

.message-content ::v-deep {
    p { 
        margin: 0.5em 0;
        line-height: 1.4;
        margin-bottom: 1px;
    }
    
    h1, h2, h3, h4 { 
        margin: 0.8em 0 0.4em 0;
    }
    
    ul, ol { 
        margin: 0.5em 0;
        padding-left: 1.2em;
    }
    
    li + li {
        margin-top: 0.3em;
    }
    
    hr {
        margin: 0.8em 0;
    }
}


</style>