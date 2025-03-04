# CI/CD Workflow for Documentation Generation

This file provides a GitHub Actions workflow for automatically generating documentation when code is pushed to the repository.

## Workflow File: `.github/workflows/docs.yml`

```yaml
name: Generate Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install GraphViz
        run: sudo apt-get update && sudo apt-get install -y graphviz

      - name: Generate documentation
        run: npm run docs

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

## Workflow Description

This workflow automatically generates documentation when code is pushed to the `main` branch or when a pull request is created against the `main` branch. It performs the following steps:

1. **Checkout code**: Checks out the repository code.
2. **Setup Node.js**: Sets up Node.js with the specified version.
3. **Install dependencies**: Installs the project dependencies.
4. **Install GraphViz**: Installs GraphViz, which is required for generating dependency graphs.
5. **Generate documentation**: Runs the documentation generation script.
6. **Deploy to GitHub Pages**: Deploys the generated documentation to GitHub Pages (only for pushes to the `main` branch).

## GitHub Pages Configuration

To host the documentation on GitHub Pages, you need to configure your repository:

1. Go to your repository on GitHub.
2. Click on "Settings".
3. Scroll down to the "GitHub Pages" section.
4. Select the `gh-pages` branch as the source.
5. Click "Save".

The documentation will be available at `https://<username>.github.io/<repository>/`.

## Environment Variables

The workflow uses the following environment variables:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions, used for deploying to GitHub Pages.

## Customization

You can customize the workflow by:

- Changing the branches that trigger the workflow.
- Adding additional steps, such as running tests or linting.
- Modifying the deployment configuration, such as changing the publish directory or adding a custom domain.

## Integration with Pull Requests

The workflow runs on pull requests to ensure that documentation changes are valid before merging. This helps catch documentation issues early in the development process.

When a pull request is created or updated, the workflow will:

1. Generate the documentation.
2. Check for any errors in the documentation generation process.
3. Report the status of the documentation generation in the pull request.

## Scheduled Documentation Updates

You can also add a schedule to the workflow to periodically regenerate the documentation, ensuring it stays up-to-date even if code changes don't trigger the workflow:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Run every Sunday at midnight
```

## Manual Workflow Trigger

You can also add a manual trigger to the workflow, allowing you to generate documentation on demand:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

This adds a "Run workflow" button to the Actions tab in your repository, allowing you to manually trigger the documentation generation.
