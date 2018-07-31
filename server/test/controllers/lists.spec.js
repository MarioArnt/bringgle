/*eslint-disable */
process.env.NODE_ENV = 'test'

const sinon = require('sinon')
const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const assert = chai.assert
const server = require('../../src/index')
const errors = require('../../src/constants/errors')
const List = require('../../src/models/list')
const User = require('../../src/models/user')
const ListItem = require('../../src/models/item')
const SocketsUtils = server.SocketsUtils
const ListsController = require('../../src/controllers/lists')(SocketsUtils)
const UsersController = require('../../src/controllers/users')
const ItemsController = require('../../src/controllers/items')

chai.use(chaiHttp)

describe('List Controller', () => {
  describe('POST /api/lists', () => {
    let requester
    beforeEach(() => {
      requester = chai.request(server.app).keepOpen()
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
    it('should return 400 if list name is not defined', (done) => {
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
    it('should return 400 if list name is an empty string', (done) => {
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
    it('should return 400 if user id is not given and user email is not defined', (done) => {
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
    it('should return 400 if user id is not given and user email is an empty string', (done) => {
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
    it('should return 400 if user id is not given and user name is not defined', (done) => {
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
    it('should return 400 if user id is not given and user name is an empty string', (done) => {
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
    it('should return 200 and create list with current user and return it if user id is given', (done) => {
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
    it('should return 200 and create list and user and return it if user id is not given', (done) => {
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
    it('should return 200 and create list and user and return it if user id is given but not found in database', (done) => {
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
    it('should return 400 if user id is given but not found in database and missing display name or email', (done) => {
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
    it('should return 500 if database operation save user fails', (done) => {
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
    it('should return 500 if database operation find user fails', (done) => {
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
    it('should return 500 if database operation save list fails', (done) => {
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
  describe('GET /api/lists/:id', () => {
    let requester
    beforeEach(() => {
      requester = chai.request(server.app).keepOpen()
      sinon.stub(User, 'findById')
      sinon.stub(List, 'findById')
      sinon.stub(ListItem, 'findById')
    })
    afterEach(() => {
      List.findById.restore()
      ListItem.findById.restore()
      User.findById.restore()
      requester.close()
    })
    it('should return 400 if ID is null', (done) => {
      const id = null
      const expectedError = errors.noId('list_id')
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if ID is undefined', (done) => {
      const id = undefined
      const expectedError = errors.noId('list_id')
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if find list by ID query fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const dbError = { type: 'DB', details: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(dbError)
      List.findById.yields(dbError, null)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if list with the given ID does not exist', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const expectedError = errors.ressourceNotFound({ type: 'list', id })
      List.findById.yields(null, null)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if find owner query fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const dbError = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(dbError)
      const list = {
        id: '5b5c39c618774c33b4b0a010',
        name: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: [],
        items: []
      }
      List.findById.yields(null, list)
      User.findById.yields(dbError, null)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if owner does not exist', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const list = {
        _id: '5b5c39c618774c33b4b0a010',
        name: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: [],
        items: []
      }
      List.findById.yields(null, list)
      User.findById.yields(null, null)
      const expectedError = errors.ressourceNotFound({ type: 'user', id: list.owner })
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if one of the queries that fetch attendees fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const dbError = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(dbError)
      const list = {
        id: '5b5c39c618774c33b4b0a010',
        name: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a013', '5b5c39c618774c33b4b0a014'],
        items: []
      }
      List.findById.yields(null, list)
      User.findById.onCall(0).yields(null, {_id: '5b5c39c618774c33b4b0a011', name: 'Owner', email: 'owner@list.org'})
      User.findById.onCall(1).yields(null, {_id: '5b5c39c618774c33b4b0a012', name: 'Attendee #1', email: 'attendee1@list.org'})
      User.findById.onCall(2).yields(dbError, null)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if one of the attendees does not exist', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const list = {
        id: '5b5c39c618774c33b4b0a010',
        name: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a013', '5b5c39c618774c33b4b0a014'],
        items: []
      }
      List.findById.yields(null, list)
      User.findById.onCall(0).yields(null, {_id: '5b5c39c618774c33b4b0a011', name: 'Owner', email: 'owner@list.org'})
      User.findById.onCall(1).yields(null, {_id: '5b5c39c618774c33b4b0a012', name: 'Attendee #1', email: 'attendee1@list.org'})
      User.findById.onCall(2).yields(null, null)
      const expectedError = errors.ressourceNotFound({type: 'user', id: list.attendees[1]})
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if one of the queries that fetch item fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const list = {
        id: '5b5c39c618774c33b4b0a010',
        name: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: ['5b5c39c618774c33b4b0a012'],
        items: ['5b5c39c618774c33b4b0a015', '5b5c39c618774c33b4b0a016']
      }
      const dbError = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(dbError)
      List.findById.yields(null, list)
      User.findById.onCall(0).yields(null, {_id: '5b5c39c618774c33b4b0a011', name: 'Owner', email: 'owner@list.org'})
      User.findById.onCall(1).yields(null, {_id: '5b5c39c618774c33b4b0a012', name: 'Attendee #1', email: 'attendee1@list.org'})
      ListItem.findById.onCall(0).yields(dbError, null)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if one of the items does not exist', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const list = {
        id: '5b5c39c618774c33b4b0a010',
        name: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: ['5b5c39c618774c33b4b0a012'],
        items: ['5b5c39c618774c33b4b0a015', '5b5c39c618774c33b4b0a016']
      }
      const expectedError = errors.ressourceNotFound({type: 'item', id: list.items[0]})
      List.findById.yields(null, list)
      User.findById.onCall(0).yields(null, {_id: '5b5c39c618774c33b4b0a011', name: 'Owner', email: 'owner@list.org'})
      User.findById.onCall(1).yields(null, {_id: '5b5c39c618774c33b4b0a012', name: 'Attendee #1', email: 'attendee1@list.org'})
      ListItem.findById.onCall(0).yields(null, null)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 200 if list with given ID exists and every database requests suceeds', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const list = {
        _id: '5b5c39c618774c33b4b0a010',
        title: 'Awesome List',
        owner: '5b5c39c618774c33b4b0a011',
        attendees: ['5b5c39c618774c33b4b0a011', '5b5c39c618774c33b4b0a012'],
        items: ['5b5c39c618774c33b4b0a015', '5b5c39c618774c33b4b0a016']
      }
      const owner = {_id: '5b5c39c618774c33b4b0a011', name: 'Owner', email: 'owner@list.org'}
      const attendee = {_id: '5b5c39c618774c33b4b0a012', name: 'Attendee #1', email: 'attendee1@list.org'}
      const item1 = {_id: '5b5c39c618774c33b4b0a015', quantity: 1, name: 'Triceratops', responsible: ['5b5c39c618774c33b4b0a011']}
      const item2 = {_id: '5b5c39c618774c33b4b0a016', quantity: 2, name: 'Pterodactyl', responsible: []}
      List.findById.yields(null, list)
      User.findById.onCall(0).yields(null, owner)
      User.findById.onCall(1).yields(null, owner)
      User.findById.onCall(2).yields(null, attendee)
      ListItem.findById.onCall(0).yields(null, item1)
      ListItem.findById.onCall(1).yields(null, item2)
      requester
        .get(`/api/lists/${id}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.eql(ListsController.listBuilder(list, UsersController.userBuilder(owner), [UsersController.userBuilder(owner), UsersController.userBuilder(attendee)], [ItemsController.itemBuilder(item1), ItemsController.itemBuilder(item2)]))
          done()
        })
    })
  })
  describe('POST /api/lists/:id/join', () => {
    let requester
    let spy
    beforeEach(() => {
      requester = chai.request(server.app).keepOpen()
      sinon.stub(User, 'findById')
      sinon.stub(List, 'findById')
      sinon.stub(User.prototype, 'save')
      sinon.stub(List.prototype, 'save')
      spy = sinon.spy(SocketsUtils, 'joinList')
    })
    afterEach(() => {
      List.prototype.save.restore()
      User.findById.restore()
      List.findById.restore()
      User.prototype.save.restore()
      SocketsUtils.joinList.restore()
      requester.close()
    })
    it('should return 400 if ID is null', (done) => {
      const id = null
      const expectedError = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/join`)
        .send({})
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if ID is undefined', (done) => {
      const id = undefined
      const expectedError = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/join`)
        .send({})
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user id is not given and user email is not defined', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const error = errors.missingRequiredField('userEmail')
      const joinData = {
        displayName: 'John'
      }
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user email is an empty string', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const error = errors.missingRequiredField('userEmail')
      const joinData = {
        displayName: 'John',
        userEmail: ''
      }
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user name is not defined', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const error = errors.missingRequiredField('displayName')
      requester
        .post(`/api/lists/${id}/join`)
        .send({})
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user name is an empty string', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const error = errors.missingRequiredField('displayName')
      const joinData = {
        displayName: ''
      }
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 200 and join list with current user if user id is given', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        userId: '5b5ad5d1bae6215a38720546'
      }
      const list = new List({
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720544',
        attendees: ['5b5ad5d1bae6215a38720544'],
        items: []
      })
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedResult = {
        listId: id,
        attendee: UsersController.userBuilder(userData)
      }
      User.findById.yields(null, userData)
      List.findById.yields(null, list)
      List.prototype.save.yields(null, { _id: id })
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          spy.calledOnce.should.be.eql(true)
          spy.calledWith(id, UsersController.userBuilder(userData)).should.be.eql(true)
          done()
        })
    })
    it('should return 200 and create user and join list if user id is not given', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const list = new List({
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720544',
        attendees: ['5b5ad5d1bae6215a38720544'],
        items: []
      })
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedResult = {
        listId: id,
        attendee: UsersController.userBuilder(userData)
      }
      User.prototype.save.yields(null, userData)
      List.findById.yields(null, list)
      List.prototype.save.yields(null, { _id: id })
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          spy.calledOnce.should.be.eql(true)
          spy.calledWith(id, UsersController.userBuilder(userData)).should.be.eql(true)
          done()
        })
    })
    it('should return 200 and create user and join list if user id is given but not found in database', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const list = new List({
        _id: '5b5ad5d1bae6215a38720547',
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720544',
        attendees: ['5b5ad5d1bae6215a38720544'],
        items: []
      })
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedResult = {
        listId: id,
        attendee: UsersController.userBuilder(userData)
      }
      User.findById.yields(null, null)
      User.prototype.save.yields(null, userData)
      List.findById.yields(null, list)
      List.prototype.save.yields(null, { _id: id })
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          spy.calledOnce.should.be.eql(true)
          spy.calledWith(id, UsersController.userBuilder(userData)).should.be.eql(true)
          done()
        })
    })
    it('should return 400 if user id is given but not found in database and missing display name or email', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John Doe'
      }
      User.findById.yields(null, null)
      const expectedError = errors.missingRequiredField('userEmail')
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user already attend the list', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const list = {
        _id: id,
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720544',
        attendees: ['5b5ad5d1bae6215a38720544', '5b5ad5d1bae6215a38720546'],
        items: []
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const expectedError = errors.userAlreadyInList(list._id, userData._id)
      User.findById.yields(null, null)
      User.prototype.save.yields(null, userData)
      List.findById.yields(null, list)
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if database operation save user fails', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const errorDB = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(errorDB)
      User.prototype.save.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if database operation find user fails', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        userId: '5b5ad5d1bae6215a38720546',
        userEmail: 'john@doe.com'
      }
      const errorDB = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(errorDB)
      User.findById.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if database operation save list fails', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        userId: '5b5ad5d1bae6215a38720546',
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const list = new List({
        _id: id,
        name: 'Awesome List',
        owner: '5b5ad5d1bae6215a38720544',
        attendees: ['5b5ad5d1bae6215a38720544, 5b5ad5d1bae6215a38720546'],
        items: []
      })
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const errorDB = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(errorDB)
      User.findById.yields(null, null)
      User.prototype.save.yields(null, userData)
      List.findById.yields(null, list)
      List.prototype.save.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if database operation find list fails', (done) => {
      const id = '5b5ad5d1bae6215a38720547'
      const joinData = {
        displayName: 'John Doe',
        userEmail: 'john@doe.com'
      }
      const userData = {
        _id: '5b5ad5d1bae6215a38720546',
        name: 'John Doe',
        email: 'john@doe.com'
      }
      const errorDB = { type: 'DB', details: 'Mocked DB failure' }
      const expectedError = errors.databaseAccess(errorDB)
      User.prototype.save.yields(null, userData)
      List.findById.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
  })
  describe.skip('PATCH /api/lists/:id/items/:itemId')
  describe('POST /api/lists/:listId/items', () => {
    let requester
    let spy
    beforeEach(() => {
      requester = chai.request(server.app).keepOpen()
      sinon.stub(User, 'findById')
      sinon.stub(List, 'findById')
      sinon.stub(List.prototype, 'save')
      sinon.stub(ListItem.prototype, 'save')
      spy = sinon.spy(SocketsUtils, 'itemAdded')
    })
    afterEach(() => {
      User.findById.restore()
      List.findById.restore()
      List.prototype.save.restore()
      ListItem.prototype.save.restore()
      SocketsUtils.itemAdded.restore()
      requester.close()
    })
    it('should return 400 if list ID is null', (done) => {
      const id = null
      const expectedError = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/items`)
        .send({})
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if list ID undefined', (done) => {
      const id = undefined
      const expectedError = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/items`)
        .send({})
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item name is missing', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {author: '5b5c39c618774c33b4b0a011', quantity: 1}
      const expectedError = errors.missingRequiredField('name')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item name is an empty string', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: '', author: '5b5c39c618774c33b4b0a011', quantity: 1}
      const expectedError = errors.missingRequiredField('name')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item author is missing', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', quantity: 1}
      const expectedError = errors.missingRequiredField('author')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item author is an empty string', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '', quantity: 1}
      const expectedError = errors.missingRequiredField('author')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is missing', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011'}
      const expectedError = errors.missingRequiredField('quantity')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is not a number', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 'I am not a number!'}
      const expectedError = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is a floating number', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 3.14}
      const expectedError = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is greater than 99', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 20098}
      const expectedError = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is lesser than 1', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: -5}
      const expectedError = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if list does not exist in database', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const expectedError = errors.ressourceNotFound({ type: 'list', id })
      List.findById.yields(null, null)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if user does not exist in database', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const addItemData = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const list = {}
      const expectedError = errors.ressourceNotFound({ type: 'user', id: addItemData.author })
      List.findById.yields(null, list)
      User.findById.yields(null, null)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 401 if user is not an attendee of the list', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const data = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const list = {name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a013'], items: []}
      const user = {_id: data.author, name: 'John Doe', email: 'john@doe.com'}
      const expectedError = errors.notAuthorized(user._id, 'add item')
      List.findById.yields(null, list)
      User.findById.yields(null, user)
      requester
        .post(`/api/lists/${id}/items`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if find list by id fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const data = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/items`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if find user by id fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const data = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const list = new List({_id: '5b5c39c618774c33b4b0a018', name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a011'], items: []})
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      User.findById.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/items`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if save item fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const data = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const list = new List({_id: '5b5c39c618774c33b4b0a018', name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a011'], items: []})
      const user = {_id: data.author, name: 'John Doe', email: 'john@doe.com'}
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      User.findById.yields(null, user)
      ListItem.prototype.save.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/items`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if save list fails', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const data = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const list = new List({_id: '5b5c39c618774c33b4b0a018', name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a011'], items: []})
      const user = {_id: data.author, name: 'John Doe', email: 'john@doe.com'}
      const item = {_id: '5b5c39c618774c33b4b0a054', name: data.name, quantity: data.quantity, responsible: []}
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      User.findById.yields(null, user)
      ListItem.prototype.save.yields(null, item)
      List.prototype.save.yields(errorDB, null)
      requester
        .post(`/api/lists/${id}/items`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 200 if request parameters are correct and database operations succeed', (done) => {
      const id = '5b5c39c618774c33b4b0a010'
      const data = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const list = new List({_id: '5b5c39c618774c33b4b0a018', name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a011'], items: []})
      const user = {_id: data.author, name: 'John Doe', email: 'john@doe.com'}
      const item = {_id: '5b5c39c618774c33b4b0a054', name: data.name, quantity: data.quantity, responsible: []}
      List.findById.yields(null, list)
      User.findById.yields(null, user)
      ListItem.prototype.save.yields(null, item)
      List.prototype.save.yields(null, list)
      requester
        .post(`/api/lists/${id}/items`)
        .send(data)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.eql(item)
          spy.calledOnce.should.be.eql(true)
          spy.calledWith(list._id, item).should.be.eql(true)
          done()
        })
    })
  })
  describe('DELETE /api/lists/:listId/items/:itemId', () => {
    let requester
    let spy
    beforeEach(() => {
      requester = chai.request(server.app).keepOpen()
      sinon.stub(User, 'findById')
      sinon.stub(List, 'findById')
      sinon.stub(ListItem, 'findById')
      sinon.stub(ListItem, 'findByIdAndRemove')
      sinon.stub(List.prototype, 'update')
      spy = sinon.spy(SocketsUtils, 'itemRemoved')
    })
    afterEach(() => {
      User.findById.restore()
      List.findById.restore()
      ListItem.findById.restore()
      ListItem.findByIdAndRemove.restore()
      List.prototype.update.restore()
      SocketsUtils.itemRemoved.restore()
      requester.close()
    })
    it('should return 400 if list ID is null', (done) => {
      const listId = null
      const itemId = '5b5c39c618774c33b4b0a010'
      const expectedError = errors.noId('list')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if list ID is undefined', (done) => {
      const listId = undefined
      const itemId = '5b5c39c618774c33b4b0a010'
      const expectedError = errors.noId('list')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item ID is null', (done) => {
      const itemId = null
      const listId = '5b5c39c618774c33b4b0a010'
      const expectedError = errors.noId('item')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item ID is undefined', (done) => {
      const itemId = undefined
      const listId = '5b5c39c618774c33b4b0a010'
      const expectedError = errors.noId('item')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID is undefined', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const expectedError = errors.noId('user')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID is an empty string', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = ''
      const expectedError = errors.noId('user')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID is null', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = null
      const expectedError = errors.noId('user')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if list does not exists', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a012'
      const expectedError = errors.ressourceNotFound({ type: 'list', id: listId })
      List.findById.yields(null, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if item does not exists', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a012'
      const list = {}
      const expectedError = errors.ressourceNotFound({ type: 'item', id: itemId })
      List.findById.yields(null, list)
      ListItem.findById.yields(null, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if user does not exists', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a012'
      const list = {}
      const item = {}
      const expectedError = errors.ressourceNotFound({ type: 'user', id: userId })
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(null, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 401 if user does not attend the list', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', '5b5c39c618774c33b4b0a011'], items: []})
      const user = {_id: userId, name: 'John Doe', email: 'john@doe.com'}
      const item = new ListItem({_id: itemId, name: 'Shuriken', quantity: '32', responsible: []})
      const expectedError = errors.notAuthorized(userId , 'delete item')
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(null, user)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item is not in list', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', userId], items: []})
      const user = {_id: userId, name: 'John Doe', email: 'john@doe.com'}
      const item = new ListItem({_id: itemId, name: 'Shuriken', quantity: '32', responsible: []})
      const expectedError = errors.itemNotInList(listId , itemId)
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(null, user)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 500 if find list by id fails', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(errorDB, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if find user by id fails', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', userId], items: [itemId]})
      const item = new ListItem({_id: itemId, name: 'Shuriken', quantity: '32', responsible: []})
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(errorDB, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if find item by id fails', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', userId], items: [itemId]})
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      ListItem.findById.yields(errorDB, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if delete item by id fails', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', userId], items: [itemId]})
      const user = {_id: userId, name: 'John Doe', email: 'john@doe.com'}
      const item = new ListItem({_id: itemId, name: 'Shuriken', quantity: '32', responsible: []})
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(null, user)
      List.prototype.update.yields(null, null)
      ListItem.findByIdAndRemove.yields(errorDB, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 500 if save list fails', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', userId], items: [itemId]})
      const user = {_id: userId, name: 'John Doe', email: 'john@doe.com'}
      const item = new ListItem({_id: itemId, name: 'Shuriken', quantity: '32', responsible: []})
      const errorDB = {type: 'DB', msg: 'Mocked DB failure'}
      const expectedError = errors.databaseAccess(errorDB)
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(null, user)
      List.prototype.update.yields(errorDB, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          spy.calledOnce.should.be.eql(false)
          done()
        })
    })
    it('should return 200 if everything is OK', (done) => {
      const itemId = '5b5c39c618774c33b4b0a011'
      const listId = '5b5c39c618774c33b4b0a010'
      const userId = '5b5c39c618774c33b4b0a045'
      const list = new List({_id: listId, name: 'Awesome List', owner: '5b5c39c618774c33b4b0a012', attendees: ['5b5c39c618774c33b4b0a012', userId], items: [itemId]})
      const user = {_id: userId, name: 'John Doe', email: 'john@doe.com'}
      const item = new ListItem({_id: itemId, name: 'Shuriken', quantity: '32', responsible: []})
      const expectedResult = { id: itemId }
      List.findById.yields(null, list)
      ListItem.findById.yields(null, item)
      User.findById.yields(null, user)
      ListItem.findByIdAndRemove.yields(null, item)
      List.prototype.update.yields(null, null)
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.eql(expectedResult)
          spy.calledOnce.should.be.eql(true)
          spy.calledWith(listId, itemId).should.be.eql(true)
          done()
        })
    })
  })
})
/* eslint-enable */
