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
      return [];
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
    // console.log(await this.readExpenses());
    const data = this.readExpenses();
    const newExpense = { amount, category, date };
    data.push(newExpense);

    this.writeExpenses(data);

    // console.log("this is the new expense => ", newExpense);
    // console.log(amount, category, date, "from the method");
  }
}

module.exports = ExpenseTracker;
