# Guidelines for contributing to pixelmanipulator

## Local setup

1. Make sure you have `yarn` installed globally.
2. Clone the project locally
3. `yarn set version berry` will enable use of the latest vesrion of yarn for this project.
3. `yarn install`

## Running code locally

1. `yarn watch`
2. Open the url it gives you on a fairly new browser (as watch mode, unlike
   production, does not apply as many polyfills)

## Updating the demo and the docs

Run `yarn updatedemo` (only works if you have push privs)

## Building

Run `yarn build`

All files are either in `/docs` or in `/dist`. You can see the specifics in `/package.json`

## Issues

1. Make it clear what the issue is.
2. Supply enough information so that testers can find this bug on their own, using the information you provided.

## Pull requests

When doing a pull request, follow these steps:

1. Make a fork of the repository
2. Clone that fork to your computer where you will be modifying the code (if not using the web ide)
3. Make fork master into a new branch where the title is a clear, yet consise summary of your planned changes.
4. Make your changes on that branch.
	* Keep things as backwards compatible as possible.
	* Let me handle re-versioning of software. This guarantees an absence of merge conflicts. If you wish to know how I do the versioning see [Versioning](#Versioning) below.
5. Test those changes. - I'd rather have the code tested by both myself, contributers, and the CI, then have messy or faulty code.
6. Make a pull request from your branch on your fork of my repo to the master branch on my repo.
	* The pull request must:
		* Make it clear why the change that is being proposed should be pulled into master.
    	* Is it a issue, or a feature?
    	* If it has, to your knowledge, something to do with a previous issue or pull-request, mention it.
    	* Explain what the change does.
    	* Make sure that the modified code has at least one code comment clarifiying what the code does, and if needed, how it does it.

## Versioning

When it comes to versioning, let me handle the version iteration, but
for those who want to know how I am handleing the versioning, I am
currently using [semver](https://semver.org).

I made this switch for these reasons.

1. To avoid confusion with semver, as the two formats looked identical.
2. This format was based off of semver - but with "enhancements" that I
   didn't need whatsoever. These enhancements were primarally due to
   misunderstandment of the semver standard, and due to my mistaken
   beleif that people want to know exactly how many bugs I've fixed in
   something at any point in time.
3. I've gotten used to proper semver in all of my other properly
   versioned projects.

### Versioning for old versions.

Here's the versioning rules for versions as old or older than

- `2.0.0` in the backend
- `1.21.21` in the backend.

```txt
         /The first number is the major version number. It indicates a drastic differance in how one interacts with the library. And iterates once per turn of the release cycle identifier.
         |                     /The last section indicates what type of release this is, it is the release cycle identifier. It can either be LTS, alfa, alfa-proposed, beta, or beta-proposed.
        v1.68.151 (beta-proposed)
            |   \The third number indicates the number of bug patches there are. It iterates once per bug patch. This section can, at times, be ommitted due to the potential frequency of it's changing. This section never resets to zero.
            \The second number is the feature number. It iterates once per non-bug-related feature added in this example, there are 65 modifications to the code that don't qualify as bug patches. and are, as such, features. This number never resets to zero.
```

There was also another syntax: `1.65`. This syntax is to be used in general terms _only_.
As it is plain to see, the first number is the major version number from above, and the second is the feature number from above.
