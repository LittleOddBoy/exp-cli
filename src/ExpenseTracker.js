const { existsSync, writeFileSync } = require("node:fs");
const fs = require("node:fs/promises");
const { select } = require("@inquirer/prompts")
const colors = require("yoctocolors-cjs");

class ExpenseTracker {
  constructor(storageFile) {
    this.storageFile = storageFile;

    // check if the file exists to handle initializing the storage file 
    if (!existsSync(this.storageFile)) {
      const defaultData = [];
      writeFileSync(this.storageFile, JSON.stringify(defaultData, null, 2));
    }
  }

  /**
   * Returns the latest data within the storage file
   * @returns {array} 
   */
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

  /**
   * Update the storage file with provided array of expenses
   * @param {array} expenses modified data of expense
   */
  async writeExpenses(expenses) {
    try {
      await fs.writeFile(this.storageFile, JSON.stringify(expenses));
    } catch {
      console.log(
        colors.red("Something unexpected happened in file saving process.")
      );
    }
  }

  /**
   * Add a new record of expense into the storage file
   * @param {number | string} amount 
   * @param {string} description 
   * @param {string} category 
   * @param {string} date 
   */
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

  /**
   * Returns whether the provided date string is valid ISO YYYY-MM-DD
   * @param {string} dateStr the date in string format that want to be validated
   * @returns {boolean}
   */
  isValidDate(dateStr) {
    // check if the date has a valid YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;

    const date = new Date(dateStr);
    // Ensures exact match
    return date.toISOString().startsWith(dateStr);
  }

  /**
   * returns whether the provided amount is a valid non-negative number with at last two decimal points 
   * @param {string} amount the string of amount you wanna validate
   * @returns {boolean}
   */
  isValidAmount(amount) {
    // Matches integers or floats with up to 2 decimal places
    const amountRegex = /^\d+(\.\d{1,2})?$/;

    // Fails format validation
    if (!amountRegex.test(amount)) return false;

    const num = parseFloat(amount);

    // Ensures it's a valid, non-negative number
    return !isNaN(num) && num >= 0;
  }

  /**
   * Remove a specific expense record based on its id
   * @param {string} id the uuid of the expense
   */
  async removeExpense(id) {
    const data = await this.readExpenses();
    const modifiedData = data.filter((item) => item.id !== id);

    await this.writeExpenses(modifiedData);
  }

}

module.exports = ExpenseTracker;
