import { Model } from './model'


export abstract class ReadOnlyModel extends Model {
    async create() { throw(`You cannot create the obj, ${this.model.name} is READ ONLY model`) }
    async update() { throw(`You cannot update the obj, ${this.model.name} is READ ONLY model`) }
    async delete() { throw(`You cannot delete the obj, ${this.model.name} is READ ONLY model`) }
    async save  () { throw(`You cannot save the obj, ${this.model.name} is READ ONLY model`) }
}
