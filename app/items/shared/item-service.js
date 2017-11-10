const Observable = require("rxjs/Rx").Observable;
const Kinvey = require("kinvey-nativescript-sdk").Kinvey;
const fs = require("tns-core-modules/file-system");
const connectivity = require("connectivity");


const Config = require("../../shared/config");
const Item = require("./item-model");

const editableProperties = [
    "onhand",
    "maincategory",
    "category",
    "name",
    "price",
    "allocated"
];


function ItemService() {
    if (ItemService._instance) {
        throw new Error("Use ItemService.getInstance() instead of new.");
    }
 
    this._items = [];
    this._itemsStore = Kinvey.DataStore.collection("OEItems", Kinvey.DataStore.Sync);
    this._itemsStore.ttl = 3600;
    ItemService._instance = this;

    this.load = function () {
        var connectionType = connectivity.getConnectionType();
        return new Observable((observer) => {
            switch (connectionType) {
                case connectivity.connectionType.none:
                    console.log("No connection");
                    var subscription = this._itemsStore.find()
                    .subscribe(function(data) {
                        console.log(data);
                        this._allItems = [];
                        data.forEach((itemData) => {
                            itemData.id = itemData._id;
                            const item = new Item(itemData);
        
                            this._allItems.push(item);
                        });
                        observer.next(this._allItems);
                    }, function(error) {
                      console.log("this is it", error);
                    }, function() {
                      console.log("now I am here");
                    });
                    break;
                case connectivity.connectionType.wifi:
                    this._login().then(() => this._itemsStore.sync()).then(() => {
                        const sortByNameQuery = new Kinvey.Query();
                        sortByNameQuery.ascending("name");
                        const stream = this._itemsStore.find(sortByNameQuery);
        
                        return stream.toPromise();
                    }).then((data) => {
                        this._allItems = [];
                        data.forEach((itemData) => {
                            itemData.id = itemData._id;
                            const item = new Item(itemData);
        
                            this._allItems.push(item);
                        });
        
                        observer.next(this._allItems);    
                    }).catch(this._handleErrors)    
                    break;
                case connectivity.connectionType.mobile:
                    console.log("Mobile connection");
                    break;
            }

        });
    };

    this.update = function (itemModel) {
        var connectionType = connectivity.getConnectionType();
        const updateModel = cloneUpdateModel(itemModel);

        switch (connectionType) {
            case connectivity.connectionType.none:
            return this._itemsStore.save(updateModel);
                break;
            case connectivity.connectionType.wifi:
                return this._itemsStore.save(updateModel);
                return this._itemsStore.sync();
                    
                break;
            case connectivity.connectionType.mobile:
                console.log("Mobile connection");
                break;
        }

        


        return this._itemsStore.save(updateModel);
    };

    this.uploadImage = function (remoteFullPath, localFullPath) {
        const imageFile = fs.File.fromPath(localFullPath);
        const imageContent = imageFile.readSync();

        const metadata = {
            filename: imageFile.name,
            mimeType: this._getMimeType(imageFile.extension),
            size: imageContent.length,
            public: true
        };

        return Kinvey.Files.upload(imageFile, metadata, { timeout: 2147483647 })
            .then((uploadedFile) => {
                const query = new Kinvey.Query();
                query.equalTo("_id", uploadedFile._id);

                return Kinvey.Files.find(query);
            })
            .then((files) => {
                if (files && files.length) {
                    const file = files[0];
                    file.url = file._downloadURL;

                    return file;
                }
                else {
                    Promise.reject(new Error("No items with the given ID could be found."));
                }
            });
    };

    this._login = function () {
        if (Kinvey.User.getActiveUser()) {
            return Promise.resolve();
        }
        else {
            return Kinvey.User.login(Config.kinveyUsername, Config.kinveyPassword);
        }
    };

    this._getMimeType = function (imageExtension) {
        const extension = imageExtension === "jpg" ? "jpeg" : imageExtension;

        return `image/${extension.replace(/\./g, "")}`;
    };

    this._handleErrors = function (error) {
        return Observable.throw(error);
    };
}

ItemService.getInstance = function () {
    return ItemService._instance;
};

ItemService._instance = new ItemService();

function cloneUpdateModel(item) {
    return editableProperties.reduce((a, e) => (a[e] = item[e], a), { _id: item.id }); // eslint-disable-line no-return-assign, no-sequences
}

module.exports = ItemService;
