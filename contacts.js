const express = require('express');
const morgan = require('morgan');
const HOST = '127.0.0.1';
const PORT = 3030;
const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
}; 

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(morgan("common"));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
  res.redirect('/contacts');
});
app.get('/contacts', (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});
app.post('/contacts',
  //trim names
  (req, res, next) => {
    req.body.firstName = req.body.firstName.trim();
    req.body.lastName = req.body.lastName.trim();
    req.body.phoneNumber = req.body.phoneNumber.trim();
  },
  //init error message object for this req/res cycle
  (req, res, next) => {
    res.locals.errorMessages = [];

    next();
  },
  //register error for empty first name field
  (req, res, next) => {
    if (req.body.firstName.length === 0) {
      res.locals.errorMessages.push("First Name Required");
    }

    next();
  },
  //register error for empty last name field
  (req, res, next) => {
    if (req.body.lastName.length === 0) {
      res.locals.errorMessages.push("Last Name Required");
    }

    next();
  },
  //register error for empty phone number field
  (req, res, next) => {
    if (req.body.phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone Number Required");
    }

    next();
  },
  //assert that names must be no longer than 25 characters
  (req, res, next) => {
    if (req.body.firstName > 25) {
      res.locals.errorMessages.push("First Name must be less than 25 characters");
    }
    if (req.body.lastName > 25) {
      res.locals.errorMessages.push("Last Name must be less than 25 characters");
    }
  },
  //check for errors; route accordingly
  (req, res) => {
    if (res.locals.errorMessages.length > 0) {
      res.render('addContact', {
        errorMessages: res.locals.errorMessages,
      });
    } else {
      contactData.push({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber
      });
      res.redirect('/contacts');
    }
  }
);
app.get('/contacts/new', (req, res) => {
  res.render("addContact");
});


app.listen(PORT, HOST, () => {
  console.log(`START OF LOG: ${(new Date()).toUTCString()}\nListening on port ${PORT}`);
});