const shouldShowQuestion = require("./shouldShowQuestion");

module.exports = function validateResponse(form, answers) {
  const errors = [];

  for (let q of form.questions) {
    const visible = shouldShowQuestion(q.conditional, answers);
    const val = answers[q.questionKey];

    if (!visible) continue;

    if (q.required && (!val || (Array.isArray(val) && val.length === 0))) {
      errors.push(`${q.label} is required`);
      continue;
    }

    if (q.type === "singleSelect" && val) {
      const valid = q.options.some(opt => (opt.name || opt) === val);
      if (!valid) errors.push(`${q.label} has invalid value`);
    }

    if (q.type === "multipleSelects" && val) {
      if (!Array.isArray(val)) {
        errors.push(`${q.label} must be an array`);
      } else {
        val.forEach(v => {
          const valid = q.options.some(opt => (opt.name || opt) === v);
          if (!valid) errors.push(`${q.label} contains invalid value`);
        });
      }
    }
  }
  return errors;
};
