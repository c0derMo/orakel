# Oracle
A fully open-source tournament platform.

<i>Warning: This is still heavily in development.</i>

Oracle is a tournament platform (similar to Challonge or Battlefy), which can be self-hosted and expanded, and is fully open source.

## Usage:
TODO

## Development:
The project is built up in two parts: the frontend-client and the backend-server.
### Client development
All client code is inside `client`. The client is written using Vue V3.

An development server can be ran using `yarn serve`.
### Server development
All server code is inside `server`. The server is written using TypeScript & Express, with MongoDB as a database.

An development server can be ran using `yarn dev`.

## Motivation:
- Boredom
- Limited functionality / extensibility of already available tournament platforms
- Learning new technologies like Vue, MongoDB
- Learning how to build nicely looking UIs

## External code used:
These are other sources that I've used, which are not noted inside the `package.json`'s
- https://github.com/RuiChen0101/vue-tournament