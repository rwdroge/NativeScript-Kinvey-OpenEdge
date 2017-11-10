const observableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;

const ItemService = require("./shared/item-service");

/* ***********************************************************
 * This is the master list view model.
 *************************************************************/
function ItemsListViewModel() {
    const viewModel = observableModule.fromObject({
        items: new ObservableArray([]),
        isLoading: false,

        _itemService: ItemService.getInstance(),

        load: function () {
            this.set("isLoading", true);

            this._itemService.load()
                .finally(() => this.set("isLoading", false))
                .subscribe((items) => {
                    this.set("items", new ObservableArray(items));
                    this.set("isLoading", false);
                });
        }
    });

    return viewModel;
}

module.exports = ItemsListViewModel;
