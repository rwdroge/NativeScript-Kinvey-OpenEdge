const observableModule = require("data/observable");

/* ***********************************************************
* This is the item details view model.
*************************************************************/
function ItemDetailViewModel(itemModel) {
    const viewModel = observableModule.fromObject({
        item: itemModel
    });

    return viewModel;
}

module.exports = ItemDetailViewModel;
