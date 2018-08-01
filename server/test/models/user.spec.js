const expect = require('chai').expect
const User = require('../../src/models/user')

describe('User Model', function () {
  it('should be invalid if name is empty', (done) => {
    const user = new User()
    user.validate((err) => {
      expect(err.errors.name).to.exist
      done()
    })
  })
  it('should be invalid if email is empty', (done) => {
    const user = new User()
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
