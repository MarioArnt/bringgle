<template lang="pug">
  nav
    div.nav-wrapper
      router-link.brand-logo(to="/") Bringgle
      ul#nav-mobile.right
        li(v-if="user")
          i.fa.fa-user
          | {{ user.name }}
        li
          router-link(to="/create")
            i.fa.fa-plus
            | Create list
</template>

<script>
export default {
  name: 'Header',
  data: function () {
    return {
      user: {}
    }
  },
  mounted: function () {
    this.user = this.$store.state.currentUser
  }
}
</script>

<style scoped>
  nav {
    padding: 0 10px;
  }
</style>
