#!/usr/bin/env node

const { Command } = require("commander");
const path = require("node:path");
const { input } = require("@inquirer/prompts");

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
  .option("-c, --category <category>", "select the category of expense")
  .option("-d, --date <date-string>", "considered date in YYYY-MM-DD format")
  .action(async (options) => {
    let amount = options.amount;
    let category = options.category;
    let date = options.date;
    if (!amount) {
      amount = await input({ message: "How much you've spend?" });
    }

    if (!category) {
      category = await input({
        message: "What's the category fits the expense?",
      });
    }

    if (!date) {
      date = await input({
        message: "When did you do that? (enter in YYYY-MM-DD format, please)",
      });
    }

    // console.log(amount, category, date);
    exp.addExpense(amount, category, date);
  });

program.parse(process.argv);
