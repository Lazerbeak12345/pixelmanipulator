# Guidelines for contributing to pixelmanipulator

## Issues

1. Make it clear what the issue is.
2. Supply enough information so that testers can find this bug on their own, using the information you provided.

## Pull requests

1. Make it clear why the change that is being proposed should be pulled into master.
	* Is it a issue, or a feature?
	* If it has, to your knowledge, something to do with a previous issue or pull-request, mention it.
	* Explain what the change does.
	* Make sure that the modified code has at least one comment clarifiying what the code does, and if neede, how it does it.
2. Keep things as backwards compatible as possible.
3. Let me handle re-versioning of software. This guarantees an absence of merge conflicts. If you wish to know how I do the versioning

## Versioning

When it comes to versioning, let me handle the version iteration, but for those who want to know how I am handleing the versioning, there are several parts.
Let's see an example of these parts:

         /The first number is the major version number. It indicates a drastic differance in how one interacts with the library. And iterates once per turn of the release cycle identifier.
         |                     /The last section indicates what type of release this is, it is the release cycle identifier. It can either be LTS, alfa, alfa-proposed, beta, or beta-proposed.
        v1.65.144 (beta-proposed)
            |   \The third number indicates the number of bug patches there are. It iterates once per bug patch. This section can, at times, be ommitted due to the potential frequency of it's changing. This section never resets to zero.
            \The second number is the feature number. It iterates once per non-bug-related feature added in this example, there are 65 modifications to the code that don't qualify as bug patches. and are, as such, features. This number never resets to zero.

There is also another syntax: `1.61`. This syntax is to be used in general terms _only_.
As it is plain to see, the first number is the major version number from above, and the second is the feature number from above.
    
