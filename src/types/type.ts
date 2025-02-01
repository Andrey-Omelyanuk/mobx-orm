export interface TypeDescriptorProps {
    null    ?: boolean
    required?: boolean
}
/**
 *  Base class for the type descriptor
 * It is used to define the field of the model
 * It is used to convert the value to the string and back
 */ 
export abstract class TypeDescriptor<T> {
    /**
     * Configuration of the descriptor 
     */
    config: any
    /**
     * Convert value to the string
     */ 
    abstract toString(value: T): string
    /**
     * Convert string to the value
     */ 
    abstract fromString(value: string): T
    /**
     * Check if the value is valid
     * If not, throw an error
     */ 
    abstract validate(value: T): void
}
