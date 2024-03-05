const { z } = require("zod");

const validateLead = async (postData) => {
  const lead = z.object({
    email: z.string().email(),
    description: z.string(),
  });

  let hasError;
  let validData = {};
  let message;
  try {
    validData = lead.parse(postData);
    hasError = false;
    message = "";
  } catch (error) {
    hasError = true;
    message = "invalid email, please try again.";
  }

  return {
    data: validData,
    hasError: hasError,
    message: message,
  };
};

module.exports = {
  validateLead,
};
