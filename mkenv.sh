#!/bin/bash
env_name="pseudodojo_website"

conda create -n ${env_name} -y
pip install -r requirements.txt
conda activate ${env_name}
