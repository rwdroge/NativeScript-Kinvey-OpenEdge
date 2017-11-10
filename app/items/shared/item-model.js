function Item(options) {
    const model = {
        id: options.id,
        name: options.name,
        price: Number(options.price),
        description: options.description,
        onhand: Number(options.onhand),
        allocated: Number(options.allocated),
        maincategory: options.maincategory,
        category: options.category,
        weight: Number(options.weight),
        onorder: Number(options.onorder),
        minimalqty: Number(options.minimalqty),
        imageUrl: "http://34.253.191.208:8810/KinveyWH/static/images/sports2000/" + options.imgurl
        //imageStoragePath: options.imageStoragePath,
        //isModelValid: !!options.name && !!options.imageUrl
    };

    return model;
}

module.exports = Item;
