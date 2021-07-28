
// mock_adapter decorator
export function mock_adapter() {
    return (cls) => {
        cls.__proto__.adapter = {
            save  : async (obj)=>{ return new Promise((resolve, reject) => { resolve(obj) })},
            delete: async (obj)=>{ return new Promise((resolve, reject) => { resolve(obj) })}, 
            load  : async (   )=>{ return new Promise((resolve, reject) => { resolve([])  })}

        };
    }
}