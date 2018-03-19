// import store        from './store'
// import transaction  from './transaction'

import Filter from './filter'

console.log(Filter)


export default class Model {
  // @transaction()
  async save() {

    // let id = Math.random().toString(36).substring(7);
    // (<any>this).__data['id'] = id;

  }
  // @transaction()
  // async delete() { (<any>this).id = undefined; }
  //

	static filter (where?, orderBy? : string[], limit? : number, offset? : number) : any {
  	return new Filter(null, where, orderBy, limit, offset)
	}

}


