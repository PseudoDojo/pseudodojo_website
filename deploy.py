#!/usr/bin/env python
from __future__ import annotations

import sys
import os
import json


class Repo:
    """
    """

    def __init__(self, name: str, url: str) -> None:
        self.name = name
        self.url = url
        self.root = "FOO"
        self.tables = {}
        #self.xcf
        #self.accuracies = []
        #self.formats = []

    def download(self) -> None:
        # Get the targz from github and unpack it inside `root`
        # TODO

        # Get the list of table names from `tables.txt` and create tar.gz
        self.tables = {}
        with open(os.path.join(self.root, "tables.txt"), "rt") as fh:
            table_names = [f.strip() for f in fh.readlines() if f.strip()]

        for table_name in table_names:
            with open(os.path.join(self.root, table_name), "rt") as fh:
                pseudo_names = [f.strip() for f in fh.readlines() if f.strip()]
                self.tables[table_name] = pseudo_names

    def setup(self) -> None:
        os.mkdir(self.root)

        # Build targz file with all pseudos belongin to table_name
        # so that the user can download it via the web interface.
        for table_name,  pseudo_names in self.tables.items():
            pass


# [typ][xcf][acc][element][fmt]
NAME_URL_LIST = [
    ("nc-sr-04_pbe", ),
    ("nc-fr-04_pbe", ),
    ("nc-sr-04_pbesol", ),
    ("nc-fr-04_pbesol", ),
]

# files[typ][xcf][acc][element][fmt]
# targz[typ][xcf][acc][fmt]

# var url = trunk.concat(typ,"_",xcf,"_",acc,"_",fmt,".tgz");

# if (fmt === 'html'){
#    var url = trunk.concat(typ,"_",xcf,"_",acc,"/",elm,".",fmt);
#    $.get(url)
#      .done(function() {
#        // exists code
#        window.location.href = url;
#      }).fail(function() {
#        // not exists code
#      })}
#  else {
#    var url = trunk.concat(typ,"_",xcf,"_",acc,"/",elm,".",fmt,'.gz');


class Website:
    """
    """

    def __init__(self, root: str, verbose: int) -> None:
        self.root = os.path.abspath(root)
        self.verbose = verbose

        # Create list of repositories.
        self.repos = []
        for name, url in NAME_URL_LIST:
            self.repos.append(Repo(name, url))

    def build(self) -> None:
        #files[typ][xcf][acc][element][fmt]
        #targz[typ][xcf][acc][fmt]
        self.files = {}
        self.targz = {}
        for repo in self.repos:
            repo.download()
            repo.setup()
            #self.files[]
            #self.targz[]

        # Write files.json and targz.json.
        #with open(os.path.join(self.root, "files.json")) as fh:
        #    json.dump(fh, self.files, indent=4, sort_keys=True)

        #with open(os.path.join(self.root, "targz.json")) as fh:
        #    json.dump(fh, self.targz, indent=4, sort_keys=True)

        #make_papers()

    #def update(self) -> None:
    #def update_papers(self) -> None:
    #def check(self) -> None:


def new(options) -> int:
    """
    Deploy new website
    """
    website = Website(".", options.verbose)
    website.build()
    return 0


def update(options) -> int:
    """
    Update pre-existent installation.
    """
    website = Website(".", options.verbose)
    #make_papers()
    return 0


def papers(options) -> int:
    """
    Update the list of papers using PseudoDojo pseudos.
    Generate new papers.html
    """
    #make_papers()
    return 0


def main() -> int:
    """
    Main driver
    """
    return 0


if __name__ == "__main__":
    sys.exit(main())
