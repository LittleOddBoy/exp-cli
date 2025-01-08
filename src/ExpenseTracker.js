const { existsSync, writeFileSync } = require("node:fs");
const fs = require("node:fs/promises");
const colors = require("yoctocolors-cjs");

class ExpenseTracker {
  constructor(storageFile) {
    this.storageFile = storageFile;

    if (!existsSync(this.storageFile)) {
      const defaultData = [];
      writeFileSync(this.storageFile, JSON.stringify(defaultData, null, 2));
    }
  }

  async readExpenses() {
    try {
      const data = await fs.readFile(this.storageFile, "utf-8");
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
      await fs.writeFile(this.storageFile, JSON.stringify(expenses));
    } catch {
      console.log(
        colors.red("Something unexpected happened in file saving process.")
      );
    }
  }

  async addExpense(amount, description, category, date) {
    const data = await this.readExpenses();
    const newRecord = {
      id: crypto.randomUUID(),
      amount,
      description,
      category,
      date,
    };
    data.push(newRecord);
    this.writeExpenses(data);
    console.log(colors.green("Your task have been added successfully!"));
  }

  isValidDate(dateStr) {
    // check if the date has a valid YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    const date = new Date(dateStr);
    // Ensures exact match
    return date.toISOString().startsWith(dateStr);
  }

  isValidAmount(amount) {
    // Matches integers or floats with up to 2 decimal places
    const amountRegex = /^\d+(\.\d{1,2})?$/;

    // Fails format validation
    if (!amountRegex.test(amount)) return false;

    const num = parseFloat(amount);

    // Ensures it's a valid, non-negative number
    return !isNaN(num) && num >= 0;
  }
}

module.exports = ExpenseTracker;
