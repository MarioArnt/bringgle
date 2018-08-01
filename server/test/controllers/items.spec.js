const expect = require('chai').expect
const sinon = require('sinon')

const ItemsController = require('../../src/controllers/items')
const ListItem = require('../../src/models/item')
const errors = require('../../src/constants/errors')

describe('Item Controller', () => {
  describe('Find by ID function', () => {
    beforeEach(() => {
      sinon.stub(ListItem, 'findById')
    })

    afterEach(() => {
      ListItem.findById.restore()
    })

    it('should return list item with the given ID if exists', (done) => {
      const expectedItem = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Tent',
        quantity: 1,
        author: '5b5ad5d1bae6215a38720546',
        responsible: []
      }
      ListItem.findById.yields(null, expectedItem)
      ItemsController.findById(expectedItem._id).then((item) => {
        expect(item).to.deep.equal(expectedItem)
        done()
      })
    })

    it('should return formatted if build flag is set to true', (done) => {
      const expectedItem = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Tent',
        quantity: 1,
        author: '5b5ad5d1bae6215a38720546',
        responsible: []
      }
      ListItem.findById.yields(null, expectedItem)
      ItemsController.findById(expectedItem._id, true).then((item) => {
        expect(item).to.deep.equal(ItemsController.itemBuilder(expectedItem))
        done()
      })
    })

    it('should throw an error if the list does not exist', (done) => {
      ListItem.findById.yields(null, null)
      const id = '5b5ad5d1bae6215a38720548'
      ItemsController.findById(id).then((item) => {}, (err) => {
        expect(err).to.deep.equal(errors.ressourceNotFound({ type: 'item', id }))
        done()
      })
    })
    it('should throw an error the database call failed', (done) => {
      const errDB = {type: 'DB error', msg: 'Something wrong happended'}
      ListItem.findById.yields(errDB, null)
      const id = '5b5ad5d1bae6215a38720548'
      ItemsController.findById(id).then((item) => {}, (err) => {
        expect(err).to.deep.equal(errors.databaseAccess(errDB))
        done()
      })
    })
  })
  describe('Save function', () => {
    let toSave = {}
    beforeEach(() => {
      toSave = new ListItem({
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Tent',
        quantity: 1,
        author: '5b5ad5d1bae6215a38720546',
        responsible: []
      })
      sinon.stub(ListItem.prototype, 'save')
    })

    afterEach(() => {
      ListItem.prototype.save.restore()
    })

    it('should save and return list item', (done) => {
      ListItem.prototype.save.yields(null, toSave)
      ItemsController.save(toSave).then((item) => {
        expect(item).to.deep.equal(toSave)
        done()
      })
    })

    it('should return formatted item if build flag is set to true', (done) => {
      ListItem.prototype.save.yields(null, toSave)
      ItemsController.save(toSave, true).then((item) => {
        expect(item).to.deep.equal(ItemsController.itemBuilder(toSave))
        done()
      })
    })

    it('should throw an error the database call failed', (done) => {
      const errDB = {type: 'DB error', msg: 'Something wrong happened'}
      ListItem.prototype.save.yields(errDB, null)
      toSave = new ListItem({})
      ItemsController.save(toSave).then((item) => {}, (err) => {
        expect(err).to.deep.equal(errors.databaseAccess(errDB))
        done()
      })
    })
  })
  describe('Delete function', () => {
    beforeEach(() => {
      sinon.stub(ListItem, 'findByIdAndRemove')
    })

    afterEach(() => {
      ListItem.findByIdAndRemove.restore()
    })

    it('should return list item with the given ID if exists', (done) => {
      const expectedItem = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Tent',
        quantity: 1,
        author: '5b5ad5d1bae6215a38720546',
        responsible: []
      }
      ListItem.findByIdAndRemove.yields(null, expectedItem)
      ItemsController.delete(expectedItem._id).then((item) => {
        expect(item).to.deep.equal(expectedItem)
        done()
      })
    })

    it('should throw an error the database call failed', (done) => {
      const errDB = {type: 'DB error', msg: 'Something wrong happended'}
      ListItem.findByIdAndRemove.yields(errDB, null)
      const id = '5b5ad5d1bae6215a38720548'
      ItemsController.delete(id).then((item) => {}, (err) => {
        expect(err).to.deep.equal(errors.databaseAccess(errDB))
        done()
      })
    })
  })
})
