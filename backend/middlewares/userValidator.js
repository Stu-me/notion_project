const { z } = require('zod');

const userInputValidator = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
});

const userLoginValidator = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

module.exports = {
    userInputValidator,
    userLoginValidator
};