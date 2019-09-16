import { connection } from "./indexedDBSevice"

export class RepositoryService {
    constructor() {
        this.tableName = 'Repository';
    }
    get connection() {
        return connection;
    }

    getRepositorys() {
        return this.connection.select({
            from: this.tableName,
        })
    }

    addRepository = (repository) => {
        return this.connection.insert({
            into: this.tableName,
            values: [repository],
            // return: true
        })
    }

    getRepositoryById(id) {
        return this.connection.select({
            from: this.tableName,
            where: {
                id: id
            }
        })
    }

    removeRepository(id) {
        return this.connection.remove({
            from: this.tableName,
            where: {
                id: id
            }
        })
    }

    updateRepositoryById(id, updateData) {
        return this.connection.update({
            in: this.tableName,
            set: updateData,
            where: {
                id: id
            }
        })
    }
}
