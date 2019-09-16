import * as JsStore from "jsstore"
export const connection = new JsStore.Instance()
export const dbName = 'VdTT_Database'

function getDbSchema() {
    var repositoryTable = {
        name: 'Repository',
        columns: {
            // Here "Id" is name of column 
            id: { primaryKey: true, autoIncrement: true, dataType: 'number' },
            name: { notNull: true, unique: true, dataType: "string" },
            type: { notNull: true, dataType: "string" },
            description: { notNull: true, dataType: "string" },
            createdAt: { notNull: true, dataType: "date_time" },
            data: { notNull: true, dataType: "array" },
            tags: { notNull: true, dataType: "array" },
            settings: { notNull: true, dataType: "object" }
        }
    }

    var db = {
        name: dbName,
        tables: [repositoryTable]
    }
    return db
}

async function initJsStore() {
      var database = getDbSchema()
      const isDbCreated = await connection.initDb(database)
      if(isDbCreated===true){
          console.log("db created")
          // here you can prefill database with some data
      }
      else {
          console.log("db opened")
      }
}

initJsStore()