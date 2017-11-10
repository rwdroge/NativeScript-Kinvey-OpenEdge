const topmost = require("ui/frame").topmost;

const ItemDetailViewModel = require("./item-detail-view-model");

/* ***********************************************************
* This is the item details code behind in the master-detail structure.
* This code behind retrieves the passed parameter from the master list component,
* finds the data item by this parameter and displays the detailed data item information.
*************************************************************/

/* ***********************************************************
* Use the "onNavigatingTo" handler to initialize the page binding context.
*************************************************************/
function onNavigatingTo(args) {
    /* ***********************************************************
    * The "onNavigatingTo" event handler lets you detect if the user navigated with a back button.
    * Skipping the re-initialization on back navigation means the user will see the
    * page in the same data state that he left it in before navigating.
    *************************************************************/
    if (args.isBackNavigation) {
        return;
    }

    const page = args.object;

    page.bindingContext = new ItemDetailViewModel(page.navigationContext);
}

/* ***********************************************************
* The back button is essential for a master-detail feature.
*************************************************************/
function onBackButtonTap() {
    topmost().goBack();
}

/* ***********************************************************
* The master-detail template comes with an example of an item edit page.
* Check out the edit page in the /item/item-detail-edit-page folder.
*************************************************************/
function onEditButtonTap(args) {
    const bindingContext = args.object.bindingContext;

    topmost().navigate({
        moduleName: "items/item-detail-edit-page/item-detail-edit-page",
        context: bindingContext.item,
        animated: true,
        transition: {
            name: "slideTop",
            duration: 200,
            curve: "ease"
        }
    });
}

exports.onNavigatingTo = onNavigatingTo;
exports.onBackButtonTap = onBackButtonTap;
exports.onEditButtonTap = onEditButtonTap;
