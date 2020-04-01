const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});




// const getDb = require('../util/database').getDb;

// class Product {
//     constructor(title, price, description, imageUrl) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('products').insertOne(this).then(result => {
//             console.log(result);
//         }).catch(err => {
//             console.log(err);
//         });
//     }
// }

// module.exports = Product;