import { toContextFile } from "./src/lib/serializer/toContextFile.js";
import fs from "fs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const state = { bandwidth: 30, mode: "convergent", horizon: "now", stakes: "critical" };
const skills = {
    responses: [
        {
            name: "Reading Comprehension",
            index: 1,
            normalized_score: 90,
            listed_status: "confirmed"
        }
    ],
    testAnswers: {
        1: {
            interview_defense: true,
            day_one_autonomy: true,
            relevance_recency: false
        }
    }
};

const sample = toContextFile(
    { id: "state-rt", summary: "state round trip", traits: { O: 10, C: 20, E: 30, A: 40, N: 50 } },
    {
        ipipResponses: Array(50).fill(3),
        state,
        skills
    }
);

const schema = JSON.parse(fs.readFileSync("specs/001-personality-context-site/contextfile.schema.json", "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const valid = ajv.validate(schema, sample);
if (!valid) {
    console.log(JSON.stringify(ajv.errors, null, 2));
} else {
    console.log("Validation Passed!");
}
