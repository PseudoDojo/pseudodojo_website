from __future__ import annotations

import os
import json
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

{% for text, fig in zip(oncv_texts, oncv_figures) %}
  <h2>{{ text }}</h2>
  <div class="plot">
    {{ fig | safe }}
  </div>
{% endfor %}

</body>
</html>
"""
)


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

    # Use plotly True to generate a matplotlib figure and convert it to plotly automatically.
    oncv_figures, oncv_texts =  [], []
    kwargs = dict(show=False, plotly=True)

    # This won't work for Si, I have to fix it at the abipy level.
    oncv_texts.append("These are the radial wavefunctions")
    oncv_figures.append(plotter.plot_radial_wfs(**kwargs))

    oncv_texts.append("These are the famous ATAN LOGDERs signaling the presence of ghost states ...")
    oncv_figures.append(plotter.plot_atan_logders(**kwargs))

    oncv_texts.append("kene_vs_ecut ...")
    oncv_figures.append(plotter.plot_kene_vs_ecut(**kwargs))

    oncv_texts.append("These are the projectors")
    oncv_figures.append(plotter.plot_projectors(**kwargs))

    oncv_texts.append("These are the potentials")
    oncv_figures.append(plotter.plot_potentials(**kwargs))

    oncv_texts.append("These are the densities")
    oncv_figures.append(plotter.plot_densities(**kwargs))

    # This only for Meta-gga pseudos.
    if parser.is_metapsp:
        oncv_texts.append("This is tau")
        oncv_figures.append(plotter.plot_tau(**kwargs))

        oncv_texts.append("This is vtau")
        oncv_figures.append(plotter.plot_vtau(**kwargs))

    # Convert from plotly to html that will then be included in the HTML page using Jinja2 template.
    # Note: plotly.js is loaded in the template from CDN to reduce file size.
    oncv_figures = [pio.to_html(fig, include_plotlyjs=False, full_html=False) for fig in oncv_figures]
    #oncv_figures = [pio.to_html(fig, include_plotlyjs=True, full_html=False) for fig in oncv_figures]

    # Here we read the json file with the validation results and produce plotly plots.
    # Note that this step is optional as a pseudo migth not have validation results.
    # TODO: Here we need some machinery to produce plotly files from the data read from the JSON file.
    # and the figures should be then injected into the template.
    results_figures, results_texts = [], []

    json_path = out_path.replace(".out", ".djson", 1) # TODO json or djson?
    if os.path.exists(json_path):
        with open(json_path, "rt") as fh:
            results = json.load(fh)
        raise NotImplementedError(f"Don't know how to produce plotly figures from {json_path=}")


    if len(oncv_figures) != len(oncv_texts):
        raise RuntimeError(f"{len(oncv_figures)=} != {len(oncv_texts)=}")

    name = os.path.basename(out_path).replace(".out", "")

    html = TEMPLATE.render(
        title=f"Oncvpsp figures for {name} ",
        oncv_figures=oncv_figures,
        oncv_texts=oncv_texts,
    )

    # Write the HTML file.
    html_path = out_path.replace(".out", ".html", 1)
    with open(html_path, "wt") as f:
        f.write(html)

    return html_path


if __name__ == "__main__":
    # This module can be executed as a standalone script to facilitate debugging
    # Syntax: `python html_tools.py Si.out`
    import sys
    import webbrowser
    from pathlib import Path
    html_path = write_html_from_oncvpsp_outpath(sys.argv[1])
    print(f"Opening {html_path} in browser...")
    webbrowser.open(Path(html_path).resolve().as_uri())
