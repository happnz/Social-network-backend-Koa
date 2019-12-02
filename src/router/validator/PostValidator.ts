const schema = {
    "type" : "object",
    "required" : ["text"],
    "additionalProperties": false,
    "properties" : {
        "text" : {
            "type" : "string",
            "maxLength" : 2048,
            "minLength" : 1
        }
    }
};

export default schema;
