# pseudodojo_website

Web code for the PseudoDojo website.
This repository provides the `deploy.py` script to fetch tarballs containing pseudopotentials
from github and perform all the operations required to prepare the files that will
be served by the web server.
The repository with the pseudopotentials is supposed to follow certain conventions
(documented in the sections below) and provide medata such as hints for the cutoff energy,
the md5 checksums for each pseudopotential file and tables i.e. list of pseudos recommended for
particular applications.

## How to deploy the website from scratch

Clone this repo on the server then execute the `mkenv.sh` script to create a
conda environment named `pseudodojo_website` in which all the dependendencies will be installed:

    git clone https://github.com/PseudoDojo/pseudodojo_website.git
    ./mkenv.sh

Finally execute:

    ./deploy.py new

to fetch the pseudos from github and create the json files (`files.json` and `targz.json`) required
by the web app.

The `serve.sh` script starts a ligthweight web server that can be used for testing purposes
before going to production.
No changes in the JS/python code are needed when deploying from scratch.

## Conventions assumed by deploy.py

A pseudodojo repository (PD repo for short) contains pseudopotentials generated with the same XC
functional and the same treatment of relativistic effects
(e.g. scalar relativistic or two-component spinor if SOC is wanted).
A PD repo provides pseudopotentials in different formats (e.g. psp8, upf, psml for NC or pawxml, upf for PAW)
and may also store additional files in machine-readable format with the results of the validation tests
(at present this feature is only available for NC pseudos via the djrepo files in json format).

A PD repo shall define a list of tables i.e. a set of pseudopotential files recommended for particular applications.
These tables are declared via `.txt` files located in the top level directory
containing the relative path of the pseudos belonging to the table.
The name of the table is encoded in the file name e.g. `standard.txt`.
Every PD repo shall define a `standard.txt` table and, optionally, a `stringent.txt` version.
Other tables may be added in the future but remember that this requires some modifications of the JS code
that builds the user interface.

The `deploy.py` scripts parses all the `table_name.txt` files found in the top level directory
and creates two dictionaries:

These dictionary are then read by the JS frontend so that we can easily serve files when the user select
an element in the periodic table.

## How to add a new table to a prexistent installation

The list of repositories to be fetched can be found in this section of `deploy.py`.

```python
self.repos = [
    # ONCVPSP repositories.
    _mk_onc(xc_name="PBEsol", relativity_type="SR", version="0.4"),
    _mk_onc(xc_name="PBEsol", relativity_type="FR", version="0.4"),
    _mk_onc(xc_name="PBE", relativity_type="SR", version="0.4"),
    #_mk_onc(xc_name="PBE", relativity_type="FR", version="0.4"),  FIXME: checksum fails
    #
    # JTH repositories.
    _mk_jth(xc_name="LDA", relativity_type="SR", version="1.1"),
    _mk_jth(xc_name="PBE", relativity_type="SR", version="1.1"),
]
```

The url of the tarball file is automatically generated from the values of `xc_name`,
`relativity_type` and `version` using a string pattern (see `from_github` class method for the implementation)
hence it is very important to follow the same convention when creating new pseudopotential repositories on github.

To add a new PD repo to the website, the following operations are required:

- Create a new PD repo following the conventions documented above.
- Add the new PD repo to `self.repos`
- Edit `js/dojo-tools.js` in particular the switch statement in `dynamic_dropdown` to register the new options.
- Finally, execute

        deploy.py update

  to update the installation or use the `new` command to deploy the website from scratch.

## Additional technical details

For the JTH table in pawxml format the hints are extracted from the XML file directly.
Having the hints in the pseudo is clearly nice especially for end-users but this also
implies that the hints cannot be changed without breaking the md5 checksum.
JTH pseudos in UPF format do not provide hints.

In the case of NC pseudos, the hints are stored in a separate json file (djrepo) also because the psp8 format
does not support hints.

For each (NC) pseudo, the web app serves an HTML file with several plots such as radial wavefunctions,
logders, l-dependent potentials, etc.
All these figures can be automatically generated from the output file of oncvpsp so we prefer to generate the HTMl
pages when we prepare the deployment rather than storying a bunch of HTML files in the repo itself.
In the original version of the pseudodojo website we were also showing the results of the different
validation tests (delta-gauge, GBVR benchmark, phonons, ghost test).

The results of these validation tests are stored in the djrepo file.
It seemed like a good idea at the time but there are also several drawbacks that should be taken into account:

1) The size of the djrepo files is not small and this increases the size of the repo.
   Well, per se it is not a problem for the users of the website, but it becomes more problematic
   for users interested in HTC calculations especially if they decide to download
   several repositories for the different XC functionals.

2) Validation tests have been performed only for a small subset of pseudos (mainly SR PBE pseudos)
   for which AE reference results obtained with the same XC functional and similar treatment of relativistic
   effects are available. At this point, I wonder whether it still makes sense to keep on using the djrepo
   If the main goal is finding good hints and making sure that the NLCC does not spoil the converged of FPT phonons,
   we may decide to replace the present approach that requires expensive delta-gauge calculations with something
   lighter that can be possibly executed after the initial pseudopotential generation.
   This new preliinary validation step would require GS-SCF calculation for different ecuts (energy, pressure and perhaps
   forces), followed by DFPT phonons with a 4x4x4 k-mesh or 8x8x8 is system is metallic.

Files with core densities for AIM?
It can be treated as a new format and extracted from the psp8 file by deploy.py
This format is Abinit specific but it can be easily converted to other formats if needed.
