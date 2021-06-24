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
            "dataset": "local-authority-district",
            "label": "Local authority districts",
            "checked": True,
            "paint_options": {
              "colour": "#0b0c0c",
              "opacity": "0.1",
              "weight": 5
            }   
        },
        {
            "dataset": "conservation-area",
            "label": "Conservation areas",
            "paint_options": {
              "colour": "#78AA00",
            }
        },
        {
            "dataset": "brownfield-land",
            "label": "Brownfield land",
            "paint_options": {
              "colour": "#0078ff",
            },
            "type": "point",
        },
        {
            "dataset": "parish",
            "label": "Parishes",
            "paint_options": {
              "colour": "#5694ca",
            }
        },
        {
            "dataset": "heritage-coast",
            "label": "Heritage coast",
            "paint_options": {
              "colour": "#912b88",
            }
        },
        {
            "dataset": "area-of-outstanding-natural-beauty",
            "label": "Areas of outstanding natural beauty",
            "paint_options": {
              "colour": "#d53880",
            }
        },
        {
            "dataset": "ancient-woodland",
            "label": "Ancient woodland",
            "paint_options": {
              "colour": "#00703c",
              "opacity": 0.2
            }
        },
        {
          "dataset": "green-belt",
          "label": "Green belt", 
          "paint_options": {
            "colour": "#85994b"
          }
        },
        {
            "dataset": "world-heritage-site",
            "label": "World heritage site",
            "paint_options": {
              "colour": "#012169",
            }
        },
        {
          "dataset": "battlefield",
          "label": "Battlefields",
          "paint_options": {
            "colour": "#4d2942",
            "opacity": 0.2
          }
        },
        {
            "dataset": "park-and-garden",
            "label": "Parks and gardens",
            "paint_options": {
              "colour": "#0EB951",
            }
        },
        {
            "dataset": "protected-wreck-site",
            "label": "Protected wreck sites",
            "paint_options": {
              "colour": "#0b0c0c",
            }
        },
        {
            "dataset": "listed-building",
            "label": "Listed buildings",
            "paint_options": {
              "colour": "#F9C744",
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