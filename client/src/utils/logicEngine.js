/**
 * Evaluates whether a question should be shown based on rules and current answers.
 * @param {Object} rules - The conditional rules configuration ({ logic: "AND"|"OR", conditions: [] })
 * @param {Object} answers - Current state of answers ({ questionKey: value })
 * @returns {boolean} - True if the question should be visible
 */
export function shouldShowQuestion(rules, answers) {
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return true;
    }

    const { logic, conditions } = rules;

    // Evaluate each condition
    const results = conditions.map((condition) => {
        const { questionKey, operator, value } = condition;
        const answer = answers[questionKey];

        // Handle missing answers (undefined/null) safely
        if (answer === undefined || answer === null) return false;

        // Convert values to strings for comparison to be safe, or handle types loosely
        const answerStr = String(answer).toLowerCase();
        const valueStr = String(value).toLowerCase();

        switch (operator) {
            case "equals":
                return answerStr === valueStr;
            case "notEquals":
                return answerStr !== valueStr;
            case "contains":
                return answerStr.includes(valueStr);
            default:
                return false;
        }
    });

    if (logic === "OR") {
        return results.some((r) => r === true);
    } else {
        // Default AND
        return results.every((r) => r === true);
    }
}
