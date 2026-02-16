# GitHub configuration

## Branch protection (main)

To import the main branch protection ruleset:

1. In the repo: **Settings** → **Rules** → **Rulesets**
2. Click **New ruleset** → **Import a ruleset**
3. Choose **Upload a file** and select `main-branch-protection.ruleset.json`, or paste its contents
4. Review and click **Create**

The ruleset applies to the default branch and:

- Requires pull requests (no direct pushes)
- Requires 1 approving review before merge
- Blocks branch deletion and force pushes for non-bypass users

You can add bypass actors (e.g. admins or a release bot) after import.
