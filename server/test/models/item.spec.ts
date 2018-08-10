import { expect } from 'chai';
import 'mocha';
import ListItem from '../../src/models/item'

describe('List Item Model', function () {
  it('should be invalid if name is empty', function (done) {
    const item = new ListItem({quantity: 1, author: '5b5ad5d1bae6215a38720547'})
    item.validate((err) => {
      expect(err.errors.name).to.exist
      done()
    })
  })
  it('should be invalid if name is too long', function (done) {
    const item = new ListItem({name: 'An item name very very very very very very very very very very very long', quantity: 1, author: '5b5ad5d1bae6215a38720547'})
    item.validate((err) => {
      expect(err.errors.name).to.exist
      done()
    })
  })
  it('should be invalid if quantity is empty', function (done) {
    const item = new ListItem({name: 'Item', author: '5b5ad5d1bae6215a38720547'})
    item.validate((err) => {
      expect(err.errors.quantity).to.exist
      done()
    })
  })
  it('should be invalid if quantity is not an integer', function (done) {
    const item = new ListItem({name: 'Item', quantity: 'abc', author: '5b5ad5d1bae6215a38720547'})
    item.validate(function (err) {
      expect(err.errors.quantity).to.exist
      const otherItem = new ListItem({name: 'Item', quantity: 3.1415, author: '5b5ad5d1bae6215a38720547'})
      otherItem.validate((err => {
        expect(err.errors.quantity).to.exist
        done()
      }))
    })
  })
  it('should be invalid if quantity is lesser or equal than zero', function (done) {
    const item = new ListItem({name: 'Item', quantity: -6, author: '5b5ad5d1bae6215a38720547'})
    item.validate(function (err) {
      expect(err.errors.quantity).to.exist
      const otherItem = new ListItem({quantity: 0})
      otherItem.validate((err => {
        expect(err.errors.quantity).to.exist
        done()
      }))
    })
  })
  it('should be invalid if author is empty', function (done) {
    const item = new ListItem({name: 'Item', quantity: 1})
    item.validate((err) => {
      expect(err.errors.author).to.exist
      done()
    })
  })
  it('should be valid if everything is OK', function (done) {
    const item = new ListItem({name: 'Tent', quantity: 1, author: '5b5ad5d1bae6215a38720547'})
    item.validate((err) => {
      expect(err).to.be.null
      done()
    })
  })
})
