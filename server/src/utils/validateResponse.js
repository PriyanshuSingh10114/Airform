const shouldShowQuestion = require("./shouldShowQuestion");

module.exports = function validateResponse(form, answers) {
  const errors = [];

  for (let q of form.questions) {
    const visible = shouldShowQuestion(q.conditional, answers);
    const val = answers[q.questionKey];

    if (!visible) continue;

    if (q.required && !val) {
      errors.push(`${q.label} is required`);
      continue;
    }

    if (q.type === "single_select" && val && !q.options.includes(val)) {
      errors.push(`${q.label} has invalid value`);
    }

    if (q.type === "multi_select" && val) {
      if (!Array.isArray(val)) {
        errors.push(`${q.label} must be an array`);
      } else {
        val.forEach(v => {
          if (!q.options.includes(v)) {
            errors.push(`${q.label} contains invalid value`);
          }
        });
      }
    }
  }

  return errors;
};
