module.exports.signUpError = (err) => {
  let errors = { pseudo: "", email: "", password: "" };

  if (err.message.includes("pseudo"))
    errors.pseudo = "ce Pseudo est incorrct ou deja prise";

  if (err.message.includes("email")) error.email = "cette Email est deja prise";

  if (err.message.includes("password"))
    errors.password = "le mots de pas doit avoire 6 caractere minimaux";

  if (err.code == 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
    errors.pseudo = "ce pseudo est deja pris:";

  if (err.code == 11000 && Object.keys(err.keyValue)[0].includes("email"))
    errors.email = "cette email existe deja!";

  return errors;
};

module.exports.signInError = (err) => {
  let errors = {
    email: "",
    password: "",
  };
  if (err.message.includes("email")) errors.email = "email incorrect!";

  if (err.message.includes("password"))
    errors.password = "mots de pass incoreect";

  return errors;
};

module.exports.uploadError = (err) => {
  let error = { format: "", maxSize: "" };

  if (err.message.includes("Fichier non valide")) {
    error.format = "Format est imcompatible";
  } else if (err.message.includes("trop volumineux")) {
    error.format = "le fichier a depasser 500ko";
  }

  return error;
};
