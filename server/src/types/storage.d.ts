declare module '../storage/mongodb.js' {
  export class MongoStorage {
    constructor(collection: string);
    findOne(query: any): Promise<any>;
    find(query: any): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<boolean>;
  }
} 