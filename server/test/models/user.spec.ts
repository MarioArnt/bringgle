import { expect } from 'chai';
import 'mocha';
import User from '../../src/models/user'

describe('User Model', function () {
  it('should be invalid if name is empty', (done) => {
    const user = new User({email: 'john.doe@email.com'})
    user.validate((err) => {
      expect(err.errors.name).to.exist
      done()
    })
  })
  it('should be invalid if name is too long', (done) => {
    const user = new User({name:'Juan-Carlos de Olivera y de Bourbon y Sanchez', email: 'john.doe@email.com'})
    user.validate((err) => {
      expect(err.errors.name).to.exist
      done()
    })
  })
  it('should be invalid if email is empty', (done) => {
    const user = new User({name: 'John Doe'})
    user.validate((err) => {
      expect(err.errors.email).to.exist
      done()
    })
  })
  it('should be valid if everything is OK', (done) => {
    const user = new User({name: 'John Doe', email: 'john.doe@email.com'})
    user.validate((err) => {
      expect(err).to.be.null
      done()
    })
  })
})
