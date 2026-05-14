# Contracts

This folder contains interface contracts for ContextFile import/export and any public APIs.

Current artifacts:
- contextfile.proto — protobuf contract for ContextFile
- contextfile.schema.json — JSON schema for ContextFile

Guidance: Use protobufjs to load .proto in the client for pbtxt serialization/deserialization.
