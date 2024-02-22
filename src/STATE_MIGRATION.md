##Notes
#### Installation
It is likely there will be an OpenSSL error the first time you try to build or run the editor. It is necessary to run the following `export NODE_OPTIONS=--openssl-legacy-provider`. This instructs node to allow the use of the legacy open ssl provider. This is necessary as we are using a version of angular that still uses this legacy provider, but never versions of node complain about this by default.

rxjs@^6.5.3
@ngxs/store@^3.7.2

Have been introduced to the editor. These specific versions are aligned with our current version of angular (10.0.7). The intention is to upgrade our angular version once the state library has been replaced.

#### Unit Tests
There are unit tests for the two state containers as of (16/02/2024), but as the entire test suite is broken these will not run unless the parent `describe` function calls of the spec files are replaced with focus describes `fdescribe`.

When writing new tests for the state containers remember you aren't testing the components or services that interact with the state, only the state container itself. Testing the logic within callback functions of service calls within state containers is within scope of this definition. Will provide an example when a working one is in place.