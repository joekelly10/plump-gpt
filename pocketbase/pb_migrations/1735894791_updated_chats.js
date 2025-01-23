migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("aukmp3s38t9s9ez")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kizsvgel",
    "name": "stars",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("aukmp3s38t9s9ez")

  // remove
  collection.schema.removeField("kizsvgel")

  return dao.saveCollection(collection)
})
