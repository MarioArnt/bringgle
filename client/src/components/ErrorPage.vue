<template lang="pug">
  .error-page.main-content
    .error-circle.md-elevation-6
      .inner-circle 
        h2.error-status {{ status }}
        h1.error-message {{ message }}
    p(v-for="line in details") {{ line }}
    md-button.md-raised.md-accent(v-on:click='backHome()')
      i.fa.fa-home
      | Go back home
</template>

<script lang="ts">
import Vue from 'vue';
import router from '@/router';

export default Vue.extend({
  name: 'ErrorPage',
  data: function () {
    return {
      details: [],
      message: ''
     }
  },
  props: ['status', 'type'],
  mounted: function() {
    switch(this.status) {
      case 404:
        this.message = !this.type ? 'Not found' : `${this.type} not found`;
        this.details.push('Sorry, it seems that the ressource you are looking for is not available.');
        this.details.push('Either the ressource does not exist anymore, either the URL is mispelled.');
        break;
      default:
        this.message = 'Internal Server Error';
        this.details.push('Sorry, it seems that we are having problems here.');
        this.details.push('This error will automatically be reported. Try refresh this page later.');
        break;
    }
  },
  methods: {
    backHome() {
      router.push('/');
    }
  }
});
</script>

<style lang="scss" scoped>
  .error-page {
    text-align: center;
     .error-circle {
      margin: auto;
      margin-top: 10px;
      margin-bottom: 10px;
      height: 210px;
      width: 210px;
      border-radius: 50%;
      color: white;
      background-color: #7e57c2;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
      .inner-circle {
        text-align: center;
        margin-top: -20px;
        .error-status {
          font-size: 20px;
          line-height: 20px;
          margin-bottom: 0px;
        }
        .error-message {
          font-size: 30px;
          line-height: 30px;
          margin-top: 10px;
        }
      }
    }
  }
</style>
