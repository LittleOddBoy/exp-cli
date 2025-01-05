#!/usr/bin/env node

const { Command } = require("commander");

const program = new Command();

program
  .name("exp")
  .description(
    "A expense CLI tool as a solution to track your monthly/yearly finance"
  )
  .version("0.0.1");

program
  .command("test")
  .description("just a test")
  .action(() => console.log("hello"));

program.parse(process.argv);
