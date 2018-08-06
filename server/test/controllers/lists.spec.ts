process.env.NODE_ENV = 'test'
import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import express from'express'
import { BringgleServer } from '../../src/server'
import errors, { ErrorModel } from '../../src/constants/errors'
import actions from '../../src/constants/actions'
import { ListModelLazy } from '../../src/models/list'
import { UserModel } from '../../src/models/user'
import ListItem, { ItemModel } from '../../src/models/item'
import TestFactory from '../factory'
import 'mocha'
import Errors from '../../src/constants/errors';

const server: BringgleServer = new BringgleServer()
const app: express.Application = server.getApp()

chai.use(chaiHttp)

describe('List Controller', () => {
  describe('POST /api/lists', () => {
    let testFactory: TestFactory;
    let requester: any;
    before((done) => {
      requester = chai.request(app).keepOpen()
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    after(() => {
      requester.close()
    })
    it('should return 400 if list name is not defined', (done) => {
      const error: ErrorModel = errors.missingRequiredField('listName')
      const listData: any = {}
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if list name is an empty string', (done) => {
      const error: ErrorModel = errors.missingRequiredField('listName')
      const listData: any = {
        title: '',
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user email is not defined', (done) => {
      const error: ErrorModel = errors.missingRequiredField('userEmail')
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '',
          name: 'John',
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user email is an empty string', (done) => {
      const error: ErrorModel = errors.missingRequiredField('userEmail')
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '',
          name: 'John',
          email: ''
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user name is not defined', (done) => {
      const error: ErrorModel = errors.missingRequiredField('displayName')
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '',
          email: ''
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user name is an empty string', (done) => {
      const error: ErrorModel = errors.missingRequiredField('displayName')
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '',
          name: '',
          email: ''
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 200 and create list with current user and return it if user id is given', (done) => {
      const user: UserModel = testFactory.getRandomUser()
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: user._id
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.listId.should.be.a.string
          res.body.user.id.should.be.eql(user._id.toString())
          res.body.user.name.should.be.eql(user.name)
          res.body.user.email.should.be.eql(user.email)
          done()
        })
    })
    it('should return 200 and create list and user and return it if user id is not given', (done) => {
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '',
          name: 'John Doe',
          email: 'john@doe.com'
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.listId.should.be.a.string
          res.body.user.id.should.be.a.string
          res.body.user.name.should.be.eql(listData.owner.name)
          res.body.user.email.should.be.eql(listData.owner.email)
          done()
        })
    })
    it('should return 200 and create list and user and return it if user id is given but not found in database', (done) => {
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '5b5ad5d1bae6215a38720546',
          name: 'John',
          email: 'john@doe.com'
        }
      }
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.listId.should.be.a.string
          res.body.user.id.should.be.a.string
          res.body.user.name.should.be.eql(listData.owner.name)
          res.body.user.email.should.be.eql(listData.owner.email)
          done()
        })
    })
    it('should return 400 if user id is given but not found in database and missing display name or email', (done) => {
      const listData: any = {
        title: 'Awesome List',
        owner: {
          id: '5b5ad5d1bae6215a38720546',
          name: 'John',
          email: ''
        }
      }
      const expectedError = errors.missingRequiredField('userEmail')
      requester
        .post('/api/lists')
        .send(listData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it.skip('should return 500 if database operation save user fails')
    it.skip('should return 500 if database operation find user fails')
    it.skip('should return 500 if database operation save list fails')
  })
  describe('GET /api/lists/:id', () => {
    let testFactory: TestFactory;
    let requester: any;
    before((done) => {
      requester = chai.request(app).keepOpen()
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    after(() => {
      requester.close()
    })
    it('should return 400 if ID is null', (done) => {
      const id: string = null
      const expectedError: ErrorModel = errors.noId('list')
      requester
        .get(`/api/lists/${id}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if ID is undefined', (done) => {
      const id: string = undefined
      const expectedError: ErrorModel = errors.noId('list')
      requester
        .get(`/api/lists/${id}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it.skip('should return 500 if find list by ID query fails')
    it('should return 404 if list with the given ID does not exist', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'list', id })
      requester
        .get(`/api/lists/${id}?userId=${'5b5c39c618774c33b4b0a011'}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 401 if user does not attend the list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const userId: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.notAuthorized(userId, 'get list')
      requester
        .get(`/api/lists/${list._id}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 200 if list with given ID exists and user attend list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      requester
        .get(`/api/lists/${list._id}?userId=${list.owner}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.id.should.be.eql(list._id.toString())
          res.body.title.should.be.eql(list.title)
          res.body.owner.id.should.be.eql(list.owner.toString())
          res.body.owner.name.should.be.a.string
          res.body.owner.email.should.be.a.string
          res.body.attendees.length.should.be.eql(list.attendees.length)
          res.body.items.length.should.be.eql(list.items.length)
          done()
        })
    })
  })
  describe('POST /api/lists/:id/join', () => {
    let testFactory: TestFactory;
    let requester: any;
    before((done) => {
      requester = chai.request(app).keepOpen()
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    after(() => {
      requester.close()
    })
    it('should return 400 if ID is null', (done) => {
      const id: string = null
      const expectedError: ErrorModel = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/join`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if ID is undefined', (done) => {
      const id: string = undefined
      const expectedError: ErrorModel = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/join`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user id is not given and user email is not defined', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const error: ErrorModel = errors.missingRequiredField('userEmail')
      const joinData: any = {
        name: 'John'
      }
      requester
        .post(`/api/lists/${id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user email is an empty string', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const error: ErrorModel = errors.missingRequiredField('userEmail')
      const joinData: any = {
        id: '',
        name: 'John',
        email: ''
      }
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user name is not defined', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const error: ErrorModel = errors.missingRequiredField('displayName')
      requester
        .post(`/api/lists/${list._id}/join`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 400 if user id is not given and user name is an empty string', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const error: ErrorModel = errors.missingRequiredField('displayName')
      const joinData: any = {
        id: '',
        name: '',
        email: ''
      }
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(error.status)
          res.body.should.be.eql(error)
          done()
        })
    })
    it('should return 200 and join list with current user if user id is given', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      let user: UserModel = testFactory.getRandomNotAttendee(list)
      const joinData: any = {
        id: user._id
      }
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.listId.should.be.eql(list._id.toString())
          res.body.user.id.should.be.eql(user._id.toString())
          res.body.user.name.should.be.eql(user.name)
          res.body.user.email.should.be.eql(user.email)
          done()
        })
    })
    it('should return 200 and create user and join list if user id is not given', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const joinData: any = {
        id: '',
        name: 'John',
        email: 'john@doe.com'
      }
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.listId.should.be.eql(list._id.toString())
          res.body.user.id.should.be.a.string
          res.body.user.name.should.be.eql(joinData.name)
          res.body.user.email.should.be.eql(joinData.email)
          done()
        })
    })
    it('should return 200 and create user and join list if user id is given but not found in database', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const joinData: any = {
        id: '5b5ad5d1bae6215a38720547',
        name: 'John',
        email: 'john@doe.com'
      }
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if(!res.body) res.body = JSON.parse(res.text)
          res.body.listId.should.be.eql(list._id.toString())
          res.body.user.id.should.be.a.string
          res.body.user.name.should.be.eql(joinData.name)
          res.body.user.email.should.be.eql(joinData.email)
          done()
        })
    })
    it('should return 400 if user id is given but not found in database and missing display name or email', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const joinData: any = {
        id: '5b5ad5d1bae6215a38720547',
        name: 'John',
      }
      const expectedError = errors.missingRequiredField('userEmail')
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user already attend the list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const joinData: any = {
        id: list.owner
      }
      const expectedError = errors.userAlreadyInList(list._id, list.owner)
      requester
        .post(`/api/lists/${list._id}/join`)
        .send(joinData)
        .end((err: any, res: ChaiHttp.Response) => {
          if (err) console.log(err)
          res.should.have.status(expectedError.status)
          res.body.code.should.be.eql(errors.code.USER_ALREADY_IN_LIST)
          done()
        })
    })
    it.skip('should return 500 if database operation save user fails')
    it.skip('should return 500 if database operation find user fails')
    it.skip('should return 500 if database operation save list fails')
    it.skip('should return 500 if database operation find list fails')
  })
  describe('PATCH /api/lists/:id/items/:itemId', () => {
    let testFactory: TestFactory;
    let requester: any;
    before((done) => {
      requester = chai.request(app).keepOpen()
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    after(() => {
      requester.close()
    })
    it('should return 400 if list ID undefined or null', (done) => {
      const listId: string = null
      const itemId: string = '5b60900a2c176a2d8cf2d665'
      const expectedError: ErrorModel = errors.noId('list')
      requester
        .patch(`/api/lists/${listId}/items/${itemId}`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item ID undefined or null', (done) => {
      const itemId: string = null
      const listId: string = '5b60900a2c176a2d8cf2d665'
      const expectedError: ErrorModel = errors.noId('item')
      requester
        .patch(`/api/lists/${listId}/items/${itemId}`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID undefined, null or an empty string', (done) => {
      const itemId: string = '5b60900a2c176a2d8cf2d666'
      const listId: string = '5b60900a2c176a2d8cf2d665'
      const expectedError: ErrorModel = errors.noId('user')
      requester
        .patch(`/api/lists/${listId}/items/${itemId}`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if action is undefined, null or an empty string', (done) => {
      const itemId: string = '5b60900a2c176a2d8cf2d666'
      const listId: string = '5b60900a2c176a2d8cf2d665'
      const data: any = { userId: '5b60900a2c176a2d8cf2d667' }
      const expectedError: ErrorModel = errors.missingRequiredField('action')
      requester
        .patch(`/api/lists/${listId}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 401 if user does not attend the list', (done) => {
      const item: ItemModel = testFactory.getRandomItem()
      const list: ListModelLazy = testFactory.getRandomList()
      const user: UserModel = testFactory.getRandomNotAttendee(list)
      const data: any = { userId: user._id, action: 'Whatever' }
      const expectedError: ErrorModel = errors.notAuthorized(data.userId, 'update item')
      requester
        .patch(`/api/lists/${list._id}/items/${item._id}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          expectedError.details.userId = expectedError.details.userId.toString()
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item is not in list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const item: ItemModel = testFactory.getRandomItemNotInList(list)
      const data: any = { userId: list.owner, action: 'Whatever' }
      const expectedError: ErrorModel = errors.itemNotInList(list._id, item._id)
      requester
        .patch(`/api/lists/${list._id}/items/${item._id}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          expectedError.details.listId = expectedError.details.listId.toString()
          expectedError.details.itemId = expectedError.details.itemId.toString()
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if user is not found', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0];
      const data: any = { userId: '5b60900a2c176a2d8cf2d667', action: 'Whatever' }
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'user', id: data.userId })
      requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if item is not found', (done) => {
      const itemId: string = '5b60900a2c176a2d8cf2d666'
      const list: ListModelLazy = testFactory.getRandomList();
      const data: any = { userId: '5b60900a2c176a2d8cf2d667', action: 'Whatever' }
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'item', id: itemId })
      requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if list is not found', (done) => {
      const itemId: string = '5b60900a2c176a2d8cf2d666'
      const listId: string = '5b60900a2c176a2d8cf2d665'
      const data: any = { userId: '5b60900a2c176a2d8cf2d667', action: 'Whatever' }
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'list', id: listId })
      requester
        .patch(`/api/lists/${listId}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it.skip('should return 500 if find user by id fails')
    it.skip('should return 500 if find item by id fails')
    it('should return 500 if find list by id fails')
    it('should return 400 if action is invalid', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      const data: any = { userId: list.owner, action: 'Whatever' }
      const expectedError: ErrorModel = errors.invalidAction(data.action)
      requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if action is bring and sub-item not defined', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      const data: any = { userId: list.owner, action: actions.BRING_ITEM.code }
      const expectedError: ErrorModel = errors.missingRequiredField('sub-item')
      requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if action is bring and item already brought', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      testFactory.bringRandomSubItem(list, itemId).then((sub: number) => {
        const data: any = { userId: list.owner, action: actions.BRING_ITEM.code, sub }
        const expectedError: ErrorModel = errors.itemAlreadyBrought(itemId)
        requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          expectedError.details = expectedError.details.toString()
          res.body.should.be.eql(expectedError)
          testFactory.clearSubItem(itemId, sub).then(() => done())
        })
      })
    })
    it.skip('should return 500 if action is bring save item fails')
    it('should return 200 if action is bring and everything OK', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      const data: any = { userId: list.owner, action: actions.BRING_ITEM.code, sub: 0 }
      testFactory.clearSubItem(itemId, 0).then(() => {
        requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if (!res.body) res.body = JSON.parse(res.text)
          res.body.id.should.be.eql(itemId.toString())
          expect(res.body.quantity).to.be.a('number')
          res.body.author.should.be.a.string
          testFactory.clearSubItem(itemId, 0).then(() => done())
        })
      })
    })
    it('should return 400 if action is clear and sub-item not defined', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      const data: any = { userId: list.owner, action: actions.CLEAR_ITEM.code }
      const expectedError: ErrorModel = errors.missingRequiredField('sub-item')
      requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if action is clear and item already cleared', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      const data: any = { userId: list.owner, action: actions.CLEAR_ITEM.code, sub: 0 }
      testFactory.clearSubItem(itemId, 0).then(() => {
        const expectedError = errors.itemAlreadyCleared(itemId)
        requester
          .patch(`/api/lists/${list._id}/items/${itemId}`)
          .send(data)
          .end((err: any, res: ChaiHttp.Response) => {
            res.should.have.status(expectedError.status)
            expectedError.details = expectedError.details.toString()
            res.body.should.be.eql(expectedError)
            done()
          })
      })
    })
    it.skip('should return 500 if action is clear save item fails')
    it('should return 200 if action is clear and everything OK', (done) => {
      const list: ListModelLazy = testFactory.getRandomList();
      const itemId: string = list.items[0]
      testFactory.bringRandomSubItem(list, itemId).then((sub: number) => {
        const data: any = { userId: list.owner, action: actions.CLEAR_ITEM.code, sub }
        const expectedError: ErrorModel = errors.itemAlreadyBrought(itemId)
        requester
        .patch(`/api/lists/${list._id}/items/${itemId}`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if (!res.body) res.body = JSON.parse(res.text)
          res.body.id.should.be.eql(itemId.toString())
          expect(res.body.quantity).to.be.a('number')
          res.body.author.should.be.a.string
          testFactory.clearSubItem(itemId, sub).then(() => done())
        })
      })
    })
  })
  describe('POST /api/lists/:listId/items', () => {
    let testFactory: TestFactory;
    let requester: any;
    before((done) => {
      requester = chai.request(app).keepOpen()
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    after(() => {
      requester.close()
    })
    it('should return 400 if list ID is null', (done) => {
      const id: string = null
      const expectedError: ErrorModel = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/items`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if list ID undefined', (done) => {
      const id: string = undefined
      const expectedError: ErrorModel = errors.noId('list_id')
      requester
        .post(`/api/lists/${id}/items`)
        .send({})
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item name is missing', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {author: '5b5c39c618774c33b4b0a011', quantity: 1}
      const expectedError: ErrorModel = errors.missingRequiredField('name')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item name is an empty string', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: '', author: '5b5c39c618774c33b4b0a011', quantity: 1}
      const expectedError: ErrorModel = errors.missingRequiredField('name')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item author is missing', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', quantity: 1}
      const expectedError: ErrorModel = errors.missingRequiredField('author')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item author is an empty string', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '', quantity: 1}
      const expectedError: ErrorModel = errors.missingRequiredField('author')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is missing', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011'}
      const expectedError: ErrorModel = errors.missingRequiredField('quantity')
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is not a number', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 'I am not a number!'}
      const expectedError: ErrorModel = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is a floating number', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 3.14}
      const expectedError: ErrorModel = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is greater than 99', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 20098}
      const expectedError: ErrorModel = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item quantity is lesser than 1', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: -5}
      const expectedError: ErrorModel = errors.badQuantity(addItemData.quantity)
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if list does not exist in database', (done) => {
      const id: string = '5b5c39c618774c33b4b0a010'
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'list', id })
      requester
        .post(`/api/lists/${id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if user does not exist in database', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const addItemData: any = {name: 'Item', author: '5b5c39c618774c33b4b0a011', quantity: 5}
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'user', id: addItemData.author })
      requester
        .post(`/api/lists/${list._id}/items`)
        .send(addItemData)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 401 if user is not an attendee of the list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const user: UserModel = testFactory.getRandomNotAttendee(list)
      const data: any = {name: 'Item', author: user._id, quantity: 5}
      const expectedError = errors.notAuthorized(user._id, 'add item')
      requester
        .post(`/api/lists/${list._id}/items`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          expectedError.details.userId = expectedError.details.userId.toString()
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it.skip('should return 500 if find list by id fails')
    it.skip('should return 500 if find user by id fails')
    it.skip('should return 500 if save item fails')
    it.skip('should return 500 if save list fails')
    it('should return 200 if request parameters are correct and database operations succeed', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const data: any = {name: 'Item', author: list.owner, quantity: 5}
      requester
        .post(`/api/lists/${list._id}/items`)
        .send(data)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          if (!res.body) res.body = JSON.parse(res.text)
          res.body.id.should.be.a.string
          res.body.name.should.be.eql(data.name)
          res.body.author.id.should.be.eql(data.author.toString())
          res.body.author.name.should.be.a.string
          res.body.author.email.should.be.a.string
          res.body.quantity.should.be.eql(data.quantity)
          res.body.responsible.should.exist
          done()
        })
    })
  })
  describe('DELETE /api/lists/:listId/items/:itemId', () => {
    let testFactory: TestFactory;
    let requester: any;
    before((done) => {
      requester = chai.request(app).keepOpen()
      testFactory = new TestFactory()
      testFactory.connectDatabase().then(() => {
        testFactory.createTestData().then(() => {
          done()
        })
      })
    })
    after(() => {
      requester.close()
    })
    it('should return 400 if list ID is null', (done) => {
      const listId: string = null
      const itemId: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.noId('list')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if list ID is undefined', (done) => {
      const listId: string = undefined
      const itemId: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.noId('list')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item ID is null', (done) => {
      const itemId: string = null
      const listId: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.noId('item')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item ID is undefined', (done) => {
      const itemId: string = undefined
      const listId: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.noId('item')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID is undefined', (done) => {
      const itemId: string = '5b5c39c618774c33b4b0a011'
      const listId: string = '5b5c39c618774c33b4b0a010'
      const expectedError: ErrorModel = errors.noId('user')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID is an empty string', (done) => {
      const itemId: string = '5b5c39c618774c33b4b0a011'
      const listId: string = '5b5c39c618774c33b4b0a010'
      const userId: string = ''
      const expectedError: ErrorModel = errors.noId('user')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if user ID is null', (done) => {
      const itemId: string = '5b5c39c618774c33b4b0a011'
      const listId: string = '5b5c39c618774c33b4b0a010'
      const userId: string = null
      const expectedError: ErrorModel = errors.noId('user')
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if list does not exists', (done) => {
      const itemId: string = '5b5c39c618774c33b4b0a011'
      const listId: string = '5b5c39c618774c33b4b0a010'
      const userId: string = '5b5c39c618774c33b4b0a012'
      const expectedError: ErrorModel = errors.ressourceNotFound({ type: 'list', id: listId })
      requester
        .delete(`/api/lists/${listId}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if item does not exists', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const itemId: string = '5b5c39c618774c33b4b0a011'
      const userId: string = '5b5c39c618774c33b4b0a012'
      const expectedError = errors.ressourceNotFound({ type: 'item', id: itemId })
      requester
        .delete(`/api/lists/${list._id}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 404 if user does not exists', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const itemId: string = list.items[0]
      const userId: string = '5b5c39c618774c33b4b0a012'
      const expectedError = errors.ressourceNotFound({ type: 'user', id: userId })
      requester
        .delete(`/api/lists/${list._id}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 401 if user does not attend the list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const itemId: string = list.items[0]
      const userId: string = testFactory.getRandomNotAttendee(list)._id
      const expectedError = errors.notAuthorized(userId , 'delete item')
      requester
        .delete(`/api/lists/${list._id}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          expectedError.details.userId = expectedError.details.userId.toString()
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it('should return 400 if item is not in list', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const itemId: string = testFactory.getRandomItemNotInList(list)._id
      const userId: string = list.owner
      const expectedError = errors.itemNotInList(list._id , itemId)
      requester
        .delete(`/api/lists/${list._id}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(expectedError.status)
          expectedError.details.listId = expectedError.details.listId.toString()
          expectedError.details.itemId = expectedError.details.itemId.toString()
          res.body.should.be.eql(expectedError)
          done()
        })
    })
    it.skip('should return 500 if find list by id fails')
    it.skip('should return 500 if find user by id fails')
    it.skip('should return 500 if find item by id fails')
    it.skip('should return 500 if delete item by id fails')
    it.skip('should return 500 if save list fails')
    it('should return 200 if everything is OK', (done) => {
      const list: ListModelLazy = testFactory.getRandomList()
      const itemId: string = list.items[0]
      const userId: string = list.owner
      requester
        .delete(`/api/lists/${list._id}/items/${itemId}?userId=${userId}`)
        .end((err: any, res: ChaiHttp.Response) => {
          res.should.have.status(200)
          res.body.id.should.be.eql(itemId.toString())
          ListItem.findById(itemId).then((item) => {
            expect(item).to.be.null
            done()
          }).catch(err => console.log(err))
        })
    })
  })
})