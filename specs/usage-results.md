Goal: Create a UI that uses data in usage folder to show the questions and responses from various AI so a user can see the differences in the answers. The responses are different depending on the AI model selected and the given I-AM personalization string provided.

- Each markdown file has some meta data: title, Category, number of participants and a date for the questions.
- Each question in the markdown is a heading 1 markdown (single hash).
- The answers are broken down by the model (heading 2) and the answer based on one of the I-AM profile names (heading 3). An optional followup question is in heading 4.

For the website, each markdown file will render an HTML page. Initially the page shows the meta information and under that a dropdown list of all the heading 1 questions. Under the dropdown are 2 side by side panels to display the answers and allow comparison. Each panel allows the user to select the model and the personality name. This decides which answer to show in that panel.

The style and colors of the layout should mach the rest of the site.