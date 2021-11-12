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

const checkForExistingContact = function(contactFirstName, contactLastName) {
  return contactData.some(entry => {
    console.log(`${entry.firstName} ${contactFirstName} :: ${entry.lastName} ${contactLastName}`)
    return (entry.firstName === contactFirstName && entry.lastName === contactLastName);
  });
}

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

    next();
  },
  //init error message object for this req/res cycle
  (req, res, next) => {
    res.locals.errorMessages = [];
    res.locals.errorFlags = {
      firstName: 0,
      lastName:  0,
      phoneNum:  0,
    }

    next();
  },
  //register error for empty first name field
  (req, res, next) => {
    if (req.body.firstName.length === 0) {
      res.locals.errorMessages.push("First Name Required");
      res.locals.errorFlags.firstName += 1;
    }

    next();
  },
  //register error for empty last name field
  (req, res, next) => {
    if (req.body.lastName.length === 0) {
      res.locals.errorMessages.push("Last Name Required");
      res.locals.errorFlags.lastName += 1;
    }

    next();
  },
  //register error for empty phone number field
  (req, res, next) => {
    if (req.body.phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone Number Required");
      res.locals.errorFlags.phoneNum += 1;
    }

    next();
  },
  //assert that names must be no longer than 25 characters
  (req, res, next) => {
    if (req.body.firstName.length > 25) {
      res.locals.errorMessages.push("First Name must be less than 25 characters");
      res.locals.errorFlags.firstName += 1;
    }

    next();
  },
  (req, res, next) => {
    if (req.body.lastName.length > 25) {
      res.locals.errorMessages.push("Last Name must be less than 25 characters");
      res.locals.errorFlags.lastName += 1;
    }

    next();
  },
  //assert that names must contain only letters
  (req, res, next) => {
    res.locals.alphabet = new RegExp(/[^a-z]/, 'i');

    if (res.locals.alphabet.test(req.body.firstName)) {
      res.locals.errorMessages.push("First Names must contain only letters");
      res.locals.errorFlags.firstName += 1;
    }

    next();
  },
  (req, res, next) => {
    if (res.locals.alphabet.test(req.body.lastName)) {
      res.locals.errorMessages.push("Last Names must contain only letters");
      res.locals.errorFlags.lastName += 1;
    }

    next();
  },
  //assert that phone numbers must be US 10-digit format
  (req, res, next) => {
    res.locals.numberFormat = new RegExp(/\d{3}-\d{3}-\d{4}/);

    if (!res.locals.numberFormat.test(req.body.phoneNumber)) {
      res.locals.errorMessages.push("Phone Numbers must be in the US 10-digit format");
      res.locals.errorFlags.phoneNum += 1;
    }

    next();
  },
  //check for duplicate contacts
  (req, res, next) => {
    if (checkForExistingContact(req.body.firstName, req.body.lastName)) {
      res.locals.errorMessages.push("This contact already exists. Duplicates are not allowed");
    }

    next();
  },
  //check for errors; route accordingly
  (req, res) => {
    if (res.locals.errorMessages.length > 0) {
      let responseObject = { errorMessages: res.locals.errorMessages };
      responseObject.firstName = res.locals.errorFlags.firstName ? "" : req.body.firstName;
      responseObject.lastName = res.locals.errorFlags.lastName ? "" : req.body.lastName;
      responseObject.phoneNumber = res.locals.errorFlags.phoneNum ? "" : req.body.phoneNumber;
      
      res.render('addContact', responseObject);
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
  res.render("addContact", {
    firstName: "",
    lastName: "",
    phoneNumber: ""
  });
});


app.listen(PORT, HOST, () => {
  console.log(`START OF LOG: ${(new Date()).toUTCString()}\nListening on port ${PORT}`);
});