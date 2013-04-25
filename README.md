rest_suite
==========

Server-side Javascript library that wraps parts of the Netsuite SuiteScript API

note
----

 - when `id` is seen, it can generally be assumed to be `internal_id` in netsuite
 - each script is its own endpoint
 - every object within the scrips are private
 - every endpoint is a post
 - actions are taken based on the request body of the post

data-struct reference
---------------------

Build out README sections to explain each key.

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
