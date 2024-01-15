const chai = require('chai');
const request = require('supertest');
const app = require('../index'); // Adjust the path based on your project structure
const expect = chai.expect;


//____________USER____________________
//1-Test unit pour le login
describe('POST /signup', () => {
  
  it('should respond with success message for a new user', async () => {
    const newUser = {
      firstName: 'Randria',
      lastName: 'Clarisse',
      email: 'randria@gmail.com',
      telephone: '123355464699',
      password: 'passwdfsdGGGH3461',
      confirmPassword: 'passwird3562',
      image: 'KJFKJHSDFHQKFkdshdGJjhSFQSHKFHQSFHQS',
    };

    const response = await request(app)
      .post('/signup')
      .send(newUser);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Inscription avec succès");
    expect(response.body.alert).to.equal(true);
  });

  it('should respond with a message for an already registered email', async () => {
    const existingUser = {
      email: 'joelson@gmail.com',
    };

    const response = await request(app)
      .post('/signup')
      .send(existingUser);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Email déjà enregistré");
    expect(response.body.alert).to.equal(false);
  });

});

//2-Test pour le login 
describe('POST /login', () => {
  it('should respond with success message for a valid login', async () => {
    // Assuming you have a valid user email for testing
    const userEmail = 'joelson@gmail.com';

    const response = await request(app)
      .post('/login')
      .send({ email: userEmail });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Connexion avec succès");
    expect(response.body.alert).to.equal(true);
    expect(response.body.data).to.exist;
  });

  it('should respond with an error message for an invalid login', async () => {
    // Assuming you have an invalid user email for testing
    const invalidEmail = 'invalid@gmail.com';

    const response = await request(app)
      .post('/login')
      .send({ email: invalidEmail });

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Email n'est pas disponible, veuillez vous inscrire");
    expect(response.body.alert).to.equal(false);
  });
});


//3- Test pour la function getuser 
describe('GET /getuser', () => {
  it('should respond with an object of user data', async () => {
    const response = await request(app).get('/getuser');

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('object');
    // Add more specific assertions based on your application logic
  });
});

//4- Test pour la function deleteuser

describe('DELETE/deleteuser/:id', () => {
    const userId = '6574d235dfc91155e3508d04';
    it('should respond with success message when user is deleted', async () => {
        const response = await request(app).delete(`/deleteuser/${userId}`);
    
        expect(response.status).to.equal(200);
        expect(response.text).to.equal("User deleted successfully");
      });
    
   
    const invalidUserId = '65240f9637a49eb4b360474f';
    it('should respond with "User not found" when user is not found', async () => {
      // Assuming you have an invalid user ID for testing
  
      const response = await request(app).delete(`/deleteuser/${invalidUserId}`);
  
      expect(response.status).to.equal(404);
      expect(response.text).to.equal("User not found");
    });
  }); 
  

//5-Test pour finduser by id

describe('GET /finduser/:id', () => {
  it('should respond with user details when user is found', async () => {
    // Assuming you have a valid user ID for testing
    const userId = '6574d3091985875bfbc1d814';

    const response = await request(app).get(`/finduser/${userId}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
    expect(response.body).to.have.property('firstName');
  });

  it('should respond with 404 when user is not found', async () => {
    const nonExistingId = '609c0f1829b1eb7890976faf';

    const response = await request(app).get(`/finduser/${nonExistingId}`);

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({ message: "User not found" });
  });
});


  
//____________PRODUCT____________________
//1-Test pour ajouter un user
describe('POST /uploadProduct', () => {
  it('should respond with success message for a new product', async () => {
    const newProduct = {
      name: 'Riz',
      category: 'Vary',
      subcategory: 'Gadgets',
      subcategory1: 'Smart Devices',
      subcategory2: 'Wearables',
      image: 'ksfjfjqskljdfsdfqmsdfjqslfjqsfkjsdfkjq',
      price: '29.99',
      description: 'A description of the product',
    };

    const response = await request(app)
      .post('/uploadProduct')
      .send(newProduct);

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Chargement avec succès");
  });

});


