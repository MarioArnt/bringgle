process.env.NODE_ENV = 'test'

const sinon = require('sinon')
const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const server = require('../../src/index')
const ListsController = require('../../src/controllers/lists')
const errors = require('../../src/constants/errors')
const List = require('../../src/models/list')
const User = require('../../src/models/user')
const UsersController = require('../../src/controllers/users')
chai.use(chaiHttp)

describe('List Controller', () => {
  describe('POST /api/lists', () => {
    let requester
    beforeEach(() => {
      requester = chai.request(server).keepOpen()
      sinon.stub(List.prototype, 'save')
      sinon.stub(User.prototype, 'save')
      sinon.stub(User, 'findById')
    })
    afterEach(() => {
      List.prototype.save.restore()
      User.prototype.save.restore()
      User.findById.restore()
      requester.close()
    })
    it('should return error if list name is not defined', (done) => {
      const error = errors.missingRequiredField('listName')
      const listData = {}
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return error if list name is an empty string', (done) => {
      const error = errors.missingRequiredField('listName')
      const listData = {listName: ''}
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return error if user id is not given and user email is not defined', (done) => {
      const error = errors.missingRequiredField('userEmail')
      const listData = {
        listName: 'Awesome List',
        displayName: 'John'
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return error if user id is not given and user email is an empty string', (done) => {
      const error = errors.missingRequiredField('userEmail')
      const listData = {
        listName: 'Awesome List',
        displayName: 'John',
        userEmail: ''
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return error if user id is not given and user name is not defined', (done) => {
      const error = errors.missingRequiredField('displayName')
      const listData = {
        listName: 'Awesome List',
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return error if user id is not given and user name is an empty string', (done) => {
      const error = errors.missingRequiredField('displayName')
      const listData = {
        listName: 'Awesome List',
        displayName: ''
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should create list with current user and return it if user id is given', (done) => {
      const listData = {
        listName: 'Awesome list',
        userId: '5b5ad5d1bae6215a38720546'
      }
      const savedList = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720546',
        attendees: [],
        items: []
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedResult = {
        id: '5b5ad5d1bae6215a38720547',
        owner: UsersController.userBuilder(userData)
      }
      List.prototype.save.yields(null, savedList)
      User.findById.yields(null, userData)

      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          done()
        })
    })
    it('should create list and user and return it if user id is not given', (done) => {
      const listData = {
        listName: 'Awesome list',
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const savedList = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720546',
        attendees: [],
        items: []
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedResult = {
        id: '5b5ad5d1bae6215a38720547',
        owner: UsersController.userBuilder(userData)
      }
      List.prototype.save.yields(null, savedList)
      User.prototype.save.yields(null, userData)

      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          done()
        })
    })
    it('should create list and user and return it if user id is given but not found in database (case required fields OK)', (done) => {
      const listData = {
        listName: 'Awesome list',
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const savedList = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720546',
        attendees: [],
        items: []
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedResult = {
        id: '5b5ad5d1bae6215a38720547',
        owner: UsersController.userBuilder(userData)
      }
      List.prototype.save.yields(null, savedList)
      User.findById.yields(null, null)
      User.prototype.save.yields(null, userData)

      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          done()
        })
    })
    it('should throw an error if user id is given but not found in database (case missing required fields)', (done) => {
      const listData = {
        listName: 'Awesome list',
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John'
      }
      const savedList = {
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720546',
        attendees: [],
        items: []
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedError = errors.missingRequiredField('userEmail')
      List.prototype.save.yields(null, savedList)
      User.findById.yields(null, null)
      User.prototype.save.yields(null, userData)
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should throw an error if database operation save user fails', (done) => {
      const listData = {
        listName: 'Awesome list',
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John',
        userEmail: 'john@doe.com'
      }
      const errorDB = {type: 'DB', details: 'Mocked failure'}
      const expectedError = errors.databaseAccess(errorDB)
      User.findById.yields(null, null)
      User.prototype.save.yields(errorDB, null)
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should throw an error if database operation find user fails', (done) => {
      const listData = {
        listName: 'Awesome list',
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John',
        email: 'john@doe.com'
      }
      const errorDB = {type: 'DB', details: 'Mocked failure'}
      const expectedError = errors.databaseAccess(errorDB)
      User.findById.yields(errorDB, null)
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should throw an error if database operation save list fails', (done) => {
      const listData = {
        listName: 'Awesome list',
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John'
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const errorDB = {type: 'DB', details: 'Mocked failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.prototype.save.yields(errorDB, null)
      User.findById.yields(null, userData)
      requester
        .post('/api/lists')
        .send(listData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
  })
  describe('GET /api/lists/:id')
  describe('POST /api/lists/:id/join')
  describe('PATCH /api/lists/:id/items/:itemId')
  describe('DELETE /api/lists/:listId/items/:itemId')
})
