# rest_suite


Server-side Javascript library that wraps parts of the Netsuite SuiteScript API (v2010.1).  This
interface should be more performant than the SOAP based interface as it allows 50
simultaneous connections per set of login credentials.  Note that NetSuite's point
system is seemingly arbitrary and we've tried to provide better error handling 
wherever possible.

## Contributing to netsuite-rest-client

rest_suite is built on vanilla JavaScript, using node and jasmine to provide a testing environment.  We
suspect that NetSuite is using a version of Mozilla's JavaScript interpreter, but we can't be entirely sure.
This is the reason that we chose vanilla JavaScript over an alternative like CoffeeScript.  Cross compliation
issues could be a nightmare as NetSuite is not to be trusted.  Where possible, be explicit and direct with 
your code.

### Getting Up and Running

 - Install node.js and npm
 - Run `./jspec`

### General Contribution Process

 - Check out the latest master to make sure the feature hasn't been implemented or the bug hasn't been fixed yet
 - Check out the issue tracker to make sure someone already hasn't requested it and/or contributed it
 - Fork the project
 - Start a feature/bugfix branch and commit atomically
 - Commit and push until you are happy with your contribution
 - Be sure to test your code and make sure that all tests pass before submitting a pullrequest.

## Copyright

Copyright (c) 2012 Acumen Brands, Inc. See LICENSE.txt for
further details.

## Usage

Generally, each individual script is to be uploaded to NetSuite as a single endpoint with a single function being
exposed.  These functions are documented throughout the project and should be relatively easy to ferret out.

### Uploading to NetSuite

We would appreciate it if someone with solid NetSuite understanding could fill this section in.

### jspec

We've added some handy tools in `jspec` to perform most of the mundane tasks associated with the project.
Here's a quick reference:

 - `./jspec` Set up your environment and run all tests
 - `./jspec --doc` Generate HTML documentation in `doc/` with JSDoc3
 - `./jspec --reset` Glear out installed node modules
 - `./jspec --mono`  Run tests without color
 - `./jspec --debug` Fire up a node debugger with jasmine
 
## Documentation

HTML formatted documentation can be found in `doc`.  This has been generated with JSDoc3 and
includes documentation provided by NetSuite for SuiteScript v2010.1 for easy reference.  Documentation
is re-generated for each tagged release.  If you'd like to generate docs on the fly, simply run `./jspec --doc`

 - Generally, anywhere you see `id` mentioed, it can safely be assumed to be `internal_id` in netsuite
 - Each script has one endpoint and only one endpoint.  This is due to the nature of NetSuite's RESTlet interface.
 - Furthermore, each endpoint should respond to a POST request
 - All actions for a given endpoint are taken based on the request body of the POST

### Basic Input Reference

This is a basic overview of the JSON object payload for each request. A '+' next to a row
indicates an array; a '-' indicates a key in a hash.

## Initialize

# Description
# Request Structure
    -record_type

## Load/Delete

# Description
# Request Structure
    + single record action
      - id
      - record_type

## Upsert/Transform

# Description
# Request Structure
    + single record action
      - id
      - record_type
      + literals
        + sublists
          - name
          + line_items
            + create_or_update
              - match_field
              - literals
            + excise
              - match_field (unique field to search against)
              - value

## Saved Search

# Description
# Request Structure
    - record_type
    - search_id
    - lower_bound
    - batch_size

## Search (Ad-Hoc)

# Description
# Request Structure
    - record_type
    - batch_size
    - lower_bound
    + search_filters
      - name
      - operator
      - value
      - formula (optional)
        - field
        + values
        - comparison
        - join
    + search_columns
      - name
      - join
      - sort (boolean)
