if (global.TNS_WEBPACK) {
    //registers tns-core-modules UI framework modules
    require("bundle-entry-points");

    global.registerModule("nativescript-pro-ui/listview", () =>
        require("../node_modules/nativescript-pro-ui/listview"));

    //register application modules
    global.registerModule("items/items-list-page", () => require("./items/items-list-page"));
    global.registerModule("items/item-detail-page/item-detail-page", () =>
        require("./items/item-detail-page/item-detail-page"));
}
