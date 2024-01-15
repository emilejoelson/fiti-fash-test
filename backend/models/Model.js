const mongoose = require("mongoose");


const userSchema= mongoose.model('users',new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
    },
    telephone:String,
    password: String,
    confirmPassword: String,
    image: String,
}
)
);

const userLocalSchema = mongoose.model("userlocals",new mongoose.Schema({
  name : String,
  number: String,
  product: String,
  price: String,
  createdAt: { type: Date, default: Date.now },
}))

const deviSchema = mongoose.model("devis",new mongoose.Schema({
  fullname : String,
  email: String,
  telephone: String,
  ville: String,
  service:String,
  message: String,
  createdAt: { type: Date, default: Date.now },
}))

const retraitSchema = mongoose.model("retraits",new mongoose.Schema({
   retrait:String
}))
const productSchema= mongoose.model('products',new mongoose.Schema({
    name: String,
    category:String,
    subcategory:String,
    subcategory1:String,
    subcategory2:String,
    image: String,
    price: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
   
}))

const dealdujourSchema = mongoose.model('dealdujours',new mongoose.Schema({
  name: String,
  category:String,
  image : String,
  price:String,
  description:String,
  createdAt: { type: Date, default: Date.now }
}))
const contactSchema = mongoose.model('contacts',new mongoose.Schema({
    fullname : String,
    email: String,
    telephone : String,
    sujet : String,
    message : String,
}))

const invoiceSchema = mongoose.model("invoices", new mongoose.Schema({
    username: String,
    userimage :String,
    telephone:String,
    productName: String,
    category: String,
    priceUnit: [String], // Updated to an array of strings
    quantity: [Number], // Updated to an array of numbers
    totalUnit :[Number],
    price: Number,
    total: Number,
    paymentDate: { type: Date, default: Date.now }
  }));

  const messageSchema = mongoose.model("messages",new mongoose.Schema({
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }))
  const temoignageSchema = mongoose.model("temoignages", new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users', // Reference to the User model
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    services: [String],
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the timestamp when a document is created
    },
  }));
  
// Exportation des models
module.exports=
            {
                userSchema,userLocalSchema,productSchema,contactSchema,deviSchema,
                invoiceSchema,messageSchema,temoignageSchema,dealdujourSchema,retraitSchema
            };