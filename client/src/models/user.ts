export default class User {
  id: string;
  name: string;
  email: string;
  constructor(name?: string, email?: string, id?: string) {
    this.id ='';
    this.name = '';
    this.email = '';
    if(name && email) {
      this.name = name;
      this.email = email;
    }
    if(id) this.id = id
  } 
}
