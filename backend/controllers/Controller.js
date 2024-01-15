const pMod= require("../models/Model");
const pModule = require("../modulees/Module")
const validator = require('validator')
const mongoose=require('mongoose');
const fs=require('fs');
const dotenv = require('dotenv').config();
const Stripe = require('stripe');
const bcrypt = require('bcryptjs');
/////////////////////////////////////////
//Hashing
const saltRounds = 10;

const singup = (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  pMod.userSchema
    .findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.send({ message: "Email déjà enregistré", alert: false });
      }

      // Hash the password before saving it
      return bcrypt.hash(password, saltRounds);
    })
    .then(hashedPassword => {
      // Create a new user with the hashed password
      const newUser = new pMod.userSchema({ ...req.body, password: hashedPassword });
      return newUser.save();
    })
    .then(() => {
      res.send({ message: "Inscription avec succès", alert: true });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};





const login = (req, res) => {
  const { email, password } = req.body;

  // Log received values
  console.log('Received email:', email);
  console.log('Received password:', password);

  // Find user by email (case-insensitive)
  pMod.userSchema
    .findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } })
    .then((user) => {
      if (user) {
        // Compare received password with the hashed password from the database
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).send({
              message: 'Internal server error',
              alert: false,
            });
            return;
          }

          if (passwordMatch) {
            const dataSend = {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              image: user.image,
            };

            console.log('Login successful for user:', dataSend);

            res.send({
              message: 'Connexion avec succès',
              alert: true,
              data: dataSend,
            });
          } else {
            console.log('Invalid password for user:', user.email);
            res.status(400).send({
              message: 'Votre mot de passe n\'est pas correct',
              alert: false,
            });
          }
        });
      } else {
        console.log('User not found for email:', email);
        res.status(400).send({
          message: 'Email n\'est pas disponible, veuillez vous inscrire',
          alert: false,
        });
      }
    })
    .catch((error) => {
      console.error('Error during login:', error);
      res.status(500).send({
        message: 'Internal server error',
        alert: false,
      });
    });
};

// Get user
const getuser = (req, res) => {
  pMod.userSchema.find({})
    .then((data) => {
      res.send(JSON.stringify(data));
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

  //Supprimer l'utilisateur
  const deleteuser = (req, res) => {
    const { id } = req.params;
  
    pMod.userSchema.findByIdAndDelete(id)
      .then((u) => {
        if (!u) {
          res.status(404).send("User not found");
          return;
        }
        res.send("User deleted successfully");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  };

//Find user
//Find user
const findUser = (req, res) => {
  const { id } = req.params;

  pMod.userSchema.findById(id)
    .then(user => {
      if (!user) {
        // User not found
        res.status(404).json({ message: "User not found" });
        return;
      }

      // User found, respond with user details
      res.status(200).json(user);
    })
    .catch(error => {
      // Check if the error is a "CastError" (invalid ObjectId format)
      if (error.name === 'CastError') {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Other types of errors (database error, etc.)
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    });
};


// Register User

const registerUser = (req, res) => {
  const { firstName, email, password } = req.body;

  let user;

  pMod.userSchema
    .findOne({ email })
    .then((foundUser) => {
      user = foundUser;

      if (user) {
        return res.status(400).json("User with the given email already exists...");
      }

      if (!firstName || !email || !password) {
        return res.status(400).json("All fields are required...");
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json("Email must be a valid email...");
      }

      if (!validator.isStrongPassword(password)) {
        return res.status(400).json("Password must be a strong password...");
      }

      user = new pMod.userSchema({ firstName, email, password });

      return bcrypt.genSalt(10);
    })
    .then((salt) => {
      return bcrypt.hash(user.password, salt);
    })
    .then((hashedPassword) => {
      user.password = hashedPassword;
      return user.save();
    })
    .then((savedUser) => {
      res.status(200).json({ _id: savedUser._id, firstName, email });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
};




//Upload product
const uploadproduct = (req, res) => {
  console.log(req.body);

  // Ensure that pMod.productSchema returns a promise
  pModule.productSchemaMethod(req.body)
    .then((data) => {
      // Assuming Product is a Mongoose model
      return new pMod.productSchema(data).save();
    })
    .then((datasave) => {
      console.log(datasave);
      res.status(200).send({ message: "Chargement avec succès" });
    })
    .catch((error) => {
      console.error(error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({ message: "Validation failed", errors: error.errors });
      } else {
        res.status(500).send("Internal Server Error");
      }
    });
};

//Get product
const getproduct = (req, res) => {
  pMod.productSchema.find({})
    .then((data) => {
      res.send(JSON.stringify(data));
    })
    .catch((error) => {
      // Handle any errors that might occur during the find operation
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
};

//Get product onweek ago
const getproductonweekago = (req, res) => {
  try {
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    pMod.productSchema
      .find({
        createdAt: { $gte: sevenDaysAgo, $lte: currentDate }
      })
      .then((products) => {
        res.status(200).json(products);
      })
      .catch((error) => {
        res.status(500).json({ message: 'Error while fetching products', error });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error in the try block', error });
  }
};

//Supprimer le produit
const deleteproduct = (req, res) => {
  const { id } = req.params;

  pMod.productSchema
    .findByIdAndDelete(id)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: `Pas de produit avec ID ${id}` });
      }
      res.status(200).json({ message: `Suppression avec succès avec ID = ${id}` });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

//Update product
const updateproduct = (req, res) => {
  const { id } = req.params;

  pMod.productSchema
    .findByIdAndUpdate(id, req.body)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: `Pas de produit avec ID ${id}` });
      }

      return pMod.productSchema.findById(id);
    })
    .then((updateprd) => {
      res.status(200).json({ message: `Mise à jour avec succès avec ID = ${id}` });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};


//Paiement getway
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const checkoutpayement = (req, res) => {
  console.log(req.body);

  try {
    const params = {
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_options: [{ shipping_rate: 'shr_1N6TwsJmzya4DzxyHZjdrR63' }],

      line_items: req.body.map((item) => {
        return {
          price_data: {
            currency: 'MAD',
            product_data: {
              name: item.name,
              // images: [item.image]
            },
            unit_amount: Math.round(item.price * 100),
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: item.qty,
        };
      }),
      success_url: `${process.env.FRONTEND_URL}/success`, // Use HTTPS URL
      cancel_url: `${process.env.FRONTEND_URL}/cancel`, // Use HTTPS URL
    };

    stripe.checkout.sessions.create(params).then((session) => {
      console.log(session);
      res.status(200).json(session.id);
    }).catch((err) => {
      res.status(err.statusCode || 500).json(err.message);
    });
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }
};

const adddealdujour =(req,res) => {
  console.log(req.body);

  pModule.dealdujourSchemaMethod(req.body)
    .then((data)  => {
      return new pMod.dealdujourSchema(data).save();
    })
    .then((datasave) => {
      console.log(datasave);
      res.send({message:"Chargement avec succès"});
    })
    .catch((error) =>{
      console.error(error);
      if(error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({message :"Validation failed",errors:error.errors});
      }else {
        res.status(500).send("Internal Server Error");
      }
    });
}

const getdealdujour = (req,res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

  pMod.dealdujourSchema
    .findOne({
      createdAt: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    })
    .then((dealdujour) => {
      if (!dealdujour) {
        res.status(404).json({ message: 'No dealdujour found for today.' });
      } else {
        res.status(200).json(dealdujour);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
}
const deletedealdujour = (req, res) => {
  const { id } = req.params;

  pMod.dealdujourSchema
    .findByIdAndDelete(id)
    .then((dealdujour) => {
      if (!dealdujour) {
        return res.status(404).json({ message: `Pas de produit avec ID ${id}` });
      }
      res.status(200).json({ message: `Suppression avec succès avec ID = ${id}` });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

//Update product
const updatedealdujour = (req, res) => {
  const { id } = req.params;

  pMod.dealdujourSchema
    .findByIdAndUpdate(id, req.body)
    .then((dealdujour) => {
      if (!dealdujour) {
        return res.status(404).json({ message: `Pas de produit avec ID ${id}` });
      }

      return pMod.dealdujourSchema.findById(id);
    })
    .then((updealdujr) => {
      res.status(200).json({ message: `Mise à jour avec succès avec ID = ${id}` });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
};

//Get contact
const getalldealdujour = (req, res) => {
  pMod.dealdujourSchema.find({})
    .then(data => {
      res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};


const adduserlocal = (req,res) => {
   console.log(req.body);
   
   pModule.userlocalChemaMethod(req.body)
      .then((data) => {
        return new pMod.userLocalSchema(data).save();
      })
      .then((datasave) => {
        console.log(datasave);
        res.send({message:"Chargement avec succès"});
      })
      .catch((error) => {
        console.error(error);
        if(error instanceof mongoose.Error.ValidationError){
           res.status(400).send({message:"Validation failed",error:error.errors});
        } else{
          res.status(500).send("Internal Server Error");
        }
      })
}

//Get userLocal
const getuserlocal = (req, res) => {
  pMod.userLocalSchema.find({})
    .then(data => {
      res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};

const countUserlocals = (req, res) => {
  pMod.userLocalSchema.countDocuments()
    .then(userlocalTotal => {
      res.json({ userlocalTotal });
    })
    .catch(error => {
      console.error("Error counting documents:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};


const calculateTotalPriceuserlocal = (req, res) => {
  pMod.userLocalSchema.find({})
    .then((userLocals) => {
      // Calculate the sum of prices
      const totalPrice = userLocals.reduce((sum, userLocal) => {
        const price = parseFloat(userLocal.price) || 0; // Convert to float, handle NaN
        return sum + price;
      }, 0);

      res.status(200).json({ totalPrice });
    })
    .catch((error) => {
      console.error('Error calculating total price:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};


//Contactez nous 
const addcontact = (req, res) => {
  console.log(req.body);

  pModule.contactSchemaMethod(req.body)
    .then((data)  => {
      return new pMod.contactSchema(data).save();
    })
    .then((datasave) => {
      console.log(datasave);
      res.send({message:"Chargement avec succès"});
    })
    .catch((error) =>{
      console.error(error);
      if(error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({message :"Validation failed",errors:error.errors});
      }else {
        res.status(500).send("Internal Server Error");
      }
    });
};

 const addretrait = (req,res) => {
  console.log(req.body);

  pModule.retraitSchemaMethod(req.body)
    .then((data)  => {
      return new pMod.retraitSchema(data).save();
    })
    .then((datasave) => {
      console.log(datasave);
      res.send({message:"Chargement avec succès"});
    })
    .catch((error) =>{
      console.error(error);
      if(error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({message :"Validation failed",errors:error.errors});
      }else {
        res.status(500).send("Internal Server Error");
      }
    });
 };

 const addDevis = (req,res) => {
  console.log(req.body);

  pModule.deviSchemaMethod(req.body)
    .then((data)  => {
      return new pMod.deviSchema(data).save();
    })
    .then((datasave) => {
      console.log(datasave);
      res.send({message:"Chargement avec succès"});
    })
    .catch((error) =>{
      console.error(error);
      if(error instanceof mongoose.Error.ValidationError) {
        res.status(400).send({message :"Validation failed",errors:error.errors});
      }else {
        res.status(500).send("Internal Server Error");
      }
    });
 };

 //Get devis
 const getdevis = (req, res) => {
  pMod.deviSchema.find({})
    .then(data => {
      res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};
 const calculateTotalRetrait = (req, res) => {
  pMod.retraitSchema.find({})
    .then((retraits) => {
      // Calculate the sum of prices
      const retraitTotal = retraits.reduce((sum, retrait) => {
        const ret = parseFloat(retrait.retrait) || 0; // Convert to float, handle NaN
        return sum + ret;
      }, 0);

      res.status(200).json({ retraitTotal });
    })
    .catch((error) => {
      console.error('Error calculating total price:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
};


//Get contact
const getcontact = (req, res) => {
  pMod.contactSchema.find({})
    .then(data => {
      res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};

const countContacts = (req, res) => {
  pMod.contactSchema.countDocuments()
    .then(contactTotal => {
      res.json({ contactTotal });
    })
    .catch(error => {
      console.error("Error counting documents:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};


// Create a function for creating invoices
const createInvoice = (req, res, io) => {
  const { name, category, priceUnit, quantity, totalUnit, price, total, username, userimage, telephone } = req.body;

  // Create a new invoice instance
  const invoice = new pMod.invoiceSchema({
    productName: name,
    category,
    priceUnit: Array.isArray(priceUnit) ? priceUnit : [priceUnit],
    quantity: Array.isArray(quantity) ? quantity : [quantity],
    totalUnit: Array.isArray(totalUnit) ? totalUnit : [totalUnit],
    price,
    total,
    username,
    userimage,
    telephone
  });

  // Save the invoice to the database
  invoice
    .save()
    .then(() => {
      // Emit a Socket.IO event to notify clients about the newly created invoice
      req.app.io.emit('newInvoice', invoice); // Access io from req.app.io

      // Send a success response
      res.status(200).json({ message: 'Invoice created successfully' });
    })
    .catch((error) => {
      console.error('Error creating invoice:', error);

      // If there's an error, send an error response
      res.status(500).json({ error: 'Failed to create invoice' });
    });
};



//Get contact
const getInvoice = (req, res) => {
  pMod.invoiceSchema.find({}).sort({ paymentDate: -1 })
    .then(data => {
      res.send(JSON.stringify(data));
    })
    .catch(error => {
      console.error('Error retrieving invoices:', error);
      res.status(500).json({ error: 'Failed to retrieve invoices' });
    });
};



// Count Client
const countClients = (req, res) => {
  pMod.invoiceSchema
    .distinct("username")
    .then((distinctUsernames) => {
      const clientTotal = distinctUsernames.length;
      res.json({ clientTotal });
    })
    .catch((error) => {
      console.error("Error counting unique usernames:", error);
      res.status(500).json({ error: "An error occurred" });
    });
};

// Revenu total journalier
const getSumOfPricesToday = (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to 00:00:00:000

    pMod.invoiceSchema.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours to get tomorrow's date
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPriceToDay: { $sum: "$price" }
        }
      }
    ]).exec() // Use .exec() to return a promise
      .then(result => {
        if (result.length > 0) {
          res.json({ totalPriceToDay: result[0].totalPriceToDay });
        } else {
          res.json({ totalPriceToDay: 0 }); // No invoices found for today
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};


const getSumOfPricesThisWeek = (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to 00:00:00:000

    const startOfWeek = new Date(today);
    const startDayOfWeek = 1; // Monday
    const diff = (today.getDay() + 7 - startDayOfWeek) % 7;
    startOfWeek.setDate(today.getDate() - diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    pMod.invoiceSchema.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfWeek,
            $lt: new Date(endOfWeek.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours to include the end date
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPriceThisWeek: { $sum: "$price" }
        }
      }
    ]).then(result => {
      if (result.length > 0) {
        res.json({ totalPriceThisWeek: result[0].totalPriceThisWeek });
      } else {
        res.json({ totalPriceThisWeek: 0 }); // No invoices found for this week
      }
    }).catch(error => {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};


const getSumOfPricesThisMonth = (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to 00:00:00:000

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Set to the first day of the month

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Set to the last day of the month

    pMod.invoiceSchema.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfMonth,
            $lt: new Date(endOfMonth.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours to include the end date
          }
        }
      },
      {
        $group: {
          _id: null,
          totalPriceThisMonth: { $sum: "$price" }
        }
      }
    ])
      .then(result => {
        if (result.length > 0) {
          res.json({ totalPriceThisMonth: result[0].totalPriceThisMonth });
        } else {
          res.json({ totalPriceThisMonth: 0 }); // No invoices found for this month
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};


const getSumOfPricesThisYear = (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to 00:00:00:000

    const startOfYear = new Date(today.getFullYear(), 0, 1); // Set to the first day of the year

    const endOfYear = new Date(today.getFullYear() + 1, 0, 1); // Set to the first day of the next year

    pMod.invoiceSchema.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPriceThisYear: { $sum: "$price" },
        },
      },
    ])
      .then((result) => {
        if (result.length > 0) {
          res.json({ totalPriceThisYear: result[0].totalPriceThisYear });
        } else {
          res.json({ totalPriceThisYear: 0 }); // No invoices found for this year
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};


const getSumOfPricesPerDayThisWeek = (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to 00:00:00:000

  const startOfWeek = new Date(today);
  const startDayOfWeek = 1; // Monday
  const diff = (today.getDay() + 7 - startDayOfWeek) % 7;
  startOfWeek.setDate(today.getDate() - diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  pMod.invoiceSchema.aggregate([
    {
      $match: {
        paymentDate: {
          $gte: startOfWeek,
          $lt: new Date(endOfWeek.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours to include the end date
        }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$paymentDate" },
        totalPrice: { $sum: "$price" }
      }
    },
    {
      $project: {
        _id: 0,
        day: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 1] }, then: "Sunday" },
              { case: { $eq: ["$_id", 2] }, then: "Monday" },
              { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
              { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
              { case: { $eq: ["$_id", 5] }, then: "Thursday" },
              { case: { $eq: ["$_id", 6] }, then: "Friday" },
              { case: { $eq: ["$_id", 7] }, then: "Saturday" }
            ]
          }
        },
        totalPrice: 1
      }
    }
  ])
    .then((result) => {
      const daysOfWeek = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0
      };

      result.forEach((item) => {
        daysOfWeek[item.day] = item.totalPrice;
      });

      res.json({ _id: null, ...daysOfWeek });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    });
};

const getSumOfPricesPerMonthThisYear = async (req, res) => {
  try {
    const result = await pMod.invoiceSchema.aggregate([
      {
        $group: {
          _id: { $month: "$paymentDate" },
          totalPrice: { $sum: "$price" }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "January" },
                { case: { $eq: ["$_id", 2] }, then: "February" },
                { case: { $eq: ["$_id", 3] }, then: "March" },
                { case: { $eq: ["$_id", 4] }, then: "April" },
                { case: { $eq: ["$_id", 5] }, then: "May" },
                { case: { $eq: ["$_id", 6] }, then: "June" },
                { case: { $eq: ["$_id", 7] }, then: "July" },
                { case: { $eq: ["$_id", 8] }, then: "August" },
                { case: { $eq: ["$_id", 9] }, then: "September" },
                { case: { $eq: ["$_id", 10] }, then: "October" },
                { case: { $eq: ["$_id", 11] }, then: "November" },
                { case: { $eq: ["$_id", 12] }, then: "December" }
              ]
            }
          },
          totalPrice: 1
        }
      }
    ]);

    const months = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0
    };

    result.forEach((item) => {
      months[item.month] = item.totalPrice;
    });

    res.json({ _id: null, ...months });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};
/*
const getSumOfPricesPerMonthThisYear = (req, res) => {
  const year = req.params.year; // Assuming the year is provided in the request parameters

  pMod.invoiceSchema.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$paymentDate" }, parseInt(year, 10)]
        }
      }
    },
    {
      $group: {
        _id: { $month: "$paymentDate" },
        totalPrice: { $sum: "$price" }
      }
    },
    {
      $project: {
        _id: 0,
        month: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 1] }, then: "January" },
              { case: { $eq: ["$_id", 2] }, then: "February" },
              { case: { $eq: ["$_id", 3] }, then: "March" },
              { case: { $eq: ["$_id", 4] }, then: "April" },
              { case: { $eq: ["$_id", 5] }, then: "May" },
              { case: { $eq: ["$_id", 6] }, then: "June" },
              { case: { $eq: ["$_id", 7] }, then: "July" },
              { case: { $eq: ["$_id", 8] }, then: "August" },
              { case: { $eq: ["$_id", 9] }, then: "September" },
              { case: { $eq: ["$_id", 10] }, then: "October" },
              { case: { $eq: ["$_id", 11] }, then: "November" },
              { case: { $eq: ["$_id", 12] }, then: "December" }
            ]
          }
        },
        totalPrice: 1
      }
    }
  ])
    .then((result) => {
      const months = {
        January: 0,
        February: 0,
        March: 0,
        April: 0,
        May: 0,
        June: 0,
        July: 0,
        August: 0,
        September: 0,
        October: 0,
        November: 0,
        December: 0
      };

      result.forEach((item) => {
        months[item.month] = item.totalPrice;
      });

      res.json({ _id: null, ...months });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    });
};*/

// Example usage: /api/sum-of-prices-per-month/2022



//Create message
const createMessage = (req, res) => {
  const { text, sender } = req.body;
  const message = new pMod.messageSchema({ text, sender });

  message
    .save()
    .then((savedMessage) => {
      res.status(201).json(savedMessage);
    })
    .catch((error) => {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    });
};


const createTemoignage = (req, res) => {
  const { user, text, rating, services } = req.body;

  // Create a new testimonial document with a createdAt timestamp
  const createdAt = new Date(); // Current timestamp
  const temoignage = new pMod.temoignageSchema({ user, text, rating, services, createdAt });

  // Save the testimonial to the database
  temoignage
    .save()
    .then(savedTemoignage => {
      res.status(201).json(savedTemoignage);
    })
    .catch(error => {
      console.error('Error saving testimonial:', error);
      res.status(500).json({ error: 'Failed to save testimonial' });
    });
};

//Get testimonials with user data populated
const getTemoignage = (req, res) => {
  pMod.temoignageSchema.find({})
    .populate('user', 'lastName image telephone')
    .then(data => {
      res.status(200).json(data);
    })
    .catch(error => {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    });
};

//Get message
const getMessages = (req, res) => {
  pMod.messageSchema.find().sort({ createdAt: 1 })
    .then(messages => {
      res.json(messages);
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    });
};


//Get user by some letter
const findUserByPartialMatch = (req, res) => {
  const { s } = req.query;

  pMod.userSchema
    .find({
      $or: [
        { firstName: { $regex: s, $options: 'i' } },
        { lastName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ],
    })
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.error('Error finding users:', error);
      res.status(500).json({ error: 'Failed to find users' });
    });
};


  module.exports={
                    singup,login,
                    uploadproduct,getproduct,
                    checkoutpayement,deleteproduct,
                    updateproduct,getuser,deleteuser,
                    getproductonweekago,addcontact,getcontact,getuserlocal,
                    adduserlocal,countContacts,createInvoice,getInvoice,countUserlocals,
                    countClients,getSumOfPricesToday,calculateTotalPriceuserlocal,
                    getSumOfPricesThisWeek,getSumOfPricesThisMonth,calculateTotalRetrait,
                    getSumOfPricesThisYear,getSumOfPricesPerDayThisWeek,
                    getSumOfPricesPerMonthThisYear,
                    createMessage,getMessages,findUserByPartialMatch,
                    findUser,registerUser,createTemoignage,
                    getTemoignage,adddealdujour,getdealdujour,updatedealdujour,
                    getalldealdujour,deletedealdujour,addretrait,addDevis,getdevis
                };