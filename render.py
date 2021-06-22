#!/usr/bin/env python3
import os
import sys

from digital_land_frontend.jinja import setup_jinja


def render(path, template, docs="docs", **kwargs):
    path = os.path.join(docs, path)
    directory = os.path.dirname(path)
    if not os.path.exists(directory):
        os.makedirs(directory)
    with open(path, "w") as f:
        print(f"creating {path}")
        f.write(template.render(**kwargs))


env = setup_jinja()
env.globals["includeAutocomplete"] = True

def render_national_map():
    map_template = env.get_template("national-map.html")
    all_layers = [
        # {
        #     "dataset": "local-authority-district",
        #     "label": "Local authority districts",
        #     "checked": True,
        #     "colour": "#EE7800",
        # },
        # {
        #     "dataset": "conservation-area",
        #     "label": "Conservation areas",
        #     "colour": "#78AA00",
        # },
        # {
        #     "dataset": "brownfield-land",
        #     "label": "Brownfield land",
        #     "colour": "#0078ff",
        #     "type": "point",
        # },
        {
            "dataset": "lad",
            "label": "Local authority districts",
            "checked": True,
            "paint_options": {
              "colour": "#0b0c0c",
              "opacity": "0.1",
              "weight": 5
            }   
        },
        {
            "dataset": "conservationarea",
            "label": "Conservation areas",
            "paint_options": {
              "colour": "#78AA00",
            }
        },
        {
            "dataset": "brownfieldland",
            "label": "Brownfield land",
            "paint_options": {
              "colour": "#0078ff",
            },
            "type": "point",
        },
    ]
    render(
        "index.html",
        map_template,
        layers=sorted(
            [l for l in all_layers if l.get("active_zoom_level") is None],
            key=lambda x: x["label"],
        ),
        layers_with_constraint=sorted(
            [l for l in all_layers if l.get("active_zoom_level") is not None],
            key=lambda x: x["label"],
        ),
    )


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--local":
        env.globals["staticPath"] = ""
        env.globals["urlPath"] = ""

    render_national_map()