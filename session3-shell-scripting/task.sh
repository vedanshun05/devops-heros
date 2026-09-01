#!/bin/bash

date
hostname
whoami

df -h
ps

# Uses variables to store and use data
name="Vedanshu"
roll_no="24bcs10285"
echo "My name is $name"
echo "My roll_no is $roll_no"

# Takes user input
read -p "Enter a comment : " comment
echo "My comment: $comment"

mkdir task_files
touch process.log

ps > process.log
