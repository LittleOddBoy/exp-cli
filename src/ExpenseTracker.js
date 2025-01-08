const fs = require("node:fs");
const colors = require("yoctocolors-cjs");

class ExpenseTracker {
  constructor(storageFile) {
    this.storageFile = storageFile;

    if (!fs.existsSync(this.storageFile)) {
      const defaultData = [];
      fs.writeFileSync(this.storageFile, JSON.stringify(defaultData, null, 2));
    }
  }

  readExpenses() {
    try {
      const data = fs.readFileSync(this.storageFile, "utf-8");
      return JSON.parse(data);
    } catch {
      console.log(
        colors.red(
          "We couldn't read your expenses history, something unexpected happened."
        )
      );
    }
  }

  async writeExpenses(expenses) {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(expenses));
    } catch {
      console.log(
        colors.red("Something unexpected happened in file saving process.")
      );
    }
  }

  async addExpense(amount, category, date) {
    const data = this.readExpenses();
    const newRecord = { id: crypto.randomUUID(), amount, category, date };
    data.push(newRecord);
    this.writeExpenses(data);
  }

  isValidDate(dateStr) {
    // check if the date has a valid YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    const date = new Date(dateStr);
    // Ensures exact match
    return date.toISOString().startsWith(dateStr);
  }
}

module.exports = ExpenseTracker;
