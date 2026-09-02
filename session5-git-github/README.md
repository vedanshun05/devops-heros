# Task 1

**`git commit -a -m`**

**`-a`** = shortcut for "stage every tracked file that changed, then commit" — saves a git add step, but never picks up brand-new files.

**`git commit -m`** alone commits only what's explicitly staged.

![Test 1](./Outputs/git_github_output_1.png)
![Test 2](./Outputs/git_github_ouput_2.png)
![Proof](./Outputs/git_github_output_3.png)

---

# Task 2: Git Cherry-Pick

![sandbox repo](./Outputs/git_cherry_pick_output_1.png)

## Make 2–4 commits on main

![main](./Outputs/git_cherry_pick_output_2.png)

## Create a new branch and make commits there

![feature](./Outputs/git_cherry_pick_output_3.png)

## Identify and cherry-pick one specific commit back into main

**`cherry-pick copies one specific commit's changes onto the current branch as a brand-new commit (different hash, same content/message) — unlike a merge, which brings over the whole branch history.`**

![cherry-pick](./Outputs/git_cherry_pick_output_4.png)
