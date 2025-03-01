#!/usr/bin/env node

const { Command } = require("commander");
const path = require("node:path");
const { input, select } = require("@inquirer/prompts");
const colors = require("yoctocolors-cjs");
const Table = require("cli-table3");

const ExpenseTracker = require("./ExpenseTracker");

const storageFile = path.join(__dirname, "../exps.json");
const program = new Command();
const exp = new ExpenseTracker(storageFile);

program
  .name("exp")
  .description(
    "A expense CLI tool as a solution to track your monthly/yearly finance"
  )
  .version(
    "0.0.1",
    "-v, --version",
    "output the current version of the program"
  );

program
  .command("add")
  .description("Add a new expense")
  .option("-a, --amount <integer>", "specify the expense amount")
  .option("-s, --description <string>", "a description for the expense")
  .option("-c, --category <category>", "select the category of expense")
  .option("-t, --date <date-string>", "considered date in YYYY-MM-DD format")
  .action(async (options) => {
    // evaluate parameters if their argument has been passed
    let amount = options.amount;
    let category = options.category;
    let date = options.date;
    let description = options.description;

    // ask for parameters if any of them they haven't been passed
    if (!amount) amount = await input({ message: "How much you've spend?" });

    if (!category)
      category = await input({
        message: "What's the category fits the expense?",
      });

    if (!date)
      date = await input({
        message: "When did you do that? (enter in YYYY-MM-DD format, please)",
      });

    if (!description)
      description = await input({
        message: "Write a description for your expense",
      });

    // validate the amount and handle invalid cases
    if (!exp.isValidAmount(amount)) {
      console.log(
        colors.bgRed(
          "The entered amount is not valid (it should be a non-negative with at last 2 decimal points"
        )
      );
      return;
    }

    // validate the data and handle invalid formats
    if (!exp.isValidDate(date)) {
      console.log(
        colors.bgRed("The format of the date that was entered is not correct!")
      );
      return;
    }

    // validate the description and handle too long texts
    if (description.length > 50) {
      console.log(
        colors.bgRed("The description should be less than 50 characters")
      );
      return;
    }

    // add the expense
    await exp.addExpense(amount, description, category, date);
  });

program
  .command("remove")
  .description("remove a expense from a list of choices")
  .action(async () => {
    // create a list of choices from the current data
    const data = await exp.readExpenses();
    const choices = data.map((item) => {
      return {
        name: item.description,
        value: item.id,
        description: `category: ${item.category}, date: ${item.date}`,
      };
    });

    // display the list of choices to select
    const id = await select({
      message: "Choose which expense you wanna delete",
      choices,
    });

    // remove the expense
    exp.removeExpense(id);
  });


  program
  .command("list")
  .description("List all expenses with optional filters and dynamic fields")
  .option("--amount", "Include the amount of the expense")
  .option("--category", "Include the category of the expense")
  .option("--date", "Include the date of the expense")
  .action(async (options) => {
    const data = await exp.readExpenses();

    if (!data.length) {
      console.log(colors.yellow("No expenses found!"));
      return;
    }

    // If no options are specified, default to showing all properties
    const showAllProperties = !options.amount && !options.category && !options.date;

    // Initialize the CLI table with headers
    const headers = ["Description"]; // Always include "Description"
    if (showAllProperties || options.amount) headers.push("Amount");
    if (showAllProperties || options.category) headers.push("Category");
    if (showAllProperties || options.date) headers.push("Date");

    const table = new Table({
      head: headers.map((header) => colors.cyan(header)), // Add colors to headers
      style: { border: [], head: [], compact: true },
    });

    // Add rows dynamically
    data.forEach((expense) => {
      const row = [expense.description]; // Always include "Description"
      if (showAllProperties || options.amount) row.push(expense.amount);
      if (showAllProperties || options.category) row.push(expense.category);
      if (showAllProperties || options.date) row.push(expense.date);

      table.push(row); // Add the row to the table
    });

    // Display the table
    console.log(table.toString());
  });


program
  .command("update")
  .description("update record")
  .description("Add a new expense")
  .option("-a, --amount <integer>", "specify the expense amount")
  .option("-s, --description <string>", "a description for the expense")
  .option("-c, --category <category>", "select the category of expense")
  .option("-t, --date <date-string>", "considered date in YYYY-MM-DD format")
  .action(async (options) => {
    // evaluate parameters if their argument has been passed

    const data = await exp.readExpenses();

    const choices = data.map((item) => {
      return {
        name: item.description,
        value: item.id,
        description: `category: ${item.category}, date: ${item.date}`,
      };
    });
    const id = await select({
      message: "Choose item want update",
      choices: choices,
    });

    let amount = options.amount;
    let category = options.category;
    let date = options.date;
    let description = options.description;

    // ask for parameters if any of them they haven't been passed

    if (!amount) amount = await input({ message: "How much you've spend?" });

    if (!category)
      category = await input({
        message: "What's the category fits the expense?",
      });

    if (!date)
      date = await input({
        message: "When did you do that? (enter in YYYY-MM-DD format, please)",
      });

    if (!description)
      description = await input({
        message: "Write a description for your expense",
      });

    // validate the amount and handle invalid cases
    if (!exp.isValidAmount(amount)) {
      console.log(
        colors.bgRed(
          "The entered amount is not valid (it should be a non-negative with at last 2 decimal points"
        )
      );
      return;
    }

    // validate the data and handle invalid formats
    if (!exp.isValidDate(date)) {
      console.log(
        colors.bgRed("The format of the date that was entered is not correct!")
      );
      return;
    }

    // validate the description and handle too long texts
    if (description.length > 50) {
      console.log(
        colors.bgRed("The description should be less than 50 characters")
      );
      return;
    }
    await exp.updateExpense(id, amount, description, category, date);
  });
program.parse(process.argv);
