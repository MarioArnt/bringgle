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
  describe.skip('POST /api/lists/:listId/items')
  describe.skip('DELETE /api/lists/:listId/items/:itemId')
})
