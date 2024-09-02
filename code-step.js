const util = require('util');

const branch = process.argv[2];
const command = process.argv[3];
const { execSync } = require('child_process');
console.log({ branch });
const headCommit = execSync('git --no-pager log --format="%H" -1')
  .toString()
  .trim();
const branchCommits = execSync('git --no-pager log --format="%H" -50 ' + branch)
  .toString()
  .split('\n');
const headCommitIndex = branchCommits.indexOf(headCommit);
switch (command) {
  case 'start': {
    if (headCommitIndex <= 0) {
      console.log('No more commits in this branch');
    }
    console.log('Cherry-picking commit: ', branchCommits[headCommitIndex - 1]);
    const nextCommit = branchCommits[headCommitIndex - 1];
    console.log(execSync('git reset --hard HEAD').toString());
    console.log(execSync('git cherry-pick -n ' + nextCommit).toString());
    break;
  }
  case 'next': {
    if (headCommitIndex <= 0) {
      console.log('No more commits in this branch');
    }
    const currentCommit = branchCommits[headCommitIndex - 1];
    const nextCommit = branchCommits[headCommitIndex - 2];
    console.log('Cherry-picking commit: ', nextCommit);
    console.log(execSync(`git reset --hard ${currentCommit}`).toString());
    console.log(execSync('git cherry-pick -n ' + nextCommit).toString());
    break;
  }
  case 'prev': {
    if (headCommitIndex < branchCommits.length - 1) {
      const currentCommit = branchCommits[headCommitIndex + 1];
      const prevCommit = branchCommits[headCommitIndex];
      console.log('Cherry-picking commit: ', prevCommit);
      console.log(execSync(`git reset --hard ${currentCommit}`).toString());
      console.log(execSync('git cherry-pick -n ' + prevCommit).toString());
    } else {
      console.log('Already at the first');
    }
    break;
  }
}

// console.log({ headCommitIndex, branchCommits, headCommit });
