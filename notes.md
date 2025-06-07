## 2025-06-06 create website [claude]

Create a website for oceanmetrics.github.io using Quarto. Include a landing page 
with splash banner, an overview of the project and a document listing of 
applications. Include an example application.

Generate a background image for the splash banner for both dark and light themes 
that connotes oceans, marine life and data, such as a tesselated wave with 
graph-like dots connecting facets.

### Response

⏺ Website created with:
  - Landing page with splash banner (index.qmd)
  - Project overview section with feature cards
  - Applications listing page (applications.qmd)
  - Example ocean temperature monitoring application with interactive visualizations
  - Custom CSS styling for hero banner and responsive design

To build the site, run: quarto render

⏺ Created two SVG background images:
  - ocean-waves-light.svg - Light theme with blue tessellated waves and cyan data points
  - ocean-waves-dark.svg - Dark theme with brighter colors and glowing data points

  Both feature:
  - Tessellated wave patterns at multiple layers
  - Connected data points forming a graph-like network
  - Subtle marine life silhouettes (fish and whale tail)
  - Responsive to light/dark theme preferences

  The CSS has been updated to use these backgrounds automatically based on theme.
