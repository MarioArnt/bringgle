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
      a.waves-effect.waves-light.btn
        i.fa.fa-plus
        | Create new list
</template>

<script>
export default {
  name: 'Home'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
</style>
