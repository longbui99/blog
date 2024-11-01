function parse_git_hash() {
  # Get the short commit hash and truncate the first character
  git rev-parse --short HEAD 2> /dev/null | sed 's/^.\(.*\)/\1/'
}


git fetch origin

# Get the latest commit hash of the current branch from the origin
latest_commit=$(parse_git_hash)
echo $latest_commit

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
    echo "Commit has changed. Running ./cicd.sh"
    ./cicd.sh
    # Update the last known commit hash
    echo "$latest_commit" > "$commit_file"
else
    echo "No changes in the commit."
fi

echo "DONE"
