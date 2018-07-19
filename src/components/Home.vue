<template lang="pug">
  div#home
    h1 Easily create shareable lists of what to bring
    h2 How it works ?
    h3 Create a new list
    h3 Add items
    h3 Invite people
    h3 Check what you can bring
    h3 Ask for a sum-up
    router-link(to="/create")
      md-button.md-raised.md-accent
        i.fa.fa-plus
        | Create new list
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
