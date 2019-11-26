const schema = {
  "type" : "object",
  "required" : ["name", "lastName", "email", "password"],
  "properties" : {
    "name" : {
      "type" : "string",
      "maxLength" : 50,
      "minLength" : 1
    },
    "lastName" : {
      "type" : "string",
      "maxLength" : 50,
      "minLength" : 1
    },
    "email" : {
      "type" : "string",
      "maxLength" : 50,
      "minLength" : 1,
      "format" : "email"
    },
    "password" : {
      "type" : "string",
      "maxLength" : 50,
      "minLength" : 6
    }
  }
};

export default schema;
