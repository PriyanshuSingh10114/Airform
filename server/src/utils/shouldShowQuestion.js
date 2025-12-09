function evaluateCondition(cond, answers) {
  const left = answers?.[cond.questionKey];
  const op = cond.operator;
  const right = cond.value;

  if (left == null) return false;

  if (Array.isArray(left)) {
    if (op === "contains") return left.includes(right);
    if (op === "equals") return JSON.stringify(left) === JSON.stringify(right);
    if (op === "notEquals") return JSON.stringify(left) !== JSON.stringify(right);
  }

  if (op === "equals") return left === right;
  if (op === "notEquals") return left !== right;
  if (op === "contains") return String(left).includes(String(right));

  return false;
}

function shouldShowQuestion(rules, answers) {
  if (!rules) return true;

  const results = rules.conditions.map((c) =>
    evaluateCondition(c, answers)
  );

  return rules.logic === "AND"
    ? results.every(Boolean)
    : results.some(Boolean);
}

module.exports = shouldShowQuestion;
