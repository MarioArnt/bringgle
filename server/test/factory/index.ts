import User, { UserModel } from '../../src/models/user'
import List, { ListModelLazy } from '../../src/models/list';
import Item, { ItemModel } from '../../src/models/item';
import mongoose from 'mongoose'
import Config from '../../config'

const NB_USERS: number = 10;
const NB_LISTS: number = 6;
const NB_ITEMS: number = 10;

export default class TestFactory {

  private users: UserModel[];
  private lists: ListModelLazy[];
  private items: ItemModel[];

  constructor () {
    this.users = [];
    this.lists = [];
    this.items = [];
  }

  public connectDatabase = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let connection: string;
      if (process.env.travis) {
        connection = `mongodb://${process.env.mongodb_username}:${process.env.password}@${process.env.mongodb_host}:${process.env.mongodb_port}/bringgle-test`
      } else {
        connection = `mongodb://${Config.database.test.host}:${Config.database.test.port}/bringgle-test`;
      }
      mongoose.connect(connection, { useNewUrlParser: true }).then(() => resolve(), (err) => reject(err))
    })
  }

  public eraseTestData = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const eraseOperations: any = [];
      eraseOperations.push(User.remove({}));
      eraseOperations.push(List.remove({}));
      eraseOperations.push(Item.remove({}));
      Promise.all(eraseOperations).then(() => resolve(), (err) => reject(err))
    })
  }

  public createTestData = async () => {
    return new Promise<void>((resolve, reject) => {
      this.eraseTestData().then(() => {
        this.createUsers().then(() => {
          this.createLists().then(() => {
            this.createItems().then(() => {
              resolve()
            }, (err) => reject(err))
          }, (err) => reject(err))
        }, (err) => reject(err))
      }, (err) => reject(err))
    })
  }

  public createUsers = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const saveOperations: Promise<UserModel>[] = [];
      for(let i: number = 0; i < NB_USERS; ++i) {
        const user = new User({
          name: `User #${i}`,
          email: `user${i}@test.com`
        })
        saveOperations.push(<Promise<UserModel>>user.save())
      }
      Promise.all(saveOperations).then((users) => {
        this.users = users;
        resolve()
      }, (err) => reject(err))
    })
  }

  private createLists = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const saveOperations: Promise<ListModelLazy>[] = [];
      for(let i: number = 0; i < NB_LISTS; ++i) {
        const owner = this.getRandomUser()
        const attendees = [owner]
        const nbAttendees = this.getRandom(1, 6)
        let usersCopy = [...this.users].filter(a => a.id !== owner.id)
        for (let j: number = 0; j < nbAttendees; ++j) {
          const toAdd = usersCopy[this.getRandom(0, usersCopy.length)]
          attendees.push(toAdd)
          usersCopy = usersCopy.filter(a => a.id !== toAdd.id)
        }
        const list = new List({
          title: `List #${i}`,
          owner: owner._id,
          attendees: attendees.map(att => att._id),
          items: [],
          created: Date.now()
        })
        saveOperations.push(<Promise<ListModelLazy>>list.save())
      }
      Promise.all(saveOperations).then((lists) => {
        this.lists = lists;
        resolve()
      }, (err) => reject(err))
    })
  }

  private createItems = async(): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const saveListsOperations: Promise<ListModelLazy>[] = []
      for(let i: number = 0; i < this.lists.length; ++i) {
        saveListsOperations.push(this.createItemsForList(this.lists[i]))
      }
      Promise.all(saveListsOperations).then((lists) => {
        this.lists = lists;
        resolve()
      }, (err) => reject(err))
    })
  }

  private createItemsForList = async(list: ListModelLazy): Promise<ListModelLazy> => {
    return new Promise<ListModelLazy>((resolve, reject) => {
      const saveItemsOperations: Promise<ItemModel>[] = [];
      const numberItems = this.getRandom(1, NB_ITEMS)
      for(let j: number = 0; j < numberItems; ++j) {
        const quantity = this.getRandom(1, 10)
        const author = this.getRandomAttendee(list)
        const responsible = new Map<string, string>()
        for(let k: number = 0; k < quantity; k++) {
          responsible.set(k.toString(), this.getRandomAttendee(list))
        }
        const item = new Item({
          name: `Item #${j}`,
          quantity,
          author,
          responsible,
          created: Date.now()
        })
        saveItemsOperations.push(<Promise<ItemModel>>item.save())
      }
      Promise.all(saveItemsOperations).then((items) => {
        this.items = this.items.concat(items);
        list.items = items.map(it => it._id)
        list.save((err, list) => {
          if(err) reject(err)
          resolve(list)
        })
      }, (err) => reject(err))
    })
  }

  private getRandom = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min) + min);
  }

  public getRandomUser = (): UserModel => {
    return this.users[this.getRandom(0, this.users.length)]
  }

  public getRandomAttendee = (list: ListModelLazy): string => {
    return list.attendees[this.getRandom(0, list.attendees.length)]
  }

  public getRandomNotAttendee = (list: ListModelLazy): UserModel => {
      let found: boolean = false;
      let user: UserModel;
      while(!found) {
        user = this.getRandomUser()
        if(list.attendees.indexOf(user._id) < 0) found = true
      }
      return user;
  }

  public getRandomItemNotInList = (list: ListModelLazy): ItemModel => {
    let found: boolean = false;
    let item: ItemModel;
    while(!found) {
      item = this.getRandomItem()
      if(list.items.indexOf(item._id) < 0) found = true
    }
    return item
  }

  public bringRandomSubItem = async (list: ListModelLazy, id: string): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      Item.findById(id).then((item: ItemModel) => {
        const usrId: string = this.getRandomAttendee(list)
        User.findById(usrId).then((user: UserModel) => {
          const sub: number = this.getRandom(0, item.quantity)
          item.responsible.set(sub.toString(), user)
          item.save().then(() => resolve(sub), (err) => reject(err))
        }).catch(err => reject(err))
      }).catch(err => reject(err))
    })
  }

  public clearSubItem = async (id: string, sub: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      Item.findById(id).then((item: ItemModel) => {
        item.responsible.delete(sub.toString())
        item.save().then(() => resolve(), (err) => reject(err))
      }).catch(err => reject(err))
    })
  }

  public getRandomItem = (): ItemModel => {
    return this.items[this.getRandom(0, this.items.length)]
  }

  public getRandomList = (): ListModelLazy => {
    return this.lists[this.getRandom(0, this.lists.length)]
  }
  public createItem = (): ItemModel => {
    return <ItemModel>(new Item({
      name: 'Brand new item',
      quantity: 1,
      author: this.getRandomUser(),
      responsible: {},
      created: Date.now()
    }))
  }
}