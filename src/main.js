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
  .command("read")
  .description("reading a expense from list")
  .action(async () => {
    const data = await exp.readExpenses();
    const answer = await select({
      message: "Select a things you want",
      choices: [
        { name: "amount", value: "amount", description: "Show only amount" },
        {
          name: "category",
          value: "category",
          description: "Show only category",
        },
        { name: "date", value: "date", description: "Show only date" },
        {
          name: "description",
          value: "description",
          description: "Show only description",
        },
        { name: "all", value: "all", description: "Show all record" },
      ],
      default: "all",
    });

    if (answer === "all") {
      let table = new Table({
        head: ["ID", "description", "category", "date", "amount"],
        colWidths: [40, 30],
        colAligns: true,
        rowAligns: true,
        style: {
          "padding-left": 1,
          "padding-right": 1,
          border: [],
        },
        rowHeights: [0.5],
      });
      data.map((item) => {
        table.push([
          `${item.id}`,
          `${[item.description]}`,
          `${[item.category]}`,
          `${[item.date]}`,
          `${[item.amount]}`,
        ]);
      });
      console.log(table.toString());
    }
    if (answer === "amount") {
      let table = new Table({
        head: ["ID", "amount", "description"],
        colWidths: [40, 30],
        colAligns: true,
        rowAligns: true,
        style: {
          "padding-left": 1,
          "padding-right": 1,
          border: [],
        },
        rowHeights: [0.5],
      });
      data.map((item) => {
        table.push([`${item.id}`, `${item.amount}`, `${item.description}`]);
      });
      console.log(table.toString());
    }
    if (answer === "category") {
      let table = new Table({
        head: ["ID", "category", "description", "amount"],
        colWidths: [40, 30],
        colAligns: true,
        rowAligns: true,
        style: {
          "padding-left": 1,
          "padding-right": 1,
          border: [],
        },
        rowHeights: [0.5],
      });

      console.log("Data:", data); // Debugging log for data

      data.map((item) => {
        table.push([
          `${item.id}`,
          `${item.category}`,
          `${item.description}`,
          `${item.amount}`,
        ]);
      });
      console.log(table.toString());
    }
    if (answer === "date") {
      let table = new Table({
        head: ["ID", "date", "amount"],
        colWidths: [30, 40],
        colAligns: true,
        rowAligns: true,
        style: {
          "padding-left": 0,
          "padding-right": 0,
          border: [],
        },
        rowHeights: [0.5],
      });
      data.map((item) => {
        table.push([`${item.id}`, `${item.date}`, `${item.amount}`]);
      });
      console.log(table.toString());
    }
    if (answer === "description") {
      let table = new Table({
        head: ["ID", "description", "amount"],
        colWidths: [40, 30],
        colAligns: true,
        rowAligns: true,
        style: {
          "padding-left": 1,
          "padding-right": 1,
          border: [],
        },
        rowHeights: [0.5],
      });
      data.map((item) => {
        table.push([`${item.id}`, `${item.description}`, `${item.amount}`]);
      });
      console.log(table.toString());
    }
  });

program.parse(process.argv);
