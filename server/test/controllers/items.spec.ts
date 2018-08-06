process.env.NODE_ENV = 'test'
import chai, { expect } from 'chai';
import TestFactory from '../factory';
import { ItemModel } from '../../src/models/item'
import ItemsController from '../../src/controllers/items'
import Errors from '../../src/constants/errors'
import 'mocha'

const should = chai.should()

describe('Item Controller', () => {
  describe('Find by ID function', () => {
    let testFactory: TestFactory;
    before((done) => {
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    it('should return list item with the given ID if exists', (done) => {
      const expectedItem: ItemModel = testFactory.getRandomItem()
      ItemsController.findById(expectedItem._id).then((item: ItemModel) => {
        item._id.should.be.eql(expectedItem._id)
        item.name.should.be.eql(expectedItem.name)
        item.quantity.should.be.eql(expectedItem.quantity)
        item.responsible.should.be.eql(expectedItem.responsible)
        item.created.should.be.eql(expectedItem.created)
        done()
      })
    })

    it('should return formatted if build flag is set to true', (done) => {
      const expectedItem: ItemModel = testFactory.getRandomItem()
      ItemsController.findById(expectedItem._id, true).then((item) => {
        item.id.should.be.eql(expectedItem._id)
        item.name.should.be.eql(expectedItem.name)
        item.quantity.should.be.eql(expectedItem.quantity)
        item.responsible.should.exist
        item.created.should.be.eql(expectedItem.created)
        done()
      })
    })

    it('should throw an error if the list does not exist', (done) => {
      const id = '5b5ad5d1bae6215a38720548'
      ItemsController.findById(id).then((item) => {}, (err) => {
        expect(err).to.deep.equal(Errors.ressourceNotFound({ type: 'item', id }))
        done()
      })
    })
    it.skip('should throw an error the database call failed')
    })
    describe('Save function', () => {
      let testFactory: TestFactory;
      before((done) => {
        testFactory = new TestFactory()
        testFactory.connectDatabase().then(() => {
          testFactory.createUsers().then(() => {
            done()
          })
        })
      })
  
      it('should save and return list item', (done) => {
        const toSave: ItemModel = testFactory.createItem()
        ItemsController.save(toSave).then((item) => {
          expect(item).to.deep.equal(toSave)
          done()
        })
      })
  
      it('should return formatted item if build flag is set to true', (done) => {
        const toSave: ItemModel = testFactory.createItem()
        ItemsController.save(toSave, true).then((item) => {
          expect(item).to.deep.equal(ItemsController.itemBuilder(toSave))
          done()
        })
      })
  
      it('should throw an error the database call failed', (done) => {
        const toSave: any = testFactory.createItem()
        toSave.quantity = -3.287
        ItemsController.save(toSave).then((item) => {}, (err) => {
          expect(err.code).to.deep.equal(Errors.code.DB_ACCESS)
          done()
        })
      })
    })
    describe('Delete function', () => {
      let testFactory: TestFactory;
      before((done) => {
        testFactory = new TestFactory()
        testFactory.connectDatabase().then(() => {
          testFactory.createTestData().then(() => {
            done()
          })
        })
      })
      it('should delete list item with the given ID if exists', (done) => {
        const expectedItem: ItemModel = testFactory.getRandomItem()
        ItemsController.delete(expectedItem._id).then((item: ItemModel) => {
          item._id.should.be.eql(expectedItem._id)
          ItemsController.findById(expectedItem._id).then((it) => {}, (err) => {
            expect(err).to.deep.equal(Errors.ressourceNotFound({ type: 'item', id: expectedItem._id }))
            done()
          })
        })
      })
      it.skip('should throw an error the database call failed')
    })
  })
