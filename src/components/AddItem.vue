<template lang="pug">
  #new-item.md-layout.md-alignment-center
    #qty
      md-field(:class="{'md-invalid': errors.has('quantity')}")
        label Quantity
        md-input(v-validate="'required|numeric|between:1,99'" name="quantity" v-model="$store.state.newItem.quantity" type="number")
        span.md-error {{ errors.first('quantity') }}
    #new-item
      md-field(:class="{'md-invalid': errors.has('item name')}")
        label Item
        md-input(v-validate="'required'" name="item name" v-model="$store.state.newItem.name" v-on:keyup.enter="submitItem()")
        span.md-error {{ errors.first('item name') }}
    #add-item
      md-button.md-icon-button(v-on:click="submitItem()")
        i.fa.fa-plus
</template>

<script>
import ItemsController from '@/controllers/items'

export default {
  data: function () {
    return {}
  },
  name: 'AddItem',
  methods: {
    submitItem: function () {
      this.$validator.validate().then((valid) => {
        if (valid) ItemsController.addItem()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#new-item {
  flex-wrap: nowrap;
  #qty {
    width: 70px;
  }
  #new-item {
    flex: 1;
    padding-left: 10px
  }
  #add-item {
    width: 40px;
    button {
      margin: 0
    }
  }
}
</style>
