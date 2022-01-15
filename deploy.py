#!/usr/bin/env python
from __future__ import annotations

import sys
import os
import argparse
import json

from collections import defaultdict


# [typ][xcf][acc][element][fmt]
NAME_URL_LIST = [
    ("nc-sr-04_pbe", ),
    #("nc-fr-04_pbe", ),
    #("nc-sr-04_pbesol", ),
    #("nc-fr-04_pbesol", ),
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


class Repo:
    """
    """

    def __init__(self, name: str, url: str) -> None:
        self.name = name
        self.url = url
        self.root = "FOO"
        self.xcf = None
        self.kind = "oncvpsp"
        self.formats = ["psp8", "upf", "psml", "html", "djrepo"]

    def download(self) -> None:
        """Get the targz from github and unpack it inside `root`"""
        # TODO
        #from abipy.flowtk. import download_repo_from_url
        #dirpath =
        #download_repo_from_url(url: str, save_dirpath: str)

    def setup(self) -> None:

        table_paths = [f for f in os.listdir(self.root) if f.endswith(".txt")]
        table_paths = [os.path.join(self.root, t) for t in table_paths]
        assert table_paths

        # Get the list of table names from `tables.txt` and create tar.gz
        self.tables = defaultdict(dict)
        for table_path in table_paths:
            table_name, _ = os.path.splitext(os.path.basename(table_path))
            with open(table_path, "r") as fh:
                relpaths = [f.strip() for f in fh.readlines() if f.strip()]
                relpaths = [os.path.splitext(p)[0] for p in relpaths]
                for ext in self.formats:
                    self.tables[table_name][ext] = [f"{rpath}.{ext}" for rpath in relpaths]
                    print("table:", table_name, "ext:", ext, "\n", self.tables[table_name][ext])

        #os.mkdir(self.root)

        # Build targz file with all pseudos belonging to table_name
        # so that the user can download it via the web interface.
        self.targzs = defaultdict(dict)
        for table_name, table in self.tables.items():
            for ext, rpaths in table.items():
                print(ext, rpaths)
                #self.targzs[table_name][ext] =


class Website:
    """
    """

    def __init__(self, root: str, verbose: int) -> None:
        self.root = os.path.abspath(root)
        self.verbose = verbose

        # Create list of repositories.
        self.repos = []
        #for name, url in NAME_URL_LIST:
        #    self.repos.append(Repo(name, url))

        repo = Repo("foo", "bar")
        repo.root = "ONCVPSP-PBE-SR-PDv0.4"
        repo.xcf = "PBE"
        repo.type = "nc-sr-04"
        #repo.download()
        #repo.setup()
        self.repos.append(repo)


    def build(self) -> None:
        # files[typ][xcf][acc][element][fmt]
        # targz[typ][xcf][acc][fmt]
        files = defaultdict(dict)
        targz = defaultdict(dict)
        for repo in self.repos:
            repo.download()
            repo.setup()
            files[repo.type][repo.xcf] = defaultdict(dict)
            targz[repo.type][repo.xcf] = defaultdict(dict)
            for table_name, table in repo.tables.items():
                files[repo.type][repo.xcf][table_name] = defaultdict(dict)
                targz[repo.type][repo.xcf][table_name] = defaultdict(dict)
                for fmt, rpaths in table.items():
                    #self.targz[repo.type][repo.xcf][table_name][fmt] = repo.targz[table_name][fmt]
                    for rpath in rpaths:
                        # Get the element symbol from the relative path.
                        if repo.kind == "oncvpsp":
                            elm, _ = os.path.split(rpath)
                        elif repo.kind == "atompaw":
                            raise NotImplementedError()
                        else:
                            raise ValueError("Invalid value for repo.kind: {repo.kind}")
                        #print(elm)
                        #assert elm in periodic_table

                        files[repo.type][repo.xcf][table_name][elm][fmt] = rpath

                        if fmt == "djrepo":
                            # Get hints from djrepo file if NC pseudo.
                            # TODO: Extract hints from PAW xml
                            with open(os.path.join(repo.root, rpath), "r") as fh:
                                hints = json.load(fh)["hints"]
                                #print(hints)
                                files[repo.type][repo.xcf][table_name][elm]["hints"] = hints

        # Write files.json and targz.json.
        with open(os.path.join(self.root, "files.json"), "w") as fh:
            json.dump(files, fh, indent=4, sort_keys=True)

        with open(os.path.join(self.root, "targz.json"), "w") as fh:
            json.dump(targz, fh, indent=4, sort_keys=True)

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



def get_epilog() -> str:
    usage = """\

Usage example:

  deploy.py new           =>
  deploy.py update        =>
"""


    return usage


def get_parser(with_epilog=False):

    # Parent parser for common options.
    copts_parser = argparse.ArgumentParser(add_help=False)
    copts_parser.add_argument('-v', '--verbose', default=0, action='count', # -vv --> verbose=2
        help='verbose, can be supplied multiple times to increase verbosity.')
    #copts_parser.add_argument('--loglevel', default="ERROR", type=str,
    #    help="Set the loglevel. Possible values: CRITICAL, ERROR (default), WARNING, INFO, DEBUG.")

    # Build the main parser.
    parser = argparse.ArgumentParser(epilog=get_epilog() if with_epilog else "",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('flowdir', nargs="?", help=("File or directory containing the ABINIT flow/work/task. "
                                                    "If not given, the flow in the current workdir is selected."))
    #parser.add_argument('-V', '--version', action='version', version=abilab.__version__)

    # Create the parsers for the sub-commands
    subparsers = parser.add_subparsers(dest='command', help='sub-command help', description="Valid subcommands")

    # Subparser for new command.
    p_new = subparsers.add_parser('new', parents=[copts_parser], help="Deploy website from scratch.")

    # Subparser for rapid command.
    #p_rapid = subparsers.add_parser('rapid', parents=[copts_parser], help="Run all tasks in rapidfire mode.")
    #p_rapid.add_argument('-m', '--max-nlaunch', default=10, type=int,
    #    help="Maximum number of launches. default: 10. Use -1 for no limit.")

    ## Subparser for scheduler command.
    #p_scheduler = subparsers.add_parser('scheduler', parents=[copts_parser],
    #    help="Run all tasks with a Python scheduler. Requires scheduler.yml either in $PWD or ~/.abinit/abipy.")
    #p_scheduler.add_argument('-w', '--weeks', default=0, type=int, help="Number of weeks to wait.")
    #p_scheduler.add_argument('-d', '--days', default=0, type=int, help="Number of days to wait.")

    return parser


def main():

    def show_examples_and_exit(err_msg=None, error_code=1):
        """Display the usage of the script."""
        sys.stderr.write(get_epilog())
        if err_msg: sys.stderr.write("Fatal Error\n" + err_msg + "\n")
        sys.exit(error_code)

    parser = get_parser(with_epilog=True)

    # Parse command line.
    try:
        options = parser.parse_args()
    except Exception as exc:
        show_examples_and_exit(error_code=1)

    if not options.command:
        show_examples_and_exit(error_code=1)

    # loglevel is bound to the string value obtained from the command line argument.
    # Convert to upper case to allow the user to specify --loglevel=DEBUG or --loglevel=debug
    #import logging
    #numeric_level = getattr(logging, options.loglevel.upper(), None)
    #if not isinstance(numeric_level, int):
    #    raise ValueError('Invalid log level: %s' % options.loglevel)
    #logging.basicConfig(level=numeric_level)

    if options.verbose > 2:
        print(options)

    #repo = Repo("foo", "bar")
    #repo.root = "ONCVPSP-PBE-SR-PDv0.4"
    #repo.download()
    #repo.setup()
    #return 0

    # Dispatch
    return globals()[options.command](options)


if __name__ == "__main__":
    sys.exit(main())
