export interface TypeDescriptorProps {
    null        ?: boolean
    blank       ?: boolean
}
/**
 *  Base class for the type descriptor
 * It is used to define the field of the model
 * It is used to convert the value to the string and back
 */ 
export abstract class TypeDescriptor<T> {
    config: any
    /**
     * Decorator for the field of the model.
     */
    /**
     * Convert value to the string
     */ 
    // toString(value: T) { return toString(this.type, value) }
    /**
     * Convert string to the value
     */ 
    // fromString(value: string): T { return stringTo(this.type, value) } 
    /**
     * Check if the value is valid
     * If not, throw an error
     */ 
    validate(value: T) {
        if (value === null && !this.config.null)
            throw new Error('Field is required')
        if (value === '' && !this.config.blank)
            throw new Error('Field is required')
    }
}
