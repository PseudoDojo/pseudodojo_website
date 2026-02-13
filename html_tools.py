from __future__ import annotations

import os
import json
import dataclasses
import plotly.io as pio

from jinja2 import Environment
from abipy.ppcodes.oncv_plotter import OncvParser

# Instanciate the jinja2 template.
env = Environment()
env.globals["zip"] = zip

# Very basic jinja2 template that allows us to use python syntax to generate HTML programmatically.
TEMPLATE = env.from_string("""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{ title }}</title>
  <!-- Include Plotly JS in the head -->
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>

<body>

<h1>{{ title }}</h1>

<!-- Show input file -->
<h2>oncvpsp input</h2>
<pre><code> {{ input_str | e }} </code></pre>

<!-- Show list of plots -->
{% for plot in plots %}
  <h2>{{ plot.title }}</h2>
  <p>{{ plot.text }}</p>
  <div class="plot">
    {{ plot.html | safe }}
  </div>
{% endfor %}

</body>
</html>
"""
)


@dataclasses.dataclass(kw_only=True)
class PlotData:
    """Collect info on a figure passed to the jinja2 template."""
    html: str
    title: str
    text: str


def write_html_from_oncvpsp_outpath(out_path: str) -> str:
    """
    "Use Jinja2 to produce an HTML page for a single pseudo and write it to disk.

    Args:
        out_path: Absolute path to the onvcpsp output file.
        json_path: Absolute path to the json file with the validation results.
            If file does not exist, ignore it as not all the pseudos have validation results.

    Returns: Absolute path to the HTML file produced.
    """
    # Read oncvpsp output file and build plotter
    parser = OncvParser(out_path).scan()

    plotter = parser.get_plotter()
    if plotter is None:
        raise RuntimeError(f"Cannot build plotter from {out_path=}")

    def to_html(fig):
        """
        Convert from plotly figure to html that will then be included in the HTML page using Jinja2 template.
        Note: plotly.js is loaded in the template from CDN to reduce file size.
        """
        return pio.to_html(fig, include_plotlyjs=False, full_html=False)

    plots = []
    app = plots.append

    # Use plotly True to generate a matplotlib figure and convert it to plotly automatically.
    kwargs = dict(show=False, plotly=True)

    # This won't work for Si, I have to fix it at the abipy level.
    app(PlotData(
        html=to_html(plotter.plot_radial_wfs(**kwargs)),
        title="AE and PS radial wavefunctions",
        text="These are the radial wavefunctions",
    ))

    app(PlotData(
        html=to_html(plotter.plot_atan_logders(**kwargs)),
        title="Arctan of the logarithmic derivatives",
        text="These are the famous ATAN LOGDERs signaling the presence of ghost states ...",
    ))

    app(PlotData(
        html=to_html(plotter.plot_kene_vs_ecut(**kwargs)),
        title="Convergence in  G-space estimated by ONCVPSP",
        text="kene_vs_ecut ...",
    ))

    app(PlotData(
        html=to_html(plotter.plot_projectors(**kwargs)),
        title="Projectors",
        text="These are the projectors",
    ))

    app(PlotData(
        html=to_html(plotter.plot_potentials(**kwargs)),
        title="Local potential and l -dependent potentials",
        text="These are the potentials",
    ))

    app(PlotData(
        html=to_html(plotter.plot_densities(**kwargs)),
        title="Core-Valence-Model charge densities",
        text="These are the densities",
    ))

    # This only for meta-gga pseudos.
    if parser.is_metapsp:
        app(PlotData(
            html=to_html(plotter.plot_tau(**kwargs)),
            title="Kinetic energy density",
            text="This is tau",
        ))

        app(PlotData(
            html=to_html(plotter.plot_vtau(**kwargs)),
            title="Meta-GGA potential",
            text="This is vtau",
        ))

    # Here we read the json file with the validation results and produce plotly plots.
    # Note that this step is optional as a pseudo migth not have validation results.
    # TODO: Here we need some machinery to produce plotly files from the data read from the JSON file.
    # and the figures should be then injected into the template.

    json_path = out_path.replace(".out", ".djson", 1) # TODO json or djson?
    if os.path.exists(json_path):
        with open(json_path, "rt") as fh:
            results = json.load(fh)
        raise NotImplementedError(f"Don't know how to produce plotly figures from {json_path=}")

    name = os.path.basename(out_path).replace(".out", "")

    html = TEMPLATE.render(
        title=f"Oncvpsp figures for {name} ",
        input_str=parser.get_input_str(),
        plots=plots,
    )

    # Write the HTML file.
    html_path = out_path.replace(".out", ".html", 1)
    with open(html_path, "wt") as f:
        f.write(html)

    return html_path


if __name__ == "__main__":
    import sys
    if len(sys.argv) == 1 or "-h" in sys.argv or "--help" in sys.argv:
        print("This module can be executed as a standalone script to facilitate developments")
        print("Syntax: `python html_tools.py Si.out`")
        sys.exit(1)

    from pathlib import Path
    import webbrowser
    html_path = write_html_from_oncvpsp_outpath(sys.argv[1])
    print(f"Opening {html_path} in browser...")
    webbrowser.open(Path(html_path).resolve().as_uri())
