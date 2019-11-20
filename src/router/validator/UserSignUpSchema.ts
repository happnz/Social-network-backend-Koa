const schema = {
  "type" : "object",
  "required" : ["name", "lastName", "email", "password"],
  "properties" : {
    "name" : {
      "maxLength" : 50
    },
    "lastName" : {
      "maxLength" : 50
    },
    "email" : {
      "maxLength" : 50,
      "format" : "email"
    },
    "password" : {
      "maxLength" : 50
    }
  }
};

export default schema;
