<template>
  <v-container>
    <v-card
        width="450"
        color="primary lighten-1"
        loader-height="6"
    >
      <v-card-title>Experiment</v-card-title>
      <v-card-text>
          Welcome to the teaching assistant experiment. This experiment will consist of two tasks, each of which is composed of a <b>study</b> section, a <b>quiz</b> section, and an <b>exam</b> section.
          You will have an hour to complete each task.
          You are asked to study the material provided for each task, and complete the quiz and exam to the best of your ability. During the quiz, you will be able to review the study material.
          However, during the exam, you will not have access to the study material.
          You will have access to a <b>virtual assistant</b> that can answer questions about the learning material during the <b>learning and quiz sections only</b>.
          To ask the virtual assistant a question, type in the chatbox on the right hand side and send a message. Please be patient for the agent to respond, and do not send the same message twice if it is taking a moment to respond.
          The text below will indicate for which task the assistant is available.
          <br><br>
          {{this.condition_text}}
      </v-card-text>
      <v-btn color="success" v-on:click="go_to_condition()">begin</v-btn>
    </v-card>

  </v-container>
</template>

<script>
    import {fetchPost} from "../scripts/fetch-helpers";
    import {mapState} from "vuex";
    import exp from "constants";

    export default {
      name: "experiment-modal",
      data: function () {
        return {

        }
      },
      computed: {
        ...mapState({
          experiment_info: state => state.user.experiment_info,
        }),
        condition_text(){
            if(this.experiment_info === false){
                return 'Loading...';
            }

            // Get task ordering
            let task_order = JSON.parse(this.experiment_info['task_order']);
            let first_task_text = '';
            let second_task_text = '';
            if(task_order[0] === 'T1'){
                first_task_text = 'Overview of a Space Mission';
                second_task_text = 'Space Environments and Orbits';
            }
            else{
                first_task_text = 'Space Environments and Orbits';
                second_task_text = 'Overview of a Space Mission';
            }

            // Get assistant ordering
            let assistant_order = JSON.parse(this.experiment_info['assistant_order']);
            let first_task_assistant = '';
            let second_task_assistant = '';
            if(assistant_order[0] === 1){
                first_task_assistant = 'WILL';
                second_task_assistant = 'WILL NOT';
            }
            else{
                first_task_assistant = 'WILL NOT';
                second_task_assistant = 'WILL';
            }

            // Synthesize experiment text
            let experiment_text = '';
            experiment_text += ('1) The topic of the first task is ' + first_task_text + ' and you ' + first_task_assistant + ' have access to a virtual assistant. ');
            experiment_text += ('2) The topic of the second task is ' + second_task_text + ' and you ' + second_task_assistant + ' have access to a virtual assistant. ');
            experiment_text += 'When you are ready, click the begin button to start the first task.'
            return experiment_text;
        }
      },
      methods: {
        async go_to_condition(){
          await this.$store.dispatch('start_condition');
        },
      }

    }

</script>

<style scoped>

</style>