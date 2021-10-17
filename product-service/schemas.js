const yup = require("yup");

module.exports = {
  schemas: {
    product: yup.object().shape({
      title: yup.string().required(),
      description: yup.string(),
      price: yup.number().positive().integer(),
      count: yup.number().positive().integer(),
    }),
  },
};
