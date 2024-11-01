#!/bin/bash

# Get the latest commit hash of the current branch
latest_commit=$(git rev-parse HEAD)

# Path to the file where the last known commit hash is stored
commit_file="last_commit.txt"

# Check if the commit file exists
if [ ! -f "$commit_file" ]; then
    echo "$latest_commit" > "$commit_file"
    echo "No previous commit found. Storing the latest commit."
    exit 0
fi

# Read the last known commit hash
last_commit=$(cat "$commit_file")

# Compare the latest commit with the last known commit
if [ "$latest_commit" != "$last_commit" ]; then
    echo "Commit has changed. Running ./cicid.sh"
    ./cicd.sh
    # Update the last known commit hash
    echo "$latest_commit" > "$commit_file"
else
    echo "No changes in the commit."
fi