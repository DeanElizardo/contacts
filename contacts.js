const express = require('express');
const morgan = require('morgan');
const { body, validationResult } = require("express-validator");
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

const checkForExistingContact = function (contactFirstName, contactLastName) {
  return contactData.some(entry => {
    console.log(`${entry.firstName} ${contactFirstName} :: ${entry.lastName} ${contactLastName}`)
    return (entry.firstName === contactFirstName && entry.lastName === contactLastName);
  });
}

const validateName = function (name, whichName) {
  return body(name)
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage(`${whichName} name must be 1 - 25 characters long`)
    .bail()
    .isAlpha()
    .withMessage(`${whichName} name cannot contain non-alphabetical characters`);
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
  [
    validateName("firstName", "First"),
    validateName("lastName", "Last"),

    body("phoneNumber")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone number must not be empty")
      .bail()
      .matches(/\d{3}-\d{3}-\d{4}/)
      .withMessage("Phone number must be in the U.S. 10 digit format ###-###-####")
  ],
  (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("addContact", {
        errorMessages: errors.array().map(error => error.msg),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber
    });

    res.redirect("/contacts");
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