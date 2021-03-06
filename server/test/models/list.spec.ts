import { expect } from 'chai';
import 'mocha';
import List from '../../src/models/list'

describe('List Model', function () {
  it('should be invalid if title is empty', (done) => {
    const list = new List({owner: '5b5ad5d1bae6215a38720547'})
    list.validate((err) => {
      expect(err.errors.title).to.exist
      done()
    })
  })
  it('should be invalid if title is too long', (done) => {
    const list = new List({title: 'A very very very vrey very long list name', owner: '5b5ad5d1bae6215a38720547'})
    list.validate((err) => {
      expect(err.errors.title).to.exist
      done()
    })
  })
  it('should be invalid if owner is empty', (done) => {
    const list = new List({title: 'Awesome List'})
    list.validate((err) => {
      expect(err.errors.owner).to.exist
      done()
    })
  })
  it('should be invalid if owner is not an object ID', (done) => {
    const list = new List({title: 'Awesome List', owner: 'not an object ID'})
    list.validate((err) => {
      expect(err.errors.owner).to.exist
      done()
    })
  })
  it('should be valid if everything is OK', (done) => {
    const list = new List({title: 'Awesome List', owner: '5b5ad5d1bae6215a38720547'})
    list.validate((err) => {
      expect(err).to.be.null
      done()
    })
  })
})
