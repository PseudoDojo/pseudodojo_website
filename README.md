# pseudodojo_website

Web code for the PseudoDojo website.
This repository provides the `deploy.py` python script to fetch tarball files with the pseudopotential from
github and perform all the operations required to build the files that will be served by the website.

## How to deploy the website from scratch

Clone the repo on the server, create a python virtual env with e.g. conda 
and install the dependendencies with:

    pip install -r requirements.txt

then execute:

    ./deploy.py new

to fetch the pseudos from github and create the json files (`files.json` and `targz.json`) required
by the web app.
The serve.sh shell script starts a ligthweight web server that can be used for testing purposes 
before going to production.
No changes in the JS/python code are needed when deploying from scratch.

## Conventions assumed by deploy.py

A pseudodojo repository (PD repo for short) contains pseudopotential files generated with the same XC 
functional and the same treatment of relativistic effects (e.g. scalar relativistic or two-component spinor).
A PD repo provides pseudopotential in different formats (e.g. psp8, upf, psml for NC or pawxml, upf for PAW)
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
hence it is very important to follow the the same convention when creating new pseudopotential repositories on github.

To add a new PD repo to the website, the following operations are required:

- Create a new PD repo following the conventions documented above.
- Add the new PD repo to `self.repos`
- Edit `js/dojo-tools.js` in particular the switch statement in `dynamic_dropdown` to register the new options.
- Finally, execute

        deploy.py update

  to update the installation or use the `new` command to deploy the webiste from scratch.
