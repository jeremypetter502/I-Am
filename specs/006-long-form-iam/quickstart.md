# Quickstart: Generating Long Form (LF) I-AM

UI

1. Open the Generate popup from the UI.
2. Check the `Long Form` checkbox.
3. Click `Generate`.
4. The generated string appears in the output field and begins with `IAM/LF.0.1:`.

CLI / Script (example)

If you have a Node script that calls the IAM generator, pass the `format` and `lfVersion` options as shown:

```bash
node scripts/generate-iam.js --format=long_form --lfVersion=LF.0.1 --profile=examples/jeremy.petter.iam.json
```

The generated output will be printed to stdout or saved depending on the script's options and will start with `IAM/LF.0.1:`.
