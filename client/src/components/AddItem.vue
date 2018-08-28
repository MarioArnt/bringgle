<template lang="pug">
  #new-item.md-layout.md-alignment-center
    #qty
      md-field(:class="{'md-invalid': errors.has('quantity')}")
        label Quantity
        md-input(v-validate="'required|numeric|between:1,99'" name="quantity" v-model="quantity" type="number" v-on:keyup.enter="submitItem()")
        span.md-error {{ errors.first('quantity') }}
    #new-item
      md-field(:class="{'md-invalid': errors.has('item name')}")
        label Item
        md-input(v-validate="'required'" name="item name" v-model="name" v-on:keyup.enter="submitItem()" maxlength="50")
        span.md-error {{ errors.first('item name') }}
    #add-item
      md-button.md-icon-button(v-on:click="submitItem()")
        i.fa.fa-plus
</template>

<script lang="ts">
import ItemsController from '@/controllers/items'
import Logger from 'js-logger'

export default {
  props: ['itemId', 'itemQuantity', 'itemName'],
  data: function () {
    return {
      quantity: 1,
      nam: '',
      edit: true
    }
  },
  name: 'AddItem',
  created: function () {
    if (this.itemQuantity && this.itemName) {
      this.edit = true
      this.quantity = this.itemQuantity
      this.name = this.itemName
    } else {
      this.edit = false
      this.quantity = 1
      this.name = ''
    }
  },
  methods: {
    submitItem: function () {
      this.$validator.validate().then((valid) => {
        if (valid && !this.edit) {
          Logger.debug('Creating new item')
          ItemsController.addItem(this.quantity, this.name).then(() => {
            this.quantity = 1
            this.name = ''
            this.$forceUpdate()
            Logger.debug('Item added', this)
          }, (err) => {
            this.$toastr.e(err.msg);
          })
        } else if (valid && this.edit) {
          Logger.debug('Updating existing item')
          const hasChanged = this.quantity !== this.itemQuantity || this.name !== this.itemName
          if (!hasChanged) {
            Logger.debug('Nothing changed')
            this.$store.commit('disableEditionState', this.itemId)
          } else {
            ItemsController.updateItem(this.itemId, this.quantity, this.name).then(() => {
              Logger.debug('Item updated')
            })
          }
        }
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
