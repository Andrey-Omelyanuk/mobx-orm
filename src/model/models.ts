import { ModelDescriptor } from './model-descriptor'

/**
 * Is a map of all models in the application. 
 * It's a singleton.
 */
const models = new Map<string, ModelDescriptor<any>>()
export default models
