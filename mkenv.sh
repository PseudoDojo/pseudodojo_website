#!/bin/bash
env_name="pseudodojo_website"

conda create -n ${env_name} -y
pip install -r requirements.txt
conda activate ${env_name}

# Register the python kernel needed by nbconver.
python -m ipykernel install --name ${env_name}
