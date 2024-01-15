const p = require('../models/Model');

const productSchemaMethod = (data) => {
    return new Promise((resolve, reject) => {
        // Validate and create a product instance
        const product = new p.productSchema(data);

        // You can add more validation logic here
        // For example, you can use Mongoose schema validation

        product.validate()
            .then(() => resolve(product))
            .catch((error) => reject(error));
    });
};

const contactSchemaMethod = (data) => {
    return new Promise((resolve, reject) => {
        const contact = new p.contactSchema(data);
        contact.validate()
            .then(() => resolve(contact))
            .catch((error) => reject(contact));
    });
};

const userlocalChemaMethod = (data) => {
     return new Promise ((resolve, reject) => {
        const userlocal = new p.userLocalSchema(data);
        userlocal.validate()
            .then(()=> resolve(userlocal))
            .catch((error)=> reject(userlocal));
     }
       
     )
}

const retraitSchemaMethod = (data) => {
    return new Promise((resolve,reject) => {
        const retrait = new p.retraitSchema(data);
        retrait.validate()
            .then(() => resolve(retrait))
            .catch((error) => reject(retrait));
    })
}
const dealdujourSchemaMethod = (data) => {
    return new Promise((resolve, reject) => {
        const dealdujour = new p.dealdujourSchema(data);
        dealdujour.validate()
            .then(() => resolve(dealdujour))
            .catch((error) => reject(dealdujour));
    });
};

const deviSchemaMethod = (data) => {
    return new Promise((resolve, reject) => {
        const devis = new p.deviSchema(data);
        devis.validate()
            .then(() => resolve(devis))
            .catch((error) => reject(devis));
    });
};

module.exports = {
    productSchemaMethod,contactSchemaMethod,dealdujourSchemaMethod,userlocalChemaMethod,retraitSchemaMethod,deviSchemaMethod
    // Add other exports as needed
};
