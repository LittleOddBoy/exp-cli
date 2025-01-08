#!/usr/bin/env node

const { Command } = require("commander");
const path = require("node:path");
const { input } = require("@inquirer/prompts");
const colors = require("yoctocolors-cjs");

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

program.parse(process.argv);
