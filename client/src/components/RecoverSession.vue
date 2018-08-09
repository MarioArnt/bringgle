<template lang="pug">
  #session-recovery
    h1 Session recovery
    p A user already attend the list {{ decodeURIComponent(listName) }} with this email address.
    p If it was you, it seems that you have lost your session.
    p An email have been sent to {{ decodeURIComponent(email) }}. It contains a link that will automatically reconnect you.
</template>

<script lang="ts">
import CookiesUtils from '@/cookies'
import router from '@/router';
import Logger from 'js-logger';

export default {
  name: 'RecoverSession',
  props: ['userId', 'listName', 'email', 'userName'],
  mounted: function () {
    if(!!this.userId) {
      Logger.info('Recovery session for user ' + this.userId)
      CookiesUtils.setUser({id: decodeURIComponent(this.userId), name: decodeURIComponent(this.userName), email: decodeURIComponent(this.email)});
      router.push('/list/' + this.$route.params.id);
    }
  },
}
</script>

<style scoped>
</style>
