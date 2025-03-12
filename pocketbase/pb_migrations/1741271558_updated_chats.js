/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("aukmp3s38t9s9ez")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json980656998",
    "maxSize": 0,
    "name": "highlights",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("aukmp3s38t9s9ez")

  // remove field
  collection.fields.removeById("json980656998")

  return app.save(collection)
})
