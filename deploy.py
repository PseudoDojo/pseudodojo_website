#!/usr/bin/env python
from __future__ import annotations

import sys
import os
import argparse
import json
import abc
import hashlib
import requests

from collections import defaultdict
from urllib.parse import urlsplit
#from tqdm import tqdm


NAME_URL_LIST = [
    ("nc-sr-04_pbe", ),
    #("nc-fr-04_pbe", ),
    #("nc-sr-04_pbesol", ),
    #("nc-fr-04_pbesol", ),
]


def download_repo_from_url(url: str, save_dirpath: str,
                           chunk_size: int = 2 * 1024**2, verbose: int = 0) -> None:
    """
    Dowload file from url.

    Args:
        url: The url from which the targz is taken.
        save_dirpath: The directory in which the tarball is unpacked.
        chunk_size: Chunk size used for downloading the file.
        verbose: Verbosity level
    """
    path = urlsplit(url).path
    filename = posixpath.basename(path)
    #print(path, filename)

    # stream = True is required by the iter_content below
    with requests.get(url, stream=True) as r:
        #tmp_dir = tempfile.mkdtemp()
        with tempfile.TemporaryDirectory(suffix=None, prefix=None, dir=None) as tmp_dir:
            tmp_filepath = os.path.join(tmp_dir, filename)
            if verbose:
                print("Writing temporary file:", tmp_filepath)

            total_size_in_bytes = int(r.headers.get('content-length', 0))
            progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True)

            with open(tmp_filepath, 'wb') as fd:
                for chunk in r.iter_content(chunk_size=chunk_size):
                    fd.write(chunk)
                    progress_bar.update(len(chunk))

            progress_bar.close()
            if total_size_in_bytes != 0 and progress_bar.n != total_size_in_bytes:
                raise RuntimeError(f"Something went wrong while donwloading url: {url}")

            shutil.unpack_archive(tmp_filepath, extract_dir=tmp_dir)

            dirpaths = [os.path.join(tmp_dir, basen) for basen in os.listdir(tmp_dir) if basen != filename]

            if len(dirpaths) != 1:
                raise RuntimeError(f"Expecting single directory, got {dirpaths}")
            if not os.path.isdir(dirpaths[0]):
                raise RuntimeError(f"Expecting single directory, got {dirpaths}")

            if verbose: print(f"Moving {dirpaths[0]} to {save_dirpath}")
            shutil.move(dirpaths[0], save_dirpath)


def md5_for_filepath(filepath: str) -> str:
    """
    Compute and return the md5 of a file.
    """
    with open(filepath, "rt") as fh:
        text = fh.read()
        m = hashlib.md5(text.encode("utf-8"))
        return m.hexdigest()


class PseudosRepo(abc.ABC):
    """
    """

    #def __init__(self, name: str, url: str) -> None:
    #    self.name = name
    #    self.url = url
    #    self.xc_name = None
    #    self.ps_generator = "ONCVPSP"
    #    self.workdir = "FOO"
    #    self.formats = ["psp8", "upf", "psml", "html", "djrepo"]

    def __init__(self, ps_generator: str, xc_name: str, relativity_type: str, project_name: str,
                 version: str, url: str):
        """
        Args:
            ps_generator: Name of the pseudopotential generator
            xc_name: XC functional.
            relativity_type: SR for scalar-relativistic or FR for fully relativistic.
            project_name: Name of the project associated to this repository.
            version: Version string.
            url: URL from which the targz will be taken.
        """
        if relativity_type not in {"SR", "FR"}:
            raise ValueError(f"Invalid relativity_type: {relativity_type}")

        self.ps_generator = ps_generator
        self.xc_name = xc_name
        self.version = version
        self.project_name = project_name
        self.relativity_type = relativity_type
        self.url = url

    @property
    def isnc(self) -> bool:
        """True if norm-conserving repo."""
        return self.ps_type == "NC"

    @property
    def ispaw(self) -> bool:
        """True if PAW repo."""
        return self.ps_type == "PAW"

    #####################
    # Abstract interface.
    #####################

    #@abc.abstractmethod
    #def validate_checksums(self, verbose: int) -> None:
    #    """Validate md5 checksums after download."""

    @property
    @abc.abstractmethod
    def ps_type(self) -> str:
        """Pseudopotential type e.g. NC or PAW"""

    @property
    @abc.abstractmethod
    def name(self):
        """The name of repository built from the metadata. Must be unique"""

    @property
    @abc.abstractmethod
    def formats(self):
        """List of file formats provided by the repository."""

    def download(self) -> None:
        """Get the targz from github and unpack it inside `workdir`"""
        download_repo_from_url(self.url, self.name)

    def setup(self) -> None:

        table_paths = [f for f in os.listdir(self.name) if f.endswith(".txt")]
        table_paths = [os.path.join(self.name, t) for t in table_paths]
        assert table_paths

        # Get the list of table names from `tables.txt` and create tar.gz
        self.tables = defaultdict(dict)
        for table_path in table_paths:
            table_name, _ = os.path.splitext(os.path.basename(table_path))
            with open(table_path, "r") as fh:
                relpaths = [f.strip() for f in fh.readlines() if f.strip()]
                relpaths = [os.path.splitext(p)[0] for p in relpaths]
                for ext in self.formats:
                    all_files = [os.path.join(self.name, f"{rpath}.{ext}") for rpath in relpaths]
                    files = list(filter(os.path.isfile, all_files))
                    if len(files) != len(all_files):
                        print(f"{table_path} WARNING: cannot find files with ext: {ext}.",
                              f"expected: {len(all_files)}, found: {len(files)}")
                    self.tables[table_name][ext] = files
                    #print("table:", table_name, "ext:", ext, "\n", self.tables[table_name][ext])

        # Build targz file with all pseudos belonging to table_name
        # so that the user can download it via the web interface.
        import tarfile
        self.targz = defaultdict(dict)
        for table_name, table in self.tables.items():
            for ext, rpaths in table.items():
                if not rpaths: continue
                tar_path = os.path.join(self.name, f"{self.type}_{self.xc_name}_{table_name}_{ext}.tgz")
                print("Creating tarball:", tar_path)
                targz = tarfile.open(tar_path, "w:gz")
                for rpath in rpaths:
                    targz.add(rpath, arcname=os.path.basename(rpath))
                targz.close()
                self.targz[table_name][ext] = tar_path


class OncvpspRepo(PseudosRepo):

    @classmethod
    def from_github(cls, xc_name: str, relativity_type: str, version: str) -> OncvpspRepo:
        """
        Build a OncvpsRepo assuming a github repository.
        """
        ps_generator, project_name = "ONCVPSP", "PD"

        if relativity_type == "FR":
            # https://github.com/PseudoDojo/ONCVPSP-PBE-FR-PDv0.4/archive/refs/heads/master.zip
            sub_url = f"{ps_generator}-{xc_name}-FR-{project_name}v{version}"
        elif relativity_type == "SR":
            # https://github.com/PseudoDojo/ONCVPSP-PBE-PDv0.4/archive/refs/heads/master.zip
            sub_url = f"{ps_generator}-{xc_name}-{project_name}v{version}"
        else:
            raise ValueError(f"Invalid relativity_type {relativity_type}")

        url = f"https://github.com/PseudoDojo/{sub_url}/archive/refs/heads/master.zip"
        return cls(ps_generator, xc_name, relativity_type, project_name, version, url)

    @property
    def ps_type(self) -> str:
        return "NC"

    @property
    def name(self) -> str:
        # ONCVPSP-PBEsol-PDv0.4/
        # ONCVPSP-PBE-FR-PDv0.4/
        return f"{self.ps_generator}-{self.xc_name}-{self.relativity_type}-{self.project_name}v{self.version}"

    @property
    def formats(self):
        return ["psp8", "upf", "psml", "html", "djrepo"]



class JthRepo(PseudosRepo):

    @classmethod
    def from_abinit_website(cls, xc_name: str, relativity_type: str, version: str) -> JthRepo:
        ps_generator, project_name = "ATOMPAW", "JTH"
        # https://www.abinit.org/ATOMICDATA/JTH-LDA-atomicdata.tar.gz
        # ATOMPAW-LDA-JTHv0.4
        url = f"https://www.abinit.org/ATOMICDATA/JTH-{xc_name}-atomicdata.tar.gz"
        return cls(ps_generator, xc_name, relativity_type, project_name, version, url)

    @property
    def ps_type(self) -> str:
        return "PAW"

    @property
    def name(self) -> str:
        # ATOMPAW-LDA-JTHv0.4
        return f"{self.ps_generator}-{self.xc_name}-{self.project_name}v{self.version}"

    def validate_checksums(self, verbose: int) -> None:
        print(f"\nValidating md5 checksums of {repr(self)} ...")
        cprint("WARNING: JTH-PAW repository does not support md5 checksums!!!", color="red")


class Website:
    """
    """

    def __init__(self, workdir: str, verbose: int) -> None:
        self.workdir = os.path.abspath(workdir)
        self.verbose = verbose

        # Create list of repositories.
        _mk_onc = OncvpspRepo.from_github
        _mk_jth = JthRepo.from_abinit_website
        self.repos = [
            #
            # ONCVPSP repositories
            _mk_onc(xc_name="PBEsol", relativity_type="SR", version="0.4"),
            _mk_onc(xc_name="PBEsol", relativity_type="FR", version="0.4"),
            _mk_onc(xc_name="PBE", relativity_type="SR", version="0.4"),
            #_mk_onc(xc_name="PBE", relativity_type="FR", version="0.4"),  FIXME: checksum fails
            #
            # JTH repositories
            #_mk_jth(xc_name="LDA", relativity_type="SR", version="1.1"),
            #_mk_jth(xc_name="PBE", relativity_type="SR", version="1.1"),
        ]
        #for name, url in NAME_URL_LIST:
        #    self.repos.append(Repo(name, url))

        #repo = PseudosRepo(name="foo", url="bar")
        #repo.workdir = "ONCVPSP-PBE-SR-PDv0.4"
        #repo.xc_name = "pbe"
        #repo.type = "nc-sr-04"
        #repo.download()
        #repo.setup()
        #self.repos.append(repo)


    def build(self) -> None:
        # files[typ][xc_name][acc][elm][fmt]
        # targz[typ][xc_name][acc][fmt]
        files = defaultdict(dict)
        targz = defaultdict(dict)
        for repo in self.repos:
            repo.download()
            repo.setup()
            files[repo.type][repo.xc_name] = defaultdict(dict)
            targz[repo.type][repo.xc_name] = defaultdict(dict)
            for table_name, table in repo.tables.items():
                files[repo.type][repo.xc_name][table_name] = defaultdict(dict)
                targz[repo.type][repo.xc_name][table_name] = defaultdict(dict)
                for fmt, rpaths in table.items():
                    # Store the relative location of the targz file
                    if fmt in repo.targz[table_name]:
                        targz[repo.type][repo.xc_name][table_name][fmt] = os.path.relpath(repo.targz[table_name][fmt],
                                                                                      start=self.workdir)

                    for rpath in rpaths:
                        # Get the element symbol from the relative path.
                        if repo.ps_generator == "ONCVPSP":
                            # ONCVPSP-PBE-SR-PDv0.4/Ag/Ag-sp.psp8
                            elm = rpath.split(os.sep)[-2]
                        elif repo.ps_generator == "atompaw":
                            raise NotImplementedError()
                        else:
                            raise ValueError("Invalid value for repo.ps_generator: {repo.ps_generator}")
                        #print(elm)
                        #assert elm in periodic_table

                        files[repo.type][repo.xc_name][table_name][elm][fmt] = rpath

                        if fmt == "djrepo":
                            # Get hints from djrepo file if NC pseudo.
                            # TODO: Extract hints from PAW xml
                            with open(rpath, "r") as fh:
                                hints = json.load(fh)["hints"]
                                d = {"hl": hints["low"]["ecut"],
                                     "hn": hints["normal"]["ecut"],
                                     "hh": hints["high"]["ecut"]}
                                files[repo.type][repo.xc_name][table_name][elm]["meta"] = d
                                #print(d)

        # Write files.json and targz.json.
        with open(os.path.join(self.workdir, "files.json"), "w") as fh:
            json.dump(files, fh, indent=4, sort_keys=True)

        with open(os.path.join(self.workdir, "targz.json"), "w") as fh:
            json.dump(targz, fh, indent=4, sort_keys=True)

        #make_papers()

    #def update(self) -> None:
    #def update_papers(self) -> None:
    #def check(self) -> None:


def new(options) -> int:
    """
    Deploy new website in the current working directory.
    1) download tables from github 2) generate new json files
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

    #repo = PseudosRepo("foo", "bar")
    #repo.workdir = "ONCVPSP-PBE-SR-PDv0.4"
    #repo.download()
    #repo.setup()
    #return 0

    # Dispatch
    return globals()[options.command](options)


if __name__ == "__main__":
    sys.exit(main())
