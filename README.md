# rest_suite

Server-side Javascript library that wraps parts of the Netsuite SuiteScript API (v2010.1).  This
interface should be more performant than the SOAP based interface as it allows 50
simultaneous connections per set of login credentials.  Note that NetSuite's point
system is seemingly arbitrary and we've tried to provide better error handling 
wherever possible.

**NOTE:** This is being designed as a replacement for [netsuite-rest-client](https://github.com/acumenbrands/netsuite-rest-client).

*Brought to you by the NetSuite Liberation Front*

## Contributing to rest_suite

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

The process of deployment is a somewhat involved manual process at the moment. It is possible
to wrap all files into a zip and automate the process via a manifest, but this has not yet been
implemented. Many files contain multiple classes that would normally exist in their own files
specifically for this reason. The deploy process is painful enough as it is.

In the NetSuite web interface, go to the documents dropdown and select:

 - Documents->Files->SuiteScripts

Upload all .js files in lib here.  Now go to Setup -> Customization -> Scripts -> New.

Create a new Script record using each operation file. List netsuite_toolkit.js as an included library on each.
The script record also assigns each HTTP function to a provided function name. In each Script,
reference the appropriate post handler function in the "POST" text box. The function names should
be provided without parentheses: `deletePostHandler()` just becomes `deletePostHandler`.

From each Script record, generate a Script Deployment with an appropriate role/employee/account
access for the credentials your client will be using. NetSuite calculates these permissions
inclusively, so if one criteria out of any of them matches your credentials, it will provide access.

The Script Deployment will list the endpoint URL to which you will send requests with the JSON body
for the script's parameters.

### Making Requests

The Script Deployment records will list endpoint URLs that you POST your JSON objects to. Simply build the JSON
object and include it as the request body. The authentication header must include your account credentials
assigned to the following variables in a string assigned to 'authorization' in your request header.

    "NLAuth nlauth_account=<business account id>,nlauth_email=<login email>,nlauth_signature=<password>,nlauth_role=<role_id>"

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

# Basic Input Reference

This is a basic overview of the JSON object payload for each request. A '+' next to a row
indicates an array; a '-' indicates a key in a hash.

## Initialize

### Description

Initialize returns a blank record of the given type with all mandatory keys pre-populated with null or default values. This does not expose non-mandatory fields in the returned hash, those must be filled in manually client-side.

### Request Structure
    -record_type

## Load

### Description

Load will request a given record from the Netsuite database by internalid. It will return the
requested record will all mandatory and populated schema. Non-mandatory and custom fields with
blank values will not be populated in the returned hash.

### Request Structure
    + single record action
      - id
      - record_type

## Delete

### Description

Delete will destroy records in Netsuite's database. If successful, the id of the removed record
will be returned. Otherwise, an exception will be raised.

### Request Structure
    + single record action
      - id
      - record_type

## Upsert

### Description

Upsert requests a new records be written to the database or an existing record be altered.
If an internalid is present id the 'id' field, then it will attempt to update a record
loaded using the type and id, otherwise throwing an exception if it does not exists. If no
id is present, it will attempt to create a new record using the values given.

### Request Structure
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

## Transform

### Description

Transform initializes a new transaction from another transaction record in a workflow. In this case
sublist items can be filtered (altered somewhat or removed if need be) but cannot be added if they
do not exist on the original transaction. A record is is mandatory for transform.

### Request Structure
    + single record action
      - id
      - source_type
      - result_type
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

### Description

Saved search will request the results of an already created saved search from Netsuite. Results
*must* be sorted by internalid of the records returned in order to properly paginate the results.
This is a limitation of the SuiteScript environment that we have not yet found a workaround for.

### Request Structure
    - record_type
    - search_id
    - lower_bound
    - batch_size

## Search (Ad-Hoc)

### Description

Search allows you to build a search on the fly. As with saved searches, results generally should
be filtered by internalid, however with ad-hoc search this is not mandatory. If another criteria
could reasonably be used to sort, the sort boolean is exposed for the client to use. If multiple
result columns have this set to true, only the last column in the list will be processed. A column
to sort by internalid is always added, so if no sort is provided the search will always be sorted
by internalid.

Formula filtering is also exposed and is a required alternative to explicit string matching in
RESTlet operation to avoid hitting the execution limit. It produces a SQL function that results
in 1 or 0. In the event a formula search is used, the name of the filter must be 'formulanumeric',
the value must be 'IS', and the value will be 1 or 0.

For the formula:
  - name:       The field on which the script is filtering
  - values:     An array of possible values, the comparison is
  - comparison: A valid SQL comparison or equality operator
  - join:       'AND' or 'OR' to join all comparisons of 'field' to a single value

### Request Structure
    - record_type
    - batch_size
    - lower_bound
    + search_filters
      - name
      - operator
      - value
      - join (optional)
      - formula (optional)
        - field
        + values
        - comparison
        - join
    + search_columns
      - name
      - join
      - sort (boolean)
