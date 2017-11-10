const observableModule = require("data/observable");
const { knownFolders, path } = require("file-system");
const imagePicker = require("nativescript-imagepicker");

const ItemService = require("../shared/item-service");
const roundingValueConverter = require("./roundingValueConverter");
const visibilityValueConverter = require("./visibilityValueConverter");

const tempImageFolderName = "nsimagepicker";

function ItemDetailEditViewModel(itemModel) {
    const viewModel = observableModule.fromObject({

        // item will be fresh editable copy due to the observable.fromObject(...) wrapping
        item: observableModule.fromObject(itemModel),

        isUpdating: false,

        // set up value converter to force iOS UISlider to work with discrete steps
        roundingValueConverter: roundingValueConverter,
        // set up value converter to force visibility binding update in the template
        visibilityValueConverter: visibilityValueConverter,

        _itemService: ItemService.getInstance(),
        _isItemImageDirty: false,

        saveChanges: function () {
            let queue = Promise.resolve();

            this.set("isUpdating", true);

            // TODO: item image should be required field
            if (this._isItemImageDirty && this.item.imageUrl) {
                queue = queue
                    .then(() => {
                        // no need to explicitly delete old image as upload to an existing remote path overwrites it
                        const localFullPath = this.item.imageUrl;
                        const remoteFullPath = this.item.imageStoragePath;

                        return this._itemService.uploadImage(remoteFullPath, localFullPath);
                    })
                    .then((uploadedFile) => {
                        // do not raise property change event here
                        this.item.imageUrl = uploadedFile.url;

                        this._isItemImageDirty = false;
                    });
            }

            return queue
                .then(() => this._itemService.update(this.item))
                .then(() => this.set("isUpdating", false))
                .catch((errorMessage) => {
                    this.set("isUpdating", false);
                    throw errorMessage;
                });
        },

        onImageAddRemove: function () {
            if (this.item.imageUrl) {
                this._handleImageChange(null);

                return;
            }

            clearImageTempFolder();

            this._pickImage();
        },

        _pickImage: function () {
            const context = imagePicker.create({
                mode: "single"
            });

            context
                .authorize()
                .then(() => context.present())
                .then((selection) => selection.forEach(
                    (selectedAsset) => {
                        selectedAsset.getImage({ maxHeight: 768 })
                            .then((imageSource) => this._handleImageChange(imageSource));
                    })).catch((errorMessage) => console.log(errorMessage));
        },

        _handleImageChange: function (source) {
            let raisePropertyChange = true;
            let tempImagePath = null;
            if (source) {
                tempImagePath = path.join(getImageTempFolder().path, `${Date.now()}.jpg`);
                raisePropertyChange = source.saveToFile(tempImagePath, "jpeg");
            }

            if (raisePropertyChange) {
                // raise property change event here so binding in
                // /items/item-detail-edit-page/my-image-add-remove/MyImageAddRemove.xml works correctly
                this.item.set("imageUrl", tempImagePath);
                this._isItemImageDirty = true;
            }
        }
    });

    viewModel.item.addEventListener(observableModule.Observable.propertyChangeEvent, (propertyChangeData) => {
        const propertyName = propertyChangeData.propertyName;
        if (propertyName === "name" || propertyName === "imageUrl") {
            // update dependent property
            viewModel.item.set("isModelValid", !!viewModel.item.name && !!viewModel.item.imageUrl);
        }
    });

    return viewModel;
}

function getImageTempFolder() {
    return knownFolders.temp().getFolder(tempImageFolderName);
}

function clearImageTempFolder() {
    getImageTempFolder().clear();
}

module.exports = ItemDetailEditViewModel;
